MODEL (
  name sec_edgar.startup_companies_enriched,
  kind FULL,
  grain cik,
  description 'VC deal-flow table: one row per startup_universe company enriched with the best validated LinkedIn and Crunchbase profiles (Bright Data) and Google funding press. Profiles are scored against the SEC filing; li_/cb_match_confidence is high (>= 3) or medium (>= 1.5) and weaker matches are dropped.',
  audits (unique_values(columns := (cik)))
);

WITH u AS (
  SELECT
    *,
    LOWER(city) AS sec_city,
    LOWER(state_or_country_desc) AS sec_state_name
  FROM sec_edgar.startup_universe
), li_scored AS (
  SELECT
    l.*,
    NULLIF(REGEXP_EXTRACT(LOWER(l.li_url), 'linkedin\.com/company/([^/?#]+)', 1), '') AS li_slug,
    CASE WHEN l.match_method = 'serp_url' THEN 3 ELSE 1 END
    + CASE
      WHEN l.li_headquarters IS NULL THEN 0
      WHEN STRPOS(LOWER(l.li_headquarters), u.sec_city) > 0
      OR STRPOS(LOWER(l.li_headquarters), u.sec_state_name) > 0
      OR REGEXP_MATCHES(l.li_headquarters, ',\s*' || u.state_or_country || '\b') THEN 2
      WHEN u.state_or_country = 'DE' THEN 0
      ELSE -1
    END
    + CASE WHEN l.li_country_code IS NOT NULL AND STRPOS(l.li_country_code, 'US') = 0 THEN -3 ELSE 0 END
    + CASE
      WHEN l.li_founded IS NULL THEN 0
      WHEN l.li_founded BETWEEN u.year_of_inc - 4 AND u.year_of_inc + 1 THEN 1
      WHEN l.li_founded < u.year_of_inc - 8 THEN -2
      ELSE 0
    END
    + CASE
      WHEN l.li_organization_type IN ('Nonprofit', 'Educational', 'Government Agency', 'Self-Employed') THEN -3
      WHEN l.li_organization_type = 'Self-Owned' THEN -1
      ELSE 0
    END
    + CASE WHEN l.li_followers >= 100 THEN 0.5 ELSE 0 END AS li_match_score
  FROM sec_edgar.bd_linkedin_companies AS l
  JOIN u
    ON u.cik = l.cik
  WHERE
    l.error IS NULL AND l.li_name IS NOT NULL
), li AS (
  SELECT
    *
  FROM li_scored
  WHERE
    li_match_score >= 1.5
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY cik ORDER BY li_match_score DESC, li_followers DESC NULLS LAST) = 1
), cb_scored AS (
  SELECT
    c.*,
    CASE WHEN c.match_method = 'profile_url' THEN 3 ELSE 1 END
    + CASE
      WHEN NOT li.li_crunchbase_url IS NULL
      AND REGEXP_EXTRACT(LOWER(li.li_crunchbase_url), 'organization/([^/?#]+)', 1) = LOWER(c.cb_id) THEN 3
      ELSE 0
    END
    + CASE
      WHEN NOT li.li_slug IS NULL
      AND REGEXP_EXTRACT(LOWER(c.cb_linkedin_url), 'linkedin\.com/company/([^/?#]+)', 1) = li.li_slug THEN 3
      ELSE 0
    END
    + CASE
      WHEN c.cb_location IS NULL THEN 0
      WHEN STRPOS(LOWER(c.cb_location), u.sec_city) > 0 OR STRPOS(LOWER(c.cb_location), u.sec_state_name) > 0 THEN 2
      WHEN u.state_or_country = 'DE' THEN 0
      ELSE -1
    END
    + CASE
      WHEN NOT c.cb_country_code IS NULL AND NOT UPPER(c.cb_country_code) IN ('US', 'USA') THEN -3
      WHEN NOT c.cb_location IS NULL AND STRPOS(LOWER(c.cb_location), 'united states') = 0 THEN -3
      ELSE 0
    END
    + CASE
      WHEN TRY_CAST(SUBSTR(c.cb_founded_date, 1, 4) AS INT) IS NULL THEN 0
      WHEN TRY_CAST(SUBSTR(c.cb_founded_date, 1, 4) AS INT) BETWEEN u.year_of_inc - 4 AND u.year_of_inc + 1 THEN 1
      WHEN TRY_CAST(SUBSTR(c.cb_founded_date, 1, 4) AS INT) < u.year_of_inc - 8 THEN -2
      ELSE 0
    END
    + CASE WHEN c.cb_operating_status = 'closed' THEN -1 ELSE 0 END AS cb_match_score
  FROM sec_edgar.bd_crunchbase_companies AS c
  JOIN u
    ON u.cik = c.cik
  LEFT JOIN li
    ON li.cik = c.cik
  WHERE
    c.error IS NULL AND c.cb_name IS NOT NULL
), cb AS (
  SELECT
    *,
    CAST(
      REGEXP_EXTRACT_ALL(COALESCE(cb_funding_rounds_list_json, ''), '"money_raised": \{[^}]*"value_usd": ([0-9.]+)', 1) AS DOUBLE[]
    ) AS round_amounts
  FROM cb_scored
  WHERE
    cb_match_score >= 1.5
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY cik ORDER BY cb_match_score DESC, cb_rank ASC NULLS LAST) = 1
), ws AS (
  SELECT
    cik,
    error AS search_error,
    result_titles,
    top_stories,
    snippets,
    REGEXP_MATCHES(
      COALESCE(result_titles, '') || ' ' || COALESCE(top_stories, '') || ' ' || COALESCE(snippets, ''),
      '(?i)\b(raises|raised|secures|closes|lands|announces)\b[^.|]{0,80}\b(seed|series [a-h]|round|funding|financing)\b'
    ) AS has_funding_press,
    NULLIF(
      REGEXP_EXTRACT(COALESCE(result_titles, '') || ' ' || COALESCE(top_stories, ''), '(?i)\b(pre-seed|seed|series [a-h])\b', 1),
      ''
    ) AS press_round_label,
    NULLIF(
      REGEXP_EXTRACT(
        COALESCE(top_stories, '') || ' || ' || COALESCE(result_titles, ''),
        '(?i)(\$[0-9][0-9,.]*\s*(?:M|B|K|million|billion)\b[^|]{0,60})',
        1
      ),
      ''
    ) AS press_headline_amount
  FROM sec_edgar.bd_serp_funding
), li_funding AS (
  SELECT
    cik,
    li_funding_json ->> '$.last_round_type' AS li_last_round_type,
    li_funding_json ->> '$.last_round_raised' AS li_last_round_raised,
    TRY_CAST(SUBSTR(li_funding_json ->> '$.last_round_date', 1, 10) AS DATE) AS li_last_round_date,
    TRY_CAST(li_funding_json ->> '$.rounds' AS INT) AS li_funding_rounds
  FROM li
), li_funding_usd AS (
  SELECT
    *,
    TRY_CAST(
      NULLIF(REGEXP_EXTRACT(REPLACE(li_last_round_raised, ',', ''), '([0-9]+(?:\.[0-9]+)?)', 1), '') AS DOUBLE
    ) * CASE UPPER(REGEXP_EXTRACT(li_last_round_raised, '[0-9.]+\s*([KMB])', 1))
      WHEN 'K' THEN 1e3
      WHEN 'M' THEN 1e6
      WHEN 'B' THEN 1e9
      ELSE 1
    END AS li_last_round_raised_usd
  FROM li_funding
)
SELECT
  u.universe_rank,
  u.cik,
  u.company_name,
  u.company_search_name,
  u.city,
  u.state_or_country,
  u.state_or_country_desc,
  u.jurisdiction_of_inc,
  u.year_of_inc,
  u.company_age_years,
  u.sector,
  u.industry_group,
  u.revenue_range,
  u.num_offerings,
  u.num_filings,
  u.first_filing_date,
  u.latest_filing_date,
  u.days_since_last_filing,
  u.total_raised_usd,
  u.total_sought_usd,
  u.total_investors,
  u.open_offerings,
  u.open_remaining_usd,
  u.latest_offering_id,
  u.latest_round_filed_date,
  u.latest_round_first_sale_date,
  u.latest_round_security_type,
  u.latest_round_target_usd,
  u.latest_round_sold_usd,
  u.latest_round_remaining_usd,
  u.latest_round_investors,
  u.latest_round_size_bucket,
  u.latest_round_is_open,
  u.ever_used_intermediary,
  u.ever_506c,
  u.num_insiders,
  u.ceo_founders,
  u.insiders,
  u.has_repeat_insider,
  u.vc_signal_score,
  u.latest_filing_url,
  u.edgar_company_url,
  li.li_url AS linkedin_url,
  li.source AS li_source,
  li.li_match_score,
  CASE WHEN li.li_match_score >= 3 THEN 'high' WHEN li.li_match_score >= 1.5 THEN 'medium' END AS li_match_confidence,
  li.li_name,
  li.li_slogan,
  li.li_about,
  li.li_website,
  li.li_industries,
  li.li_specialties,
  li.li_headquarters,
  li.li_country_code,
  li.li_founded,
  li.li_organization_type,
  li.li_company_size,
  li.li_followers,
  li.li_employees_on_linkedin,
  lf.li_last_round_type,
  lf.li_last_round_raised,
  lf.li_last_round_raised_usd,
  lf.li_last_round_date,
  lf.li_funding_rounds,
  li.li_investors_json,
  cb.cb_url AS crunchbase_url,
  cb.source AS cb_source,
  cb.cb_match_score,
  CASE WHEN cb.cb_match_score >= 3 THEN 'high' WHEN cb.cb_match_score >= 1.5 THEN 'medium' END AS cb_match_confidence,
  cb.cb_name,
  cb.cb_about,
  cb.cb_full_description,
  cb.cb_industries,
  cb.cb_operating_status,
  cb.cb_company_type,
  cb.cb_founded_date,
  cb.cb_num_employees,
  cb.cb_location,
  cb.cb_website,
  cb.cb_rank,
  cb.cb_heat_score,
  cb.cb_heat_trend,
  cb.cb_growth_score,
  cb.cb_growth_trend,
  cb.cb_activity_level,
  cb.cb_monthly_visits,
  cb.cb_monthly_visits_growth,
  cb.cb_num_investors,
  cb.cb_num_news,
  COALESCE(
    TRY_CAST(cb.cb_funds_total_json ->> '$.value_usd' AS DOUBLE),
    NULLIF(LIST_SUM(cb.round_amounts), 0)
  ) AS cb_total_funding_usd,
  LIST_MAX(cb.round_amounts) AS cb_largest_round_usd,
  NULLIF(
    ARRAY_TO_STRING(
      LIST_DISTINCT(REGEXP_EXTRACT_ALL(COALESCE(cb.cb_funding_rounds_list_json, ''), '"name": "([^"]+)", "permalink"', 1)),
      '; '
    ),
    ''
  ) AS cb_lead_investors,
  NULLIF(
    ARRAY_TO_STRING(
      LIST_DISTINCT(REGEXP_EXTRACT_ALL(COALESCE(cb.cb_investors_json, ''), '"investor": \{"id": "([^"]+)"', 1)),
      '; '
    ),
    ''
  ) AS cb_investors,
  cb.cb_funding_rounds_json ->> '$.last_funding_type' AS cb_last_funding_type,
  TRY_CAST(SUBSTR(cb.cb_funding_rounds_json ->> '$.last_funding_at', 1, 10) AS DATE) AS cb_last_funding_at,
  TRY_CAST(cb.cb_funding_rounds_json ->> '$.num_funding_rounds' AS INT) AS cb_num_funding_rounds,
  cb.cb_investors_json,
  cb.cb_founders_json,
  cb.cb_funds_total_json,
  cb.cb_funding_rounds_json,
  cb.cb_funding_rounds_list_json,
  ws.has_funding_press,
  ws.press_round_label,
  ws.press_headline_amount,
  ws.top_stories AS press_top_stories,
  ws.result_titles AS press_result_titles,
  COALESCE(li.li_website, cb.cb_website) AS website,
  CASE
    WHEN NOT li.li_followers IS NULL AND u.total_raised_usd > 0
    THEN CAST(li.li_followers AS DOUBLE) / (u.total_raised_usd / 1e6)
  END AS li_followers_per_million_raised,
  NOT li.cik IS NULL AS has_linkedin_profile,
  NOT cb.cik IS NULL AS has_crunchbase_profile,
  NOT ws.cik IS NULL AND ws.search_error IS NULL AS was_searched,
  u.total_raised_usd >= 1000000
  AND cb.cik IS NULL
  AND lf.li_last_round_type IS NULL
  AND NOT ws.cik IS NULL
  AND ws.search_error IS NULL
  AND NOT COALESCE(ws.has_funding_press, FALSE) AS is_under_the_radar,
  CASE
    WHEN ws.cik IS NULL OR NOT ws.search_error IS NULL
    THEN 'not searched'
    WHEN COALESCE(ws.has_funding_press, FALSE)
    THEN 'press found'
    ELSE 'no press found: SEC-only signal'
  END AS filing_vs_press
FROM u
LEFT JOIN li
  ON li.cik = u.cik
LEFT JOIN li_funding_usd AS lf
  ON lf.cik = u.cik
LEFT JOIN cb
  ON cb.cik = u.cik
LEFT JOIN ws
  ON ws.cik = u.cik
