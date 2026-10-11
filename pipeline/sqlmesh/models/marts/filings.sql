MODEL (
  name marts.filings,
  kind FULL,
  grain accession_number,
  description 'Every Form D filing with sector, sell-through, and the change in amount sold since the issuer''s previous filing.',
  audits (unique_values(columns := (accession_number)))
);

WITH persons AS (
  SELECT
    accession_number,
    LIST({'name': full_name, 'relationships': relationships} ORDER BY person_index) AS related_persons,
    COUNT(*) FILTER (WHERE is_director) AS director_count
  FROM staging.stg_form_d_related_persons
  GROUP BY accession_number
)
SELECT
  f.accession_number,
  f.filed_date,
  f.form_type,
  f.is_amendment,
  f.cik,
  f.entity_name,
  f.city,
  f.state_or_country,
  f.year_of_inc,
  f.industry_group,
  CASE
    WHEN f.is_pooled_fund OR f.industry_group = 'Pooled Investment Fund' THEN 'fund'
    WHEN f.industry_group IN ('Computers', 'Telecommunications', 'Other Technology') THEN 'technology'
    WHEN f.industry_group IN ('Biotechnology', 'Pharmaceuticals', 'Other Health Care', 'Health Insurance', 'Hospitals and Physicians') THEN 'health'
    WHEN f.industry_group IN ('Commercial Banking', 'Insurance', 'Investing', 'Investment Banking', 'Other Banking and Financial Services') THEN 'financial'
    WHEN f.industry_group IN ('Commercial', 'Construction', 'REITS and Finance', 'Residential', 'Other Real Estate') THEN 'real_estate'
    WHEN f.industry_group IS NULL THEN 'unknown'
    ELSE 'other'
  END AS sector,
  f.investment_fund_type,
  f.is_equity,
  f.is_debt,
  f.federal_exemptions,
  f.date_of_first_sale,
  f.filed_date - f.date_of_first_sale AS days_from_first_sale_to_filing,
  f.total_offering_amount,
  f.is_offering_amount_indefinite,
  f.total_amount_sold,
  f.total_remaining,
  f.total_amount_sold / NULLIF(f.total_offering_amount, 0) AS pct_sold,
  f.total_investors,
  (f.total_amount_sold - LAG(f.total_amount_sold) OVER issuer)::DECIMAL(18, 2) AS amount_sold_change,
  ROW_NUMBER() OVER issuer = 1 AS is_first_filing_seen,
  COALESCE(p.related_persons, []) AS related_persons,
  COALESCE(p.director_count, 0) AS director_count,
  f.filing_url,
  f.primary_doc_url
FROM staging.stg_form_d_filings AS f
LEFT JOIN persons AS p
  ON f.accession_number = p.accession_number
WINDOW issuer AS (PARTITION BY f.cik ORDER BY f.filed_date, f.accession_number)
