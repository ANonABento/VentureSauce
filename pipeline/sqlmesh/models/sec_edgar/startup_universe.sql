MODEL (
  name sec_edgar.startup_universe,
  kind FULL,
  grain cik,
  description 'Tracked set of VC-relevant startups: young tech / bio / health / energy corporations that raised at least $1M, most recent filers first. Input to Bright Data enrichment.'
);

SELECT
  ROW_NUMBER() OVER (ORDER BY c.latest_filing_date DESC, c.total_raised_usd DESC, c.cik) AS universe_rank,
  c.*
FROM sec_edgar.startup_companies AS c
WHERE
  c.sector IN ('Technology', 'Bio & Health', 'Energy & Climate')
  AND (
    c.year_of_inc >= YEAR(CURRENT_DATE) - 5
    OR (c.year_of_inc IS NULL AND c.year_of_inc_choice = 'withinFiveYears')
  )
  AND c.total_raised_usd >= 1000000
ORDER BY
  universe_rank
LIMIT @universe_size
