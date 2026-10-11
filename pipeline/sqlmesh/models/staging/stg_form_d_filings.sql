MODEL (
  name staging.stg_form_d_filings,
  kind VIEW,
  grain accession_number,
  description 'Form D and D/A filings with typed amounts and dates, one row per accession.',
  audits (
    not_null(columns := (accession_number, cik, filed_date)),
    unique_values(columns := (accession_number))
  )
);

SELECT
  accession_number::VARCHAR AS accession_number,
  filed_date::DATE AS filed_date,
  form_type::VARCHAR AS form_type,
  LPAD(cik::VARCHAR, 10, '0') AS cik,
  COALESCE(entity_name, index_company_name)::VARCHAR AS entity_name,
  entity_type::VARCHAR AS entity_type,
  jurisdiction_of_inc::VARCHAR AS jurisdiction_of_inc,
  TRY_CAST(year_of_inc AS INT) AS year_of_inc,
  city::VARCHAR AS city,
  state_or_country::VARCHAR AS state_or_country,
  industry_group::VARCHAR AS industry_group,
  investment_fund_type::VARCHAR AS investment_fund_type,
  revenue_range::VARCHAR AS revenue_range,
  COALESCE(is_amendment, form_type = 'D/A')::BOOLEAN AS is_amendment,
  previous_accession_number::VARCHAR AS previous_accession_number,
  TRY_CAST(date_of_first_sale AS DATE) AS date_of_first_sale,
  COALESCE(first_sale_yet_to_occur, FALSE)::BOOLEAN AS first_sale_yet_to_occur,
  more_than_one_year::BOOLEAN AS more_than_one_year,
  COALESCE(is_equity, FALSE)::BOOLEAN AS is_equity,
  COALESCE(is_debt, FALSE)::BOOLEAN AS is_debt,
  COALESCE(is_pooled_fund, FALSE)::BOOLEAN AS is_pooled_fund,
  federal_exemptions::VARCHAR[] AS federal_exemptions,
  TRY_CAST(minimum_investment AS DECIMAL(18, 2)) AS minimum_investment,
  TRY_CAST(total_offering_amount AS DECIMAL(18, 2)) AS total_offering_amount,
  COALESCE(LOWER(total_offering_amount) = 'indefinite', FALSE)::BOOLEAN AS is_offering_amount_indefinite,
  TRY_CAST(total_amount_sold AS DECIMAL(18, 2)) AS total_amount_sold,
  TRY_CAST(total_remaining AS DECIMAL(18, 2)) AS total_remaining,
  has_non_accredited_investors::BOOLEAN AS has_non_accredited_investors,
  TRY_CAST(total_investors AS INT) AS total_investors,
  filing_url::VARCHAR AS filing_url,
  primary_doc_url::VARCHAR AS primary_doc_url,
  ingested_at::TIMESTAMP AS ingested_at
FROM delta.raw.form_d_filings
QUALIFY ROW_NUMBER() OVER (PARTITION BY accession_number ORDER BY ingested_at DESC) = 1
