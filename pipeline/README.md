# delta

Every private raise filed with the SEC (Form D), modeled into an alert feed and a VC deal-flow table enriched with [Bright Data](https://brightdata.com) (LinkedIn, Crunchbase, Google).

## Thanks to Bright Data

Thank you to [Bright Data](https://brightdata.com) for sponsoring the hackathon. Every `bd_*` and `judges_bd_*` table runs on their products: the [SERP API](https://docs.brightdata.com/products/serp-api/introduction) for funding-press search, the [Marketplace Dataset Filter API](https://docs.brightdata.com/datasets/marketplace/filter-dataset-by-api) for LinkedIn and Crunchbase company and people profiles, and the [Scraper APIs](https://docs.brightdata.com/products/scrapers/linkedin/introduction) for pages the datasets don't cover yet.

## Alerts (daily EDGAR index)

- **`raw.form_d_filings`**: Form D and D/A filings as filed
- **`raw.form_d_related_persons`**: Directors, executives and promoters on each filing
- **`staging.stg_form_d_filings`**: Typed filings, one row per accession
- **`staging.stg_form_d_related_persons`**: Typed people and roles
- **`marts.filings`**: Filings with sector, sell-through and change in amount sold
- **`marts.alerts`**: New raises and amendments where the amount sold went up

## Startup deal flow (`sec_edgar`)

- **`form_d_filings`** (Python): One row per Form D filing from the SEC quarterly Form D data sets (2025Q1 onward)
- **`form_d_related_persons`** (Python): Officers, directors and promoters on each filing
- **`startup_rounds`** (SQL): One row per offering by an operating corporation, amendments collapsed
- **`startup_people`** (SQL): One row per (startup, person) with CEO / founder / CTO and repeat-insider flags
- **`startup_companies`** (SQL): One row per issuer: funding totals, latest round, leadership, VC signal score
- **`startup_universe`** (SQL): The tracked set: young tech / bio / energy corporations with at least $1M raised
- **`bd_serp_funding`** (Python · Bright Data): SERP API funding-press and profile-URL search per universe company
- **`bd_linkedin_companies`** (Python · Bright Data): LinkedIn company candidates (Dataset Filter, then Scraper API for SERP-found pages)
- **`bd_crunchbase_companies`** (Python · Bright Data): Crunchbase candidates (Dataset Filter, then Scraper API for SERP / LinkedIn URLs)
- **`startup_companies_enriched`** (SQL · Bright Data): The deal-flow table: universe plus the best validated LinkedIn and Crunchbase match and funding press
- **`judges_bd_raw`** (Python · Bright Data): Dataset Filter records for the hackathon judges, mentors, their companies and proxies
- **`judges_bd_scrape`** (Python · Bright Data): Scraper API gap fill for pages the datasets missed
- **`judges_bd_enrich`** (Python · Bright Data): Crunchbase keyword discovery, Google News funding headlines, founder profiles
- **`judges_companies`** (SQL · Bright Data): Curated judges / mentors companies with LinkedIn, Crunchbase and SEC data and a trust score
- **`judges_company_timeline`** (SQL · Bright Data): Form D filings, LinkedIn posts and funding headlines per curated company
- **`judges_people`** (SQL · Bright Data): Founders, judges and mentors linked to the curated companies

Every Bright Data and SEC response is cached under `data/cache`, so re-runs only pay for companies not fetched before. Without `BRIGHT_DATA_API_KEY` the paid models read the cache only and make no requests. `BRIGHT_DATA_MAX_COMPANIES` caps how many universe companies are enriched and `UNIVERSE_SIZE` sets the universe size.

Stack: Dagster, SQLMesh, DuckDB locally or MotherDuck when `MOTHERDUCK_TOKEN` is set.

```sh
uv sync
cp .env.example .env
uv run dagster dev
(cd sqlmesh && uv run sqlmesh plan --auto-apply)
uv run pytest && (cd sqlmesh && uv run sqlmesh test)
```
