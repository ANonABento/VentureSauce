"""Reset an inbox to a known demo state. Run before a demo or before handing out a link.

    uv run python reset_demo.py                 # rebuild the "example" inbox from samples/ (real pipeline), copy it
                                                # into the "demo" inbox, pre-record its day + week briefings
    uv run python reset_demo.py --ws default    # same, into the old shared inbox (no ?ws in the URL)
    uv run python reset_demo.py --empty         # back up and wipe the demo inbox only
    uv run python reset_demo.py --no-audio      # skip the briefing recordings (no Fish credits)
    uv run python reset_demo.py --reuse         # don't rebuild "example"; just copy it (instant)

Open the demo inbox at /panel?ws=demo. Testers' "Try it with an example" button copies the "example" inbox.
The running server picks up changes immediately. Backups go to data/backups/. Uses STORE_PATH like the server.
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


def use(ws: str) -> None:
    store.WORKSPACE.set(ws)


def backup_and_wipe(ws: str) -> None:
    use(ws)
    path = store.current_path()
    if path.exists():
        dest = store.PATH.parent / "backups" / f"{ws}-{datetime.now():%Y%m%d-%H%M%S}.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        print(f"Backed up the {ws!r} inbox to {dest}")
    store._save({"companies": {}, "items": {}})
    print(f"Inbox {ws!r} wiped.")


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
    ap.add_argument("--ws", default="demo", help="inbox to reset (default: demo; 'default' = the old shared inbox)")
    ap.add_argument("--reuse", action="store_true", help="copy the existing example inbox instead of rebuilding it")
    args = ap.parse_args()
    if not store.WS_RE.match(args.ws) or args.ws == "example":
        ap.error("--ws must be lowercase letters, digits and dashes, and not 'example'")
    print(f"Store: {store.PATH.parent}")
    if args.empty:
        backup_and_wipe(args.ws)
        return 0
    if not (args.reuse and store.path_for("example").exists()):
        backup_and_wipe("example")
        print(f"Filing {SAMPLES.name}/ through the real pipeline into 'example'…")
        asyncio.run(file_samples())
    backup_and_wipe(args.ws)
    store.copy_workspace("example", args.ws)
    use(args.ws)
    print(f"Copied the example into {args.ws!r}:")
    for co in store.list_companies():
        print(f"  {co['name']}: {co['item_count']} items, {co['discrepancies']} discrepancies, "
              f"{co['contradictions']} contradictions")
    if not args.no_audio:
        prerecord()
    return 0


if __name__ == "__main__":
    sys.exit(main())
