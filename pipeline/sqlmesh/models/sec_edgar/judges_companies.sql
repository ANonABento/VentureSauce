MODEL (
  name sec_edgar.judges_companies,
  kind FULL,
  grain company,
  description 'Curated profiles for the Talk to Users hackathon judges'' and mentors'' companies plus proxy companies, hand-mapped to exact LinkedIn, Crunchbase and SEC identifiers, enriched from Bright Data and Form D, with a trust score for how well the data is corroborated.',
  audits (unique_values(columns := (company)))
);

WITH curated(company, judge, judge_connection, relation, proxy_for, category, website, linkedin_url, crunchbase_url, sec_cik, ticker) AS (
  VALUES
    ('Base44', 'Ore Segal', 'Current company (community / growth, runs Base44 build nights)', 'judge company', NULL, 'AI app builder (vibe coding)', 'https://base44.com', 'https://www.linkedin.com/company/base44', 'https://www.crunchbase.com/organization/base44', NULL, NULL),
    ('Wix', 'Ore Segal', 'Parent company of Base44 (acquired 2025)', 'parent company', 'Base44', 'Website builder (public)', 'https://www.wix.com', 'https://www.linkedin.com/company/wix-com', 'https://www.crunchbase.com/organization/wix', '0001576789', 'WIX'),
    ('VU Venture Partners', 'Ore Segal', 'Venture Partner since Sep 2025', 'judge company', NULL, 'Venture capital (multi-stage)', 'https://www.vuventurepartners.com', 'https://www.linkedin.com/company/vu-venture-partners', 'https://www.crunchbase.com/organization/vu-venture-partners', NULL, NULL),
    ('Tailor Brands', 'Ore Segal', 'Former intern (AI business-mentor agent research)', 'judge company', NULL, 'AI branding & business formation', 'https://www.tailorbrands.com', 'https://www.linkedin.com/company/tailor-brands', 'https://www.crunchbase.com/organization/tailor-brands', NULL, NULL),
    ('Momentum Start-Up Accelerator', 'Ore Segal', 'Reichman University accelerator (Ore studied at Reichman)', 'judge company', NULL, 'University startup accelerator (Israel)', 'https://www.momentumaccelerator.com', 'https://www.linkedin.com/company/momentum-startup-accelerator', NULL, NULL, NULL),
    ('Pavoot', 'Ana Yoon Faria de Lima', 'Co-founder & CTO (YC P26)', 'judge company', NULL, 'AI agent for in-person events', 'https://pavoot.com', 'https://www.linkedin.com/company/pavoot', 'https://www.crunchbase.com/organization/pavoot', NULL, NULL),
    ('KOF Swiss Economic Institute (ETH Zurich)', 'Ana Yoon Faria de Lima', 'Past role (ETH Zurich; Ana did her master''s at ETH)', 'judge company', NULL, 'Economic research institute', 'https://kof.ethz.ch/en/', 'https://www.linkedin.com/company/kof-swiss-economic-institute', NULL, NULL, NULL),
    ('Itaú Unibanco', 'Ana Yoon Faria de Lima', 'Past role', 'judge company', NULL, 'Bank (public, Brazil)', 'https://www.itau.com.br', 'https://www.linkedin.com/company/itau', 'https://www.crunchbase.com/organization/banco-itau', '0001132597', 'ITUB'),
    ('University of São Paulo (USP)', 'Ana Yoon Faria de Lima', 'Education', 'judge company', NULL, 'University', 'https://www5.usp.br', 'https://www.linkedin.com/school/universidade-de-sao-paulo', 'https://www.crunchbase.com/organization/universidade-de-so-paulo', NULL, NULL),
    ('Eindhoven University of Technology (TU/e)', 'Ana Yoon Faria de Lima', 'Education / exchange', 'judge company', NULL, 'University', 'https://www.tue.nl/en/', 'https://www.linkedin.com/school/eindhoven-university-of-technology/', 'https://www.crunchbase.com/organization/eindhoven-university-of-technology', NULL, NULL),
    ('Athena', 'Kieran John Keenan', 'CTO (a16z speedrun SR007), building the agent-native law firm', 'judge company', NULL, 'AI-native law firm', 'https://www.athena.lawyer', 'https://www.linkedin.com/company/athena-lawyer', 'https://www.crunchbase.com/organization/athena-law', NULL, NULL),
    ('Legora', 'Kieran John Keenan', 'Previously Member of Technical Staff', 'judge company', NULL, 'Legal AI platform', 'https://legora.com', 'https://www.linkedin.com/company/wearelegora', 'https://www.crunchbase.com/organization/leya-876d', '0002071663', NULL),
    ('Nemoest', 'Kieran John Keenan', 'Earlier venture (Oslo; Kieran studied at the University of Oslo)', 'judge company', NULL, 'Consumer legal access ("make law understandable, affordable")', 'https://nemoest.com', 'https://www.linkedin.com/company/nemoest', 'https://www.crunchbase.com/organization/nemoest', NULL, NULL),
    ('Fromber', 'Kieran John Keenan', 'Earlier venture (Oslo)', 'judge company', NULL, 'Technology venture (Oslo)', 'https://www.fromber.com', 'https://www.linkedin.com/company/fromber', 'https://www.crunchbase.com/organization/fromber', NULL, NULL),
    ('Lovable', 'Ore Segal', NULL, 'proxy', 'Base44', 'AI app builder (vibe coding)', 'https://lovable.dev', 'https://www.linkedin.com/company/lovable-dev', 'https://www.crunchbase.com/organization/lovable-cba3', '0002055162', NULL),
    ('Bolt.new (StackBlitz)', 'Ore Segal', NULL, 'proxy', 'Base44', 'AI app builder (vibe coding)', 'https://bolt.new', 'https://www.linkedin.com/company/stackblitz', 'https://www.crunchbase.com/organization/stackblitz', NULL, NULL),
    ('Looka', 'Ore Segal', NULL, 'proxy', 'Tailor Brands', 'AI branding & logo design', 'https://looka.com', 'https://www.linkedin.com/company/looka', 'https://www.crunchbase.com/organization/looka', NULL, NULL),
    ('ZenBusiness', 'Ore Segal', NULL, 'proxy', 'Tailor Brands', 'Business formation platform', 'https://www.zenbusiness.com', 'https://www.linkedin.com/company/zenbusiness-pbc', 'https://www.crunchbase.com/organization/zenbusiness', '0001667806', NULL),
    ('Partiful', 'Ana Yoon Faria de Lima', NULL, 'proxy', 'Pavoot', 'Event invites & RSVPs', 'https://partiful.com', 'https://www.linkedin.com/company/partiful', 'https://www.crunchbase.com/organization/partiful', NULL, NULL),
    ('Luma', 'Ana Yoon Faria de Lima', NULL, 'proxy', 'Pavoot', 'Event pages & ticketing', 'https://lu.ma', 'https://www.linkedin.com/company/luma-hq', 'https://www.crunchbase.com/organization/zmurl', NULL, NULL),
    ('Nubank', 'Ana Yoon Faria de Lima', NULL, 'proxy', 'Itaú Unibanco', 'Digital bank (public, Brazil)', 'https://nubank.com.br', 'https://www.linkedin.com/company/nubank', 'https://www.crunchbase.com/organization/nu-holdings', '0001691493', 'NU'),
    ('Harvey', 'Kieran John Keenan', NULL, 'proxy', 'Legora', 'Legal AI platform', 'https://www.harvey.ai', 'https://www.linkedin.com/company/harvey-ai', 'https://www.crunchbase.com/organization/harvey-128b', '0001974654', NULL),
    ('Luminance', 'Kieran John Keenan', NULL, 'proxy', 'Legora', 'Legal AI (contracts)', 'https://www.luminance.com', 'https://www.linkedin.com/company/luminancetech', 'https://www.crunchbase.com/organization/luminance', NULL, NULL),
    ('GC AI', 'Kieran John Keenan', NULL, 'proxy', 'Athena', 'Legal AI for in-house counsel', 'https://gc.ai', 'https://www.linkedin.com/company/gc-ai', 'https://www.crunchbase.com/organization/general-counsel-ai', '0002036281', NULL),
    ('Spellbook', 'Kieran John Keenan', NULL, 'proxy', 'Athena', 'Legal AI (contract drafting)', 'https://www.spellbook.com', 'https://www.linkedin.com/company/spellbookai', 'https://www.crunchbase.com/organization/spellbook-legal', NULL, NULL),
    ('Oasiz', 'Abel Dagne (mentor)', 'CEO (a16z speedrun SR006)', 'mentor company', NULL, 'Social creation platform for playable content', 'https://www.oasiz.ai', 'https://www.linkedin.com/company/oasiz', 'https://www.crunchbase.com/organization/oasiz-77ec', NULL, NULL),
    ('PreMan', 'Alspencer Omondi (mentor)', 'CEO (a16z speedrun SR007)', 'mentor company', NULL, 'Verification layer for AI agent actions', 'https://www.preman.live', 'https://www.linkedin.com/company/preman', 'https://www.crunchbase.com/organization/preman', NULL, NULL),
    ('Dial', 'Gal Dayan & Omri Ben Shoham (mentors)', 'CTO & CPO (a16z speedrun SR004)', 'mentor company', NULL, 'Communication stack for AI agents', 'https://www.getdial.ai', 'https://www.linkedin.com/company/getdial', 'https://www.crunchbase.com/organization/getdial', NULL, NULL),
    ('Lumeria', 'Anthea Guo (mentor)', 'CTO (YC S26), verified on her LinkedIn profile', 'mentor company', NULL, 'Skincare / health startup (YC S26)', NULL, 'https://www.linkedin.com/company/lumeriaskin', 'https://www.crunchbase.com/organization/lumeria-skin', NULL, NULL),
    ('MochaCare', 'Nick Walker (mentor)', 'CEO (YC W26)', 'mentor company', NULL, 'AI staffing & workforce management for care providers', 'https://www.mochacare.com', 'https://www.linkedin.com/company/mochacare', 'https://www.crunchbase.com/organization/mocha-care', NULL, NULL)
), li AS (
  SELECT
    url,
    j,
    src
  FROM (
    SELECT
      RTRIM(url, '/') AS url,
      record_json AS j,
      'dataset' AS src
    FROM sec_edgar.judges_bd_raw
    WHERE
      source = 'linkedin_company'
    UNION ALL
    SELECT
      RTRIM(COALESCE(input_url, url), '/'),
      record_json,
      'scraper'
    FROM sec_edgar.judges_bd_scrape
    WHERE
      source = 'linkedin_company' AND error IS NULL AND NOT name IS NULL
  )
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY url ORDER BY CASE src WHEN 'scraper' THEN 0 ELSE 1 END) = 1
), cb AS (
  SELECT
    url,
    j,
    src
  FROM (
    SELECT
      url,
      record_json AS j,
      'dataset' AS src
    FROM sec_edgar.judges_bd_raw
    WHERE
      source = 'crunchbase'
    UNION ALL
    SELECT
      COALESCE(input_url, url),
      record_json,
      'scraper'
    FROM sec_edgar.judges_bd_scrape
    WHERE
      source = 'crunchbase' AND error IS NULL AND NOT name IS NULL
  )
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY url ORDER BY LENGTH(j) DESC) = 1
), cb_discovered AS (
  SELECT
    url,
    record_json AS j,
    REGEXP_REPLACE(LOWER(name), '[^a-z0-9]', '', 'g') AS nname,
    NULLIF(
      LOWER(REGEXP_EXTRACT(record_json ->> '$.website', '^(?:https?://)?(?:www[0-9]*\.)?([^/?#]+)', 1)),
      ''
    ) AS wdomain
  FROM sec_edgar.judges_bd_enrich
  WHERE
    source = 'crunchbase_discover' AND error IS NULL AND NOT name IS NULL
), form_d AS (
  SELECT
    cik,
    total_amount_sold_usd,
    filing_date
  FROM sec_edgar.form_d_filings
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY cik, file_number ORDER BY filing_date DESC) = 1
), sec AS (
  SELECT
    cik,
    COUNT(*) AS sec_form_d_offerings,
    SUM(total_amount_sold_usd) AS sec_form_d_sold_usd,
    MAX(total_amount_sold_usd) AS sec_largest_offering_usd,
    MAX(filing_date) AS sec_latest_form_d_date,
    ARRAY_TO_STRING(
      LIST(CAST(filing_date AS TEXT) || ': $' || FORMAT('{:,.0f}', total_amount_sold_usd) ORDER BY filing_date),
      '; '
    ) AS sec_form_d_history
  FROM form_d
  GROUP BY
    cik
), base AS (
  SELECT
    c.company,
    NULLIF(LOWER(REGEXP_EXTRACT(c.website, '^(?:https?://)?(?:www[0-9]*\.)?([^/?#]+)', 1)), '') AS domain,
    NULLIF(LOWER(REGEXP_EXTRACT(li.j ->> '$.website', '^(?:https?://)?(?:www[0-9]*\.)?([^/?#]+)', 1)), '') AS li_domain,
    NULLIF(
      LOWER(REGEXP_EXTRACT(COALESCE(cb_url.j, cbd.j) ->> '$.website', '^(?:https?://)?(?:www[0-9]*\.)?([^/?#]+)', 1)),
      ''
    ) AS cb_domain,
    c.judge,
    c.judge_connection,
    c.relation,
    c.proxy_for,
    c.category,
    c.website,
    c.linkedin_url,
    li.j ->> '$.headquarters' AS li_headquarters,
    TRY_CAST(li.j ->> '$.followers' AS BIGINT) AS li_followers,
    TRY_CAST(li.j ->> '$.employees_in_linkedin' AS BIGINT) AS li_employees_on_linkedin,
    li.j ->> '$.company_size' AS li_company_size,
    li.j ->> '$.industries' AS li_industry,
    TRY_CAST(li.j ->> '$.founded' AS INT) AS li_founded,
    li.j ->> '$.funding.last_round_type' AS li_last_round_type,
    li.j ->> '$.funding.last_round_raised' AS li_last_round_raised,
    SUBSTR(li.j ->> '$.funding.last_round_date', 1, 10) AS li_last_round_date,
    SUBSTR(COALESCE(li.j ->> '$.about', li.j ->> '$.description'), 1, 1500) AS li_about,
    COALESCE(cb_url.url, cbd.url, c.crunchbase_url) AS crunchbase_url,
    CASE
      WHEN NOT cb_url.url IS NULL THEN cb_url.src
      WHEN NOT cbd.url IS NULL THEN 'keyword discovery'
    END AS cb_source,
    SUBSTR(
      COALESCE(COALESCE(cb_url.j, cbd.j) ->> '$.full_description', COALESCE(cb_url.j, cbd.j) ->> '$.about'),
      1,
      1500
    ) AS cb_description,
    NULLIF(ARRAY_TO_STRING(COALESCE(cb_url.j, cbd.j) ->> '$.industries[*].value', '; '), '') AS cb_industries,
    COALESCE(cb_url.j, cbd.j) ->> '$.num_employees' AS cb_num_employees,
    COALESCE(cb_url.j, cbd.j) ->> '$.operating_status' AS cb_operating_status,
    COALESCE(cb_url.j, cbd.j) ->> '$.funding_rounds.last_funding_type' AS cb_last_funding_type,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.funding_rounds.num_funding_rounds' AS INT) AS cb_num_funding_rounds,
    CAST(
      REGEXP_EXTRACT_ALL(COALESCE(cb_url.j, cbd.j, ''), '"money_raised": \{[^}]*"value_usd": ([0-9.]+)', 1) AS DOUBLE[]
    ) AS round_amounts,
    NULLIF(
      ARRAY_TO_STRING(
        LIST_DISTINCT(REGEXP_EXTRACT_ALL(COALESCE(cb_url.j, cbd.j, ''), '"name": "([^"]+)", "permalink"', 1)),
        '; '
      ),
      ''
    ) AS cb_lead_investors,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.num_investors' AS INT) AS cb_num_investors,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.cb_rank' AS BIGINT) AS cb_rank,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.heat_score' AS DOUBLE) AS cb_heat_score,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.growth_score' AS DOUBLE) AS cb_growth_score,
    TRY_CAST(COALESCE(cb_url.j, cbd.j) ->> '$.monthly_visits' AS BIGINT) AS cb_monthly_visits,
    c.sec_cik,
    c.ticker,
    CASE
      WHEN NOT c.sec_cik IS NULL
      THEN 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=' || c.sec_cik
    END AS sec_edgar_url,
    sec.sec_form_d_offerings,
    sec.sec_form_d_sold_usd,
    sec.sec_largest_offering_usd,
    sec.sec_latest_form_d_date,
    sec.sec_form_d_history,
    NOT li.url IS NULL AS has_linkedin,
    NOT COALESCE(cb_url.url, cbd.url) IS NULL AS has_crunchbase,
    NOT sec.cik IS NULL OR NOT c.ticker IS NULL AS has_sec
  FROM curated AS c
  LEFT JOIN li
    ON li.url = RTRIM(c.linkedin_url, '/')
    AND (
      li.src = 'dataset'
      OR STRPOS(
        REGEXP_REPLACE(LOWER(li.j ->> '$.name'), '[^a-z0-9]', '', 'g'),
        REGEXP_REPLACE(LOWER(SPLIT_PART(c.company, ' ', 1)), '[^a-z0-9]', '', 'g')
      ) > 0
    )
  LEFT JOIN cb AS cb_url
    ON cb_url.url = c.crunchbase_url
    AND (
      cb_url.src = 'dataset'
      OR STRPOS(
        REGEXP_REPLACE(LOWER(cb_url.j ->> '$.name'), '[^a-z0-9]', '', 'g'),
        REGEXP_REPLACE(LOWER(SPLIT_PART(c.company, ' ', 1)), '[^a-z0-9]', '', 'g')
      ) > 0
    )
  LEFT JOIN cb_discovered AS cbd
    ON cb_url.url IS NULL
    AND (
      cbd.wdomain = NULLIF(LOWER(REGEXP_EXTRACT(c.website, '^(?:https?://)?(?:www[0-9]*\.)?([^/?#]+)', 1)), '')
      OR cbd.nname = REGEXP_REPLACE(LOWER(SPLIT_PART(c.company, ' ', 1)), '[^a-z0-9]', '', 'g')
    )
  LEFT JOIN sec
    ON sec.cik = c.sec_cik
), scored AS (
  SELECT
    * EXCLUDE (round_amounts),
    NULLIF(LIST_SUM(round_amounts), 0) AS cb_disclosed_funding_usd,
    LIST_MAX(round_amounts) AS cb_largest_round_usd,
    CASE WHEN has_linkedin AND li_domain = domain THEN 30 WHEN has_linkedin THEN 20 ELSE 0 END
    + CASE WHEN has_crunchbase AND cb_domain = domain THEN 25 WHEN has_crunchbase THEN 15 ELSE 0 END
    + CASE WHEN has_sec THEN 25 ELSE 0 END
    + CASE
      WHEN CAST(has_linkedin AS INT) + CAST(has_crunchbase AS INT) + CAST(has_sec AS INT) >= 2 THEN 20
      ELSE 0
    END AS trust_score
  FROM base
)
SELECT
  *,
  CASE WHEN trust_score >= 60 THEN 'high' WHEN trust_score >= 35 THEN 'medium' ELSE 'low' END AS trust_tier,
  ARRAY_TO_STRING(
    [CASE
      WHEN has_linkedin AND li_domain = domain THEN 'LinkedIn page links to the company domain'
      WHEN has_linkedin THEN 'LinkedIn page matched (no domain confirmation)'
    END,
    CASE
      WHEN has_crunchbase AND cb_domain = domain THEN 'Crunchbase record links to the company domain'
      WHEN has_crunchbase THEN 'Crunchbase record matched (no domain confirmation)'
    END,
    CASE
      WHEN NOT ticker IS NULL THEN 'Public company (SEC filer ' || ticker || ')'
      WHEN has_sec THEN 'SEC Form D filings found'
    END,
    CASE WHEN NOT has_linkedin THEN 'no LinkedIn data' END,
    CASE WHEN NOT has_crunchbase THEN 'no Crunchbase data' END],
    '; '
  ) AS trust_reasons
FROM scored
QUALIFY
  ROW_NUMBER() OVER (PARTITION BY company ORDER BY trust_score DESC, cb_rank ASC NULLS LAST) = 1
