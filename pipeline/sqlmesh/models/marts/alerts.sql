MODEL (
  name marts.alerts,
  kind FULL,
  grain accession_number,
  description 'Operating-company raises worth an alert: new offerings, and amendments where the amount sold went up.'
);

SELECT
  accession_number,
  filed_date,
  CASE WHEN NOT is_amendment THEN 'new_offering' ELSE 'amount_sold_increased' END AS alert_type,
  cik,
  entity_name,
  city,
  state_or_country,
  sector,
  industry_group,
  date_of_first_sale,
  days_from_first_sale_to_filing,
  total_offering_amount,
  total_amount_sold,
  total_remaining,
  amount_sold_change,
  total_investors,
  related_persons,
  filing_url
FROM marts.filings
WHERE
  sector <> 'fund'
  AND is_equity
  AND (NOT is_amendment OR amount_sold_change > 0)
