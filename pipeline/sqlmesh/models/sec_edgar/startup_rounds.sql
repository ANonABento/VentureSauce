MODEL (
  name sec_edgar.startup_rounds,
  kind FULL,
  grain offering_id,
  description 'One row per private offering (Form D file number) by an operating corporation; amendments collapsed to the latest filing.',
  audits (unique_values(columns := (offering_id)))
);

WITH base AS (
  SELECT
    f.*,
    COALESCE(NULLIF(f.file_number, ''), f.accession_number) AS offering_key
  FROM sec_edgar.form_d_filings AS f
  WHERE
    f.entity_type = 'Corporation'
    AND NOT f.is_pooled_fund_interest
    AND COALESCE(f.industry_group, 'Other') NOT IN (
      'Pooled Investment Fund', 'Investing', 'REITS and Finance', 'Commercial', 'Residential',
      'Other Real Estate', 'Commercial Banking', 'Investment Banking', 'Lodging and Conventions', 'Oil and Gas'
    )
    AND NOT REGEXP_MATCHES(
      f.entity_name,
      '(?i)\b(fund|funds|l\.?p\.?|spv|reit|properties|realty|mining|gold|silver|uranium|lithium|exploration|minerals|bancorp|bank|trust)\b'
    )
), ranked AS (
  SELECT
    b.*,
    ROW_NUMBER() OVER (PARTITION BY b.cik, b.offering_key ORDER BY b.filing_date DESC, b.accession_number DESC) AS rn,
    MIN(b.filing_date) OVER (PARTITION BY b.cik, b.offering_key) AS original_filing_date,
    COUNT(*) OVER (PARTITION BY b.cik, b.offering_key) AS filings_in_offering
  FROM base AS b
)
SELECT
  r.cik || ':' || r.offering_key AS offering_id,
  r.cik,
  r.entity_name AS company_name,
  r.file_number,
  r.accession_number AS latest_accession_number,
  r.original_filing_date,
  r.filing_date AS latest_filing_date,
  r.filings_in_offering,
  r.first_sale_date,
  r.first_sale_yet_to_occur,
  CASE
    WHEN r.first_sale_date IS NOT NULL
    THEN DATE_DIFF('day', r.first_sale_date, r.original_filing_date)
  END AS days_first_sale_to_filing,
  r.industry_group,
  CASE
    WHEN r.industry_group IN ('Other Technology', 'Computers', 'Telecommunications')
    THEN 'Technology'
    WHEN r.industry_group IN ('Biotechnology', 'Pharmaceuticals', 'Other Health Care', 'Hospitals and Physicians', 'Health Insurance')
    THEN 'Bio & Health'
    WHEN r.industry_group IN ('Other Energy', 'Energy Conservation', 'Environmental Services', 'Electric Utilities', 'Coal Mining')
    THEN 'Energy & Climate'
    WHEN r.industry_group IN ('Other Banking and Financial Services', 'Insurance', 'Business Services')
    THEN 'Fintech & Services'
    WHEN r.industry_group IN ('Retailing', 'Restaurants', 'Agriculture', 'Other Travel', 'Tourism and Travel Services', 'Airlines and Airports')
    THEN 'Consumer'
    WHEN r.industry_group IN ('Manufacturing', 'Construction')
    THEN 'Industrial'
    ELSE 'Other'
  END AS sector,
  r.city,
  r.state_or_country,
  r.state_or_country_desc,
  r.jurisdiction_of_inc,
  r.year_of_inc,
  r.year_of_inc_choice,
  r.revenue_range,
  r.is_equity,
  r.is_debt,
  r.is_option_warrant,
  r.is_security_to_be_acquired,
  r.is_other_security,
  r.other_security_desc,
  CASE
    WHEN r.is_other_security AND REGEXP_MATCHES(COALESCE(r.other_security_desc, ''), '(?i)safe|simple agreement')
    THEN 'SAFE'
    WHEN r.is_debt AND REGEXP_MATCHES(COALESCE(r.other_security_desc, ''), '(?i)convertible')
    THEN 'Convertible note'
    WHEN r.is_equity
    THEN 'Equity'
    WHEN r.is_debt
    THEN 'Debt'
    WHEN r.is_option_warrant OR r.is_security_to_be_acquired
    THEN 'Options/Warrants'
    WHEN r.is_other_security
    THEN 'Other'
    ELSE 'Unspecified'
  END AS security_type,
  r.is_business_combination,
  r.federal_exemptions,
  STRPOS(COALESCE(r.federal_exemptions, ''), '06c') > 0 AS is_general_solicitation_506c,
  r.total_offering_amount_usd,
  r.offering_amount_indefinite,
  r.total_amount_sold_usd,
  r.total_remaining_usd,
  CASE
    WHEN r.total_offering_amount_usd > 0
    THEN r.total_amount_sold_usd / r.total_offering_amount_usd
  END AS pct_sold,
  COALESCE(r.total_remaining_usd, 0) > 0 OR r.offering_amount_indefinite AS is_open_round,
  r.num_investors,
  r.minimum_investment_usd,
  r.has_non_accredited_investors,
  r.sales_commission_usd,
  r.finders_fee_usd,
  COALESCE(r.sales_commission_usd, 0) + COALESCE(r.finders_fee_usd, 0) > 0 AS used_intermediary,
  r.proceeds_to_insiders_usd,
  CASE
    WHEN r.total_amount_sold_usd >= 100000000
    THEN '$100M+'
    WHEN r.total_amount_sold_usd >= 25000000
    THEN '$25M-$100M'
    WHEN r.total_amount_sold_usd >= 5000000
    THEN '$5M-$25M'
    WHEN r.total_amount_sold_usd >= 1000000
    THEN '$1M-$5M'
    WHEN r.total_amount_sold_usd > 0
    THEN '<$1M'
    ELSE 'None sold'
  END AS round_size_bucket,
  r.filing_url,
  'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=D&CIK=' || r.cik AS edgar_company_url
FROM ranked AS r
WHERE
  r.rn = 1
