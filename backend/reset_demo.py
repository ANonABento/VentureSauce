"""Reset the shared inbox to a known demo state. Run before a demo or before handing out a link.

    uv run python reset_demo.py            # back up the inbox, wipe it, file samples/ through the real pipeline,
                                           # and pre-record the day + week briefings (so Play starts instantly)
    uv run python reset_demo.py --empty    # back up and wipe only
    uv run python reset_demo.py --no-audio # skip the briefing recordings (no Fish credits)

The running server picks up the new inbox immediately (it reads the store on every request). Backups go to
data/backups/. Uses STORE_PATH like the server, so point it at the same file.
"""

import argparse
import asyncio
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import digest  # noqa: E402  (after load_dotenv: modules read keys at call time, but keep the order obvious)
import jobs  # noqa: E402
import store  # noqa: E402

SAMPLES = Path(__file__).parent / "samples"


def backup_and_wipe() -> None:
    if store.PATH.exists():
        dest = store.PATH.parent / "backups" / f"store-{datetime.now():%Y%m%d-%H%M%S}.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(store.PATH, dest)
        print(f"Backed up the inbox to {dest}")
    store._save({"companies": {}, "items": {}})
    print("Inbox wiped.")


async def file_samples() -> None:
    for path in sorted(p for p in SAMPLES.iterdir() if p.is_file() and p.name != "README.md"):
        start = time.time()
        job = jobs.new_job()
        await jobs.run(job, {"filename": path.name, "data": path.read_bytes()}, None, fake=False)
        if job["status"] != "ready":
            print(f"  ✗ {path.name}: {job['error']}")
            continue
        flagged = sum(c["verdict"] == "gap" for c in job["checks"])
        print(f"  ✓ {path.name} → {job['company']['name']} ({flagged} flagged, {time.time() - start:.0f}s)")


def prerecord() -> None:
    for period in ("day", "week"):
        d = digest.build(period)
        try:
            name = digest.synthesize(d["script"])
            print(f"Briefing ({period}) recorded: /audio/{name}")
        except RuntimeError as e:
            print(f"Briefing ({period}) not recorded: {e}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--empty", action="store_true", help="wipe only; don't load the samples")
    ap.add_argument("--no-audio", action="store_true", help="don't pre-record the briefings")
    args = ap.parse_args()
    print(f"Store: {store.PATH}")
    backup_and_wipe()
    if args.empty:
        return 0
    print(f"Filing {SAMPLES.name}/ through the real pipeline…")
    asyncio.run(file_samples())
    for co in store.list_companies():
        print(f"  {co['name']}: {co['item_count']} items, {co['discrepancies']} discrepancies, "
              f"{co['contradictions']} contradictions")
    if not args.no_audio:
        prerecord()
    return 0


if __name__ == "__main__":
    sys.exit(main())
