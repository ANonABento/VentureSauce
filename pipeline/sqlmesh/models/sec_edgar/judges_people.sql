MODEL (
  name sec_edgar.judges_people,
  kind FULL,
  grain (linkedin_url, company),
  description 'Founders, judges and mentors behind the curated companies: one row per (LinkedIn profile, company), linked only when the current company or an experience entry names that company.'
);

WITH c AS (
  SELECT
    company,
    judge,
    relation,
    proxy_for,
    trust_tier,
    LOWER(TRIM(REGEXP_REPLACE(company, '\s*\(.*\)', ''))) AS key
  FROM sec_edgar.judges_companies
), p AS (
  SELECT
    url,
    record_json AS j
  FROM sec_edgar.judges_bd_enrich
  WHERE
    source = 'linkedin_person' AND error IS NULL AND NOT url IS NULL
  UNION
  SELECT
    url,
    record_json
  FROM sec_edgar.judges_bd_raw
  WHERE
    source = 'linkedin_person'
), profiles AS (
  SELECT
    url,
    j,
    j ->> '$.name' AS person,
    LOWER(COALESCE(j ->> '$.current_company.name', j ->> '$.current_company_name', '')) AS current_company,
    LOWER(COALESCE(CAST(j -> '$.experience' AS TEXT), '')) AS experience_text,
    LOWER(COALESCE(CAST(j -> '$.education' AS TEXT), '')) AS education_text
  FROM p
), matched AS (
  SELECT
    pr.*,
    c.company,
    c.judge,
    c.relation,
    c.proxy_for,
    c.trust_tier,
    CASE
      WHEN REGEXP_MATCHES(pr.current_company, '(^|[^a-z0-9])' || c.key || '([^a-z0-9]|$)')
      THEN 'current company'
      ELSE 'past experience'
    END AS match_basis
  FROM profiles AS pr
  JOIN c
    ON REGEXP_MATCHES(pr.current_company, '(^|[^a-z0-9])' || c.key || '([^a-z0-9]|$)')
    OR REGEXP_MATCHES(pr.experience_text, '"company":"' || c.key || '([^a-z0-9"][^"]*)?"')
  QUALIFY
    ROW_NUMBER() OVER (PARTITION BY pr.url, c.company ORDER BY pr.url) = 1
)
SELECT
  person,
  url AS linkedin_url,
  company,
  judge AS judge_or_mentor_group,
  relation AS company_relation,
  proxy_for,
  trust_tier AS company_trust_tier,
  match_basis,
  person IN ('Ore Segal', 'Ana Yoon Faria de Lima', 'Kieran John Keenan') AS is_judge,
  person IN ('Abel Dagne', 'Alspencer Omondi', 'Gal Dayan', 'Omri Ben Shoham', 'Anthea Guo', 'Nick Walker') AS is_mentor,
  j ->> '$.position' AS headline,
  COALESCE(j ->> '$.current_company.name', j ->> '$.current_company_name') AS current_company,
  j ->> '$.city' AS location,
  j ->> '$.country_code' AS country_code,
  TRY_CAST(j ->> '$.followers' AS BIGINT) AS followers,
  TRY_CAST(j ->> '$.connections' AS BIGINT) AS connections,
  JSON_ARRAY_LENGTH(j -> '$.experience') AS num_experiences,
  ARRAY_TO_STRING(
    LIST_SLICE(LIST_DISTINCT(REGEXP_EXTRACT_ALL(experience_text, '"company":"([^"]+)"', 1)), 1, 8),
    '; '
  ) AS companies_worked_at,
  ARRAY_TO_STRING(
    LIST_SLICE(LIST_DISTINCT(REGEXP_EXTRACT_ALL(education_text, '"title":"([^"]+)"', 1)), 1, 4),
    '; '
  ) AS education,
  SUBSTR(j ->> '$.about', 1, 600) AS about
FROM matched
