from collections.abc import Iterator
from contextlib import contextmanager
from datetime import date
from importlib.resources import files

import duckdb
import pandas as pd

from delta import settings

RAW_DDL = files("delta").joinpath("sql/raw.sql").read_text()


@contextmanager
def connect() -> Iterator[duckdb.DuckDBPyConnection]:
    if settings.MOTHERDUCK_TOKEN:
        con = duckdb.connect("md:", config={"motherduck_token": settings.MOTHERDUCK_TOKEN})
        con.execute(f"CREATE DATABASE IF NOT EXISTS {settings.DATABASE}")
        con.execute(f"USE {settings.DATABASE}")
    else:
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
        con = duckdb.connect(str(settings.LOCAL_DATABASE_PATH))
    try:
        con.execute(RAW_DDL)
        yield con
    finally:
        con.close()


@contextmanager
def transaction(con: duckdb.DuckDBPyConnection) -> Iterator[duckdb.DuckDBPyConnection]:
    con.begin()
    try:
        yield con
    except BaseException:
        con.rollback()
        raise
    con.commit()


def replace_day(con: duckdb.DuckDBPyConnection, table: str, day: date, rows: list[dict]) -> None:
    with transaction(con):
        con.execute(f"DELETE FROM {table} WHERE filed_date = ?", [day])
        if rows:
            con.register("incoming", pd.DataFrame(rows))
            con.execute(f"INSERT INTO {table} BY NAME SELECT * FROM incoming")
            con.unregister("incoming")
