import os
from pathlib import Path

from dotenv import load_dotenv

PIPELINE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(PIPELINE_DIR / ".env")

SQLMESH_DIR = PIPELINE_DIR / "sqlmesh"
DATA_DIR = Path(os.environ.get("DELTA_DATA_DIR") or PIPELINE_DIR / "data")
CACHE_DIR = DATA_DIR / "cache"

DATABASE = "delta"
LOCAL_DATABASE_PATH = DATA_DIR / f"{DATABASE}.duckdb"
MOTHERDUCK_TOKEN = os.environ.get("MOTHERDUCK_TOKEN")
GATEWAY = "motherduck" if MOTHERDUCK_TOKEN else "local"

SEC_USER_AGENT = os.environ.get("SEC_USER_AGENT", "delta javi@cmu.edu")
FORM_D_FIRST_QUARTER = os.environ.get("FORM_D_FIRST_QUARTER", "2025q1")
UNIVERSE_SIZE = int(os.environ.get("UNIVERSE_SIZE", "1000"))

BRIGHT_DATA_API_KEY = os.environ.get("BRIGHT_DATA_API_KEY") or None
BRIGHT_DATA_SERP_ZONE = os.environ.get("BRIGHT_DATA_SERP_ZONE", "oso_serp")
BRIGHT_DATA_MAX_COMPANIES = int(os.environ.get("BRIGHT_DATA_MAX_COMPANIES", "1000"))
