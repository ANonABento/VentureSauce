MODEL (
  name sec_edgar.judges_company_timeline,
  kind FULL,
  description 'Event timeline per curated judges / mentors company: SEC Form D filings, recent LinkedIn company posts and Google News funding headlines that name the company, with trust_tier from judges_companies.'
);

WITH c AS (
  SELECT
    company,
    judge,
    relation,
    proxy_for,
    category,
    trust_score,
    trust_tier,
    sec_cik,
    linkedin_url
  FROM sec_edgar.judges_companies
), posts AS (
  SELECT
    RTRIM(url, '/') AS url,
    UNNEST(record_json -> '$.updates[*]') AS u
  FROM sec_edgar.judges_bd_raw
  WHERE
    source = 'linkedin_company'
), news_queries(query, company) AS (
  VALUES
    ('Base44', 'Base44'),
    ('Wix', 'Wix'),
    ('VU Venture Partners', 'VU Venture Partners'),
    ('Tailor Brands', 'Tailor Brands'),
    ('Momentum Start-Up Accelerator', 'Momentum Start-Up Accelerator'),
    ('Pavoot', 'Pavoot'),
    ('KOF Swiss Economic Institute', 'KOF Swiss Economic Institute (ETH Zurich)'),
    ('Itaú Unibanco', 'Itaú Unibanco'),
    ('Athena law firm', 'Athena'),
    ('Legora', 'Legora'),
    ('Nemoest', 'Nemoest'),
    ('Fromber', 'Fromber'),
    ('Lovable', 'Lovable'),
    ('Bolt.new StackBlitz', 'Bolt.new (StackBlitz)'),
    ('Looka', 'Looka'),
    ('ZenBusiness', 'ZenBusiness'),
    ('Partiful', 'Partiful'),
    ('Luma events', 'Luma'),
    ('Nubank', 'Nubank'),
    ('Harvey AI', 'Harvey'),
    ('Luminance AI', 'Luminance'),
    ('GC AI', 'GC AI'),
    ('Spellbook legal', 'Spellbook'),
    ('Oasiz', 'Oasiz'),
    ('PreMan AI', 'PreMan'),
    ('Dial AI agents', 'Dial'),
    ('Lumeria skin', 'Lumeria'),
    ('MochaCare', 'MochaCare')
)
SELECT
  c.company,
  c.judge,
  c.relation,
  c.proxy_for,
  c.category,
  c.trust_score,
  c.trust_tier,
  f.filing_date AS event_date,
  'SEC Form D' AS event_type,
  f.total_amount_sold_usd AS amount_usd,
  CAST(NULL AS BIGINT) AS likes,
  CAST(NULL AS BIGINT) AS comments,
  f.submission_type || ' | sought ' || COALESCE('$' || FORMAT('{:,.0f}', f.total_offering_amount_usd), 'indefinite') || ' | ' || COALESCE(CAST(f.num_investors AS TEXT), '?') || ' investors' AS detail,
  f.filing_url AS url
FROM c
JOIN sec_edgar.form_d_filings AS f
  ON f.cik = c.sec_cik
UNION ALL
SELECT
  c.company,
  c.judge,
  c.relation,
  c.proxy_for,
  c.category,
  c.trust_score,
  c.trust_tier,
  TRY_CAST(SUBSTR(p.u ->> '$.date', 1, 10) AS DATE) AS event_date,
  'LinkedIn post' AS event_type,
  CAST(NULL AS DOUBLE) AS amount_usd,
  TRY_CAST(p.u ->> '$.likes_count' AS BIGINT) AS likes,
  TRY_CAST(p.u ->> '$.comments_count' AS BIGINT) AS comments,
  SUBSTR(p.u ->> '$.text', 1, 300) AS detail,
  p.u ->> '$.post_url' AS url
FROM c
JOIN posts AS p
  ON p.url = RTRIM(c.linkedin_url, '/')
UNION ALL
SELECT
  c.company,
  c.judge,
  c.relation,
  c.proxy_for,
  c.category,
  c.trust_score,
  c.trust_tier,
  TRY_CAST(n.event_date AS DATE) AS event_date,
  'News' AS event_type,
  CAST(NULL AS DOUBLE) AS amount_usd,
  CAST(NULL AS BIGINT) AS likes,
  CAST(NULL AS BIGINT) AS comments,
  n.name || COALESCE(' (' || (n.record_json ->> '$.source') || ')', '') AS detail,
  n.url
FROM sec_edgar.judges_bd_enrich AS n
JOIN news_queries AS q
  ON q.query = n.query
JOIN c
  ON c.company = q.company
WHERE
  n.source = 'news'
  AND n.error IS NULL
  AND NOT n.name IS NULL
  AND STRPOS(LOWER(n.name), LOWER(SPLIT_PART(REGEXP_REPLACE(c.company, '\s*\(.*\)', ''), ' ', 1))) > 0
