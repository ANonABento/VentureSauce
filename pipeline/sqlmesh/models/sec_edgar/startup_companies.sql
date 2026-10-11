MODEL (
  name sec_edgar.startup_companies,
  kind FULL,
  grain cik,
  description 'One row per startup issuer (CIK): profile, Form D funding totals, latest round, open rounds, leadership and a VC signal score.',
  audits (unique_values(columns := (cik)))
);

WITH agg AS (
  SELECT
    cik,
    MAX_BY(company_name, latest_filing_date) AS company_name,
    MAX_BY(city, latest_filing_date) AS city,
    MAX_BY(state_or_country, latest_filing_date) AS state_or_country,
    MAX_BY(state_or_country_desc, latest_filing_date) AS state_or_country_desc,
    MAX_BY(jurisdiction_of_inc, latest_filing_date) AS jurisdiction_of_inc,
    MAX(year_of_inc) AS year_of_inc,
    MAX_BY(year_of_inc_choice, latest_filing_date) AS year_of_inc_choice,
    MAX_BY(sector, latest_filing_date) AS sector,
    MAX_BY(industry_group, latest_filing_date) AS industry_group,
    MAX_BY(revenue_range, latest_filing_date) AS revenue_range,
    COUNT(*) AS num_offerings,
    SUM(filings_in_offering) AS num_filings,
    MIN(original_filing_date) AS first_filing_date,
    MAX(latest_filing_date) AS latest_filing_date,
    SUM(COALESCE(total_amount_sold_usd, 0)) AS total_raised_usd,
    SUM(COALESCE(total_offering_amount_usd, 0)) AS total_sought_usd,
    SUM(COALESCE(num_investors, 0)) AS total_investors,
    COUNT(*) FILTER(WHERE is_open_round) AS open_offerings,
    SUM(CASE WHEN is_open_round THEN COALESCE(total_remaining_usd, 0) ELSE 0 END) AS open_remaining_usd,
    MAX_BY(offering_id, original_filing_date) AS latest_offering_id,
    MAX(original_filing_date) AS latest_round_filed_date,
    MAX_BY(first_sale_date, original_filing_date) AS latest_round_first_sale_date,
    MAX_BY(security_type, original_filing_date) AS latest_round_security_type,
    MAX_BY(total_offering_amount_usd, original_filing_date) AS latest_round_target_usd,
    MAX_BY(total_amount_sold_usd, original_filing_date) AS latest_round_sold_usd,
    MAX_BY(total_remaining_usd, original_filing_date) AS latest_round_remaining_usd,
    MAX_BY(num_investors, original_filing_date) AS latest_round_investors,
    MAX_BY(round_size_bucket, original_filing_date) AS latest_round_size_bucket,
    MAX_BY(is_open_round, original_filing_date) AS latest_round_is_open,
    MAX_BY(filing_url, latest_filing_date) AS latest_filing_url,
    MAX_BY(edgar_company_url, latest_filing_date) AS edgar_company_url,
    BOOL_OR(used_intermediary) AS ever_used_intermediary,
    BOOL_OR(is_general_solicitation_506c) AS ever_506c
  FROM sec_edgar.startup_rounds
  GROUP BY
    cik
), ppl AS (
  SELECT
    cik,
    COUNT(*) AS num_insiders,
    ARRAY_TO_STRING(
      LIST_SLICE(
        LIST(full_name || COALESCE(' (' || latest_title || ')', '') ORDER BY last_seen_date DESC) FILTER(WHERE is_ceo_or_founder),
        1,
        3
      ),
      '; '
    ) AS ceo_founders,
    ARRAY_TO_STRING(LIST_SLICE(LIST(full_name ORDER BY last_seen_date DESC), 1, 8), '; ') AS insiders,
    BOOL_OR(is_repeat_insider) AS has_repeat_insider
  FROM sec_edgar.startup_people
  GROUP BY
    cik
)
SELECT
  a.cik,
  a.company_name,
  TRIM(
    REGEXP_REPLACE(
      a.company_name,
      '(?i)([,.]\s*|\s+)(inc|incorporated|corp|corporation|co|company|ltd|limited|llc|plc|pbc|s\.a|ag|gmbh)\.?\s*(/[a-z]{2}/?|\\[a-z]{2})?\s*$',
      ''
    )
  ) AS company_search_name,
  a.city,
  a.state_or_country,
  a.state_or_country_desc,
  a.jurisdiction_of_inc,
  a.year_of_inc,
  a.year_of_inc_choice,
  CASE WHEN a.year_of_inc IS NOT NULL THEN YEAR(CURRENT_DATE) - a.year_of_inc END AS company_age_years,
  a.sector,
  a.industry_group,
  a.revenue_range,
  a.num_offerings,
  a.num_filings,
  a.first_filing_date,
  a.latest_filing_date,
  DATE_DIFF('day', a.latest_filing_date, CURRENT_DATE) AS days_since_last_filing,
  a.total_raised_usd,
  a.total_sought_usd,
  a.total_investors,
  a.open_offerings,
  a.open_remaining_usd,
  a.latest_offering_id,
  a.latest_round_filed_date,
  a.latest_round_first_sale_date,
  a.latest_round_security_type,
  a.latest_round_target_usd,
  a.latest_round_sold_usd,
  a.latest_round_remaining_usd,
  a.latest_round_investors,
  a.latest_round_size_bucket,
  a.latest_round_is_open,
  a.ever_used_intermediary,
  a.ever_506c,
  p.num_insiders,
  p.ceo_founders,
  p.insiders,
  COALESCE(p.has_repeat_insider, FALSE) AS has_repeat_insider,
  (
    CASE
      WHEN DATE_DIFF('day', a.latest_filing_date, CURRENT_DATE) <= 90 THEN 25
      WHEN DATE_DIFF('day', a.latest_filing_date, CURRENT_DATE) <= 180 THEN 15
      ELSE 0
    END
    + CASE
      WHEN a.total_raised_usd >= 20000000 THEN 20
      WHEN a.total_raised_usd >= 5000000 THEN 15
      WHEN a.total_raised_usd >= 1000000 THEN 8
      ELSE 0
    END
    + CASE WHEN a.num_offerings >= 2 THEN 15 ELSE 0 END
    + CASE WHEN a.latest_round_is_open THEN 10 ELSE 0 END
    + CASE WHEN a.sector IN ('Technology', 'Bio & Health', 'Energy & Climate') THEN 10 ELSE 0 END
    + CASE WHEN a.year_of_inc >= YEAR(CURRENT_DATE) - 3 THEN 10 ELSE 0 END
    + CASE WHEN COALESCE(p.has_repeat_insider, FALSE) THEN 5 ELSE 0 END
    + CASE WHEN a.total_investors >= 10 THEN 5 ELSE 0 END
  ) AS vc_signal_score,
  a.latest_filing_url,
  a.edgar_company_url
FROM agg AS a
LEFT JOIN ppl AS p
  ON p.cik = a.cik
