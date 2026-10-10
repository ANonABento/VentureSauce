# Data: EDGAR, Bright Data, MongoDB

**Your job:** the ground truth. Every number on stage comes through your code, and you have personally checked it.

## Your interface (Kevin calls this)

```python
# backend/sources/ground_truth.py
def get_ground_truth(company: str, domain: str | None, use_cache: bool = True) -> dict:
    return {
        "form_d": {                     # None if not found
            "entity_name": str, "cik": str, "filing_date": "YYYY-MM-DD",
            "total_offering": int, "total_sold": int, "total_remaining": int,
            "date_of_first_sale": "YYYY-MM-DD", "num_investors": int,
            "related_persons": [str], "url": str,
            "accession": str,          # dedupe key
            "history": [ {filing_date, total_sold, total_offering, url, accession, is_amendment}, ... ]   # older Form Ds; D/As marked is_amendment

        },
        "linkedin": {"employees": int, "company_size": str, "url": str, "fetched_at": iso} | None,
        "press": [ {"title": str, "url": str, "date": str, "snippet": str, "amount_mentioned": int | None} ],
    }
```

Return partial results. One source failing must never break the others.

## Entity matching (from Research/Product Research/form-d-data-guide.md)

- A name search returns many filers ("Daytona" → 27). Drop pooled investment funds, real estate, `3C` exemptions, and names containing "Fund", "LP" or "Partners". Prefer the filer whose domain/state/city fits.
- Put the matched `entity_name` + `cik` in the result. Kevin's verdicts cap confidence at low when none of the filer's related persons appear in the deck.
- `primaryDocument` in the submissions JSON points at `xslFormDX01/primary_doc.xml`, which is HTML. Strip the `xslFormDX01/` prefix to get the XML. Parse with `defusedxml`.
- `total_offering` can be `"Indefinite"`; pass it through as a string, the verdict code handles it.

## Hour 0–1

- [ ] Redeem Bright Data (your own code) and the MongoDB Atlas credit. Create a free cluster, allow network access from anywhere for the hackathon, and put the connection string in `backend/.env`.
- [ ] EDGAR hello-world (no key needed). Every request must send `User-Agent: VentureSauce <your email>`. Stay under 10 requests/sec.

## Hour 1–3: EDGAR Form D (`sources/edgar.py`)

These are the endpoints we already confirmed work:

1. Name → CIK: `https://efts.sec.gov/LATEST/search-index?keysTyped=<name>` → `hits.hits[]._source.entity`, `_id` = CIK. Fuzzy-match against the company name, and prefer an SF/DE entity if there are several.
2. CIK → filings: `https://data.sec.gov/submissions/CIK<10-digit zero-padded>.json` → `filings.recent` with `form == "D"` or `"D/A"`.
3. Filing → details: `https://www.sec.gov/Archives/edgar/data/<cik>/<accession without dashes>/primary_doc.xml` → `totalOfferingAmount`, `totalAmountSold`, `totalRemaining`, `dateOfFirstSale/value`, `totalNumberAlreadyInvested`, and `relatedPersonsList` (firstName + lastName).
4. Human-readable link for the UI: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=<cik>&type=D`.

**Check against what we found by hand:** Daytona (CIK 1977563), filed 2026-08-17: $48,274,000 sold of $60,000,000. Clerk (CIK 1959758), filed 2025-07-03: $49,999,982 sold.

## Hour 3–5: Bright Data (`sources/brightdata.py`)

- [ ] **LinkedIn company:** use the Web Scraper API with the LinkedIn company dataset (get the `dataset_id` from the dashboard). It runs as an async job: trigger → poll the snapshot → read employee count and company size. Expect it to take tens of seconds to minutes, which is why the cache matters.
- [ ] **SERP:** `"<company>" raises OR funding OR "Series"` → the top 10 results. Pull dollar amounts from titles and snippets with a regex (`\$\d+(\.\d+)?\s?(M|million|B|billion)`).
- [ ] Label everything as coming from Bright Data in the returned data (`"via": "brightdata"`), so the UI can show it. That matters for the grand prize.

## Hour 4–7: MongoDB cache (`sources/cache.py`)

- [ ] Collections: `ground_truth` (key: normalized company name), `jobs`, `decks`.
- [ ] `get_ground_truth(use_cache=True)` returns the cached copy immediately when one exists, and refreshes in the background.
- [ ] Pre-warm by hour 7: **Daytona, Clerk**, plus the fictional company.
- [ ] Fictional company: load `fixtures/acme_ground_truth.json` (you write it together with Research's deck so the planned gaps line up). Mark it `"fictional": true`.

## Hour 7–10: make the demo bulletproof

- [ ] Replay mode works with wifi off.
- [ ] **Check the Daytona and Clerk numbers against their press coverage by hand.** Fill in the table below. If the press amount differs from Form D, write down exactly what each source says. Don't build a slide around a gap you haven't confirmed.
- [ ] Check every number in the demo table against its source link by clicking through.

| Company | Form D sold | Press says | Source URL | Verified by / time |
| --- | --- | --- | --- | --- |
| Daytona | $48.27M (of $60M) |  |  |  |
| Clerk | ~$50M |  |  |  |

## Done when

`get_ground_truth("Daytona", "daytona.io")` returns all three sources in under 1 second from cache, and every number matches its source link.
