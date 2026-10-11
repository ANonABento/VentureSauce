MODEL (
  name sec_edgar.startup_people,
  kind FULL,
  grain (cik, full_name),
  description 'One row per (startup, person) named on Form D: role flags, CEO/founder/CTO flags and repeat-insider flag.'
);

WITH startup_filings AS (
  SELECT
    f.accession_number,
    f.cik,
    f.entity_name,
    f.filing_date
  FROM sec_edgar.form_d_filings AS f
  WHERE
    f.cik IN (SELECT DISTINCT cik FROM sec_edgar.startup_rounds)
), p AS (
  SELECT
    s.cik,
    s.entity_name,
    s.filing_date,
    rp.full_name,
    LOWER(REGEXP_REPLACE(rp.full_name, '[^A-Za-z ]', '', 'g')) AS name_key,
    rp.city,
    rp.state_or_country,
    rp.title,
    rp.is_executive_officer,
    rp.is_director,
    rp.is_promoter
  FROM sec_edgar.form_d_related_persons AS rp
  JOIN startup_filings AS s
    ON s.accession_number = rp.accession_number
  WHERE
    rp.full_name IS NOT NULL AND rp.full_name <> ''
), per_company AS (
  SELECT
    cik,
    name_key,
    MAX_BY(full_name, filing_date) AS full_name,
    MAX_BY(entity_name, filing_date) AS company_name,
    MAX_BY(title, filing_date) AS latest_title,
    MAX_BY(city, filing_date) AS city,
    MAX_BY(state_or_country, filing_date) AS state_or_country,
    BOOL_OR(is_executive_officer) AS is_executive_officer,
    BOOL_OR(is_director) AS is_director,
    BOOL_OR(is_promoter) AS is_promoter,
    MIN(filing_date) AS first_seen_date,
    MAX(filing_date) AS last_seen_date
  FROM p
  GROUP BY
    cik,
    name_key
), cross_company AS (
  SELECT
    name_key,
    state_or_country,
    COUNT(DISTINCT cik) AS startup_count
  FROM per_company
  GROUP BY
    name_key,
    state_or_country
)
SELECT
  pc.cik,
  pc.company_name,
  pc.full_name,
  pc.latest_title,
  REGEXP_MATCHES(COALESCE(pc.latest_title, ''), '(?i)\b(ceo|chief executive|founder|co-founder|president)\b') AS is_ceo_or_founder,
  REGEXP_MATCHES(COALESCE(pc.latest_title, ''), '(?i)\b(cto|chief technology|chief technical)\b') AS is_cto,
  pc.is_executive_officer,
  pc.is_director,
  pc.is_promoter,
  pc.city,
  pc.state_or_country,
  pc.first_seen_date,
  pc.last_seen_date,
  cc.startup_count AS startups_named_on,
  cc.startup_count > 1 AS is_repeat_insider
FROM per_company AS pc
LEFT JOIN cross_company AS cc
  ON cc.name_key = pc.name_key AND cc.state_or_country IS NOT DISTINCT FROM pc.state_or_country
