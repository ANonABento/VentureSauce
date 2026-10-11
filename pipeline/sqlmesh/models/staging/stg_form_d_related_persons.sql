MODEL (
  name staging.stg_form_d_related_persons,
  kind VIEW,
  grain (accession_number, person_index),
  description 'People listed on each Form D, with their roles.'
);

SELECT
  accession_number::VARCHAR AS accession_number,
  filed_date::DATE AS filed_date,
  LPAD(cik::VARCHAR, 10, '0') AS cik,
  person_index::INT AS person_index,
  ARRAY_TO_STRING([first_name, middle_name, last_name], ' ')::VARCHAR AS full_name,
  first_name::VARCHAR AS first_name,
  last_name::VARCHAR AS last_name,
  city::VARCHAR AS city,
  state_or_country::VARCHAR AS state_or_country,
  relationships::VARCHAR[] AS relationships,
  COALESCE(LIST_CONTAINS(relationships, 'Director'), FALSE)::BOOLEAN AS is_director,
  COALESCE(LIST_CONTAINS(relationships, 'Executive Officer'), FALSE)::BOOLEAN AS is_executive,
  COALESCE(LIST_CONTAINS(relationships, 'Promoter'), FALSE)::BOOLEAN AS is_promoter,
  clarification::VARCHAR AS clarification
FROM delta.raw.form_d_related_persons
QUALIFY ROW_NUMBER() OVER (PARTITION BY accession_number, person_index ORDER BY ingested_at DESC) = 1
