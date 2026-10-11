"""Fetch public records for the demo companies now and save them as snapshots, the backup if live lookups fail on
stage (bad wifi, rate limits). Everything saved is what SEC EDGAR and Bright Data returned, with source links.

    uv run python prewarm_sources.py                 # the default list below
    uv run python prewarm_sources.py "Some Company"  # or any companies
"""

import json
import sys

from dotenv import load_dotenv

load_dotenv(".env")

from sources import minimal_live  # noqa: E402

# Startups only: funds, banks and universities don't file the kind of Form D we check.
DEFAULT = ["Daytona", "Clerk", "Legora", "Tailor Brands", "Base44", "Pavoot", "Athena"]

if __name__ == "__main__":
    minimal_live.SNAPSHOTS.mkdir(parents=True, exist_ok=True)
    for company in sys.argv[1:] or DEFAULT:
        found = minimal_live.lookup(company, use_cache=False)
        if found.get("from_snapshot"):
            print(f"  ✗ {company}: {', '.join(found['from_snapshot'])} failed live; snapshot not overwritten")
            continue
        (minimal_live.SNAPSHOTS / f"{minimal_live.slug(company)}.json").write_text(json.dumps(found, indent=1))
        fd = found.get("form_d") or {}
        print(f"  ✓ {company}: Form D {fd.get('entity_name') or 'none'}"
              f"{f' (${fd.get('total_sold'):,} sold, filed {fd.get('filing_date')})' if fd else ''}, "
              f"{len(found.get('press') or [])} press")
