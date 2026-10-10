# EDGAR access: one company's Form Ds by name or CIK

All of these were tested on 2026-10-10 with the header `User-Agent: VentureSauce research contact@example.com`, and all returned HTTP 200. Rules:
- Always send a descriptive User-Agent with a contact email.
- Stay at or under **10 requests/second**. Clients that exceed it get temporarily IP-blocked.
- No API key is needed.

Sources: [SEC: Accessing EDGAR data](https://www.sec.gov/os/accessing-edgar-data), [EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces). The SEC says the submissions API updates with "a typical processing delay of less than a second."

## Lookup chain (tested with Daytona)
| Step | Endpoint | Tested result / notes |
|---|---|---|
| 1a. Name → CIK (autocomplete) | `https://efts.sec.gov/LATEST/search-index?keysTyped=Daytona%20Platforms` | Returns `_id=1977563`, `_source.entity="Daytona Platforms Inc."`. Fast, but **covers names only**. |
| 1b. Name → Form D filings directly | `https://efts.sec.gov/LATEST/search-index?forms=D&entityName=Daytona` | 27 hits. The top two are Daytona Platforms (2026-08-17, 2026-02-05), followed by unrelated funds and hotels. Each hit has `display_names`, `ciks`, `file_date`, `adsh`, `biz_states`, `biz_locations`, `items` (e.g., `["06B"]`), `inc_states`. **The best single call for the panel.** |
| 2. CIK → filing list | `https://data.sec.gov/submissions/CIK0001977563.json` | `filings.recent` arrays. Filter `form in ("D","D/A")`. Gives `accessionNumber`, `filingDate`, `acceptanceDateTime`, and `primaryDocument`. |
| 3. Filing → structured data | `https://www.sec.gov/Archives/edgar/data/1977563/000197756326000002/primary_doc.xml` | Raw XML. **Pitfall:** `primaryDocument` in the submissions JSON is `xslFormDX01/primary_doc.xml`, which returns **rendered HTML**. Strip the `xslFormDX01/` prefix to get the XML. |
| 4. Human-readable receipt link (UI) | `https://www.sec.gov/Archives/edgar/data/1977563/000197756326000002/xslFormDX01/primary_doc.xml` (formatted form) or `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1977563&type=D` (filing list) | Both return 200. Add `&output=atom` to the getcompany URL for an XML list with `filing-date`, `filing-type` and `filing-href`. |

### Full-text search: what does and doesn't work
- `https://efts.sec.gov/LATEST/search-index?q=%22Daytona%20Platforms%22&forms=D,D/A` returned **0 hits**.
- `q=%22Ivan%20Burazin%22&forms=D,D/A` also returned **0 hits**.
- Conclusion: **Form D XML content is not full-text searchable.** You can't search Form Ds by founder or director name. Use `entityName=` (the filer name) or `keysTyped=`.
- Date-range listing works: `https://efts.sec.gov/LATEST/search-index?forms=D&dateRange=custom&startdt=2026-10-08&enddt=2026-10-09` returned 658 hits, 100 per page (`&from=100`).
- EFTS is the internal API behind [EDGAR full-text search](https://www.sec.gov/edgar/search/efts-faq.html). It's undocumented and could change without notice. Treat it as best-effort and cache the results.

## curl (verified)
```bash
UA="VentureSauce research contact@example.com"
curl -s -A "$UA" "https://efts.sec.gov/LATEST/search-index?forms=D&entityName=Daytona"
curl -s -A "$UA" "https://efts.sec.gov/LATEST/search-index?keysTyped=Daytona%20Platforms"
curl -s -A "$UA" "https://data.sec.gov/submissions/CIK0001977563.json"
curl -s -A "$UA" "https://www.sec.gov/Archives/edgar/data/1977563/000197756326000002/primary_doc.xml"
```

## Matching tips for `get_ground_truth`
- Rank hits as follows:
  1. Exact normalized legal name, with "Inc", "Corp", "Labs" and "Technologies" stripped.
  2. Not a fund: drop `items` containing `3C`, and names with "Fund", "LP", "Partners" or "a series of".
  3. State or city matches the deck or LinkedIn.
  4. Most recent `file_date`.
- After fetching the XML, confirm that at least one related person matches the deck's team slide. Otherwise set confidence to low.
- Parse with `defusedxml` (standard-library XML parsers are open to XXE attacks), and set a timeout of about 20s.

## Also available (not needed for the panel)
- Real-time Form D feed: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=D&count=100&output=atom`. It showed a filing 4 seconds after acceptance.
- Daily index: `https://www.sec.gov/Archives/edgar/daily-index/2026/QTR4/form.20261009.idx`
- Quarterly DERA Form D data sets: https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets (latest: `2026q3_d.zip`)
