import zipfile
from collections.abc import Iterator
from datetime import date
from pathlib import Path

import httpx
import polars as pl

BASE_URLS = (
    "https://www.sec.gov/files/structureddata/data/form-d-data-sets/",
    "https://www.sec.gov/files/datastandardsinnovation/data/form-d-data-sets/",
)
RELATIONSHIPS = ["RELATIONSHIP_1", "RELATIONSHIP_2", "RELATIONSHIP_3"]
PREVIOUS_NAMES = ["ISSUER_PREVIOUSNAME_1", "ISSUER_PREVIOUSNAME_2", "EDGAR_PREVIOUSNAME_1", "EDGAR_PREVIOUSNAME_2"]


def quarters(first: str, today: date) -> list[str]:
    year, quarter = int(first[:4]), int(first[-1])
    last = (today.year, (today.month - 1) // 3 + 1)
    out = []
    while (year, quarter) <= last:
        out.append(f"{year}q{quarter}")
        year, quarter = (year + 1, 1) if quarter == 4 else (year, quarter + 1)
    return out


def download(quarter: str, cache_dir: Path, user_agent: str) -> Path | None:
    path = cache_dir / f"{quarter}_d.zip"
    if path.exists():
        return path
    cache_dir.mkdir(parents=True, exist_ok=True)
    with httpx.Client(headers={"User-Agent": user_agent}, timeout=300, follow_redirects=True) as http:
        for base in BASE_URLS:
            response = http.get(f"{base}{quarter}_d.zip")
            if response.status_code == httpx.codes.OK and response.content[:2] == b"PK":
                partial = path.with_suffix(".part")
                partial.write_bytes(response.content)
                partial.replace(path)
                return path
    return None


def available(first: str, today: date, cache_dir: Path, user_agent: str) -> Iterator[tuple[str, zipfile.ZipFile]]:
    for quarter in quarters(first, today):
        if path := download(quarter, cache_dir, user_agent):
            with zipfile.ZipFile(path) as zf:
                yield quarter, zf


def read_tsv(zf: zipfile.ZipFile, table: str) -> pl.DataFrame:
    name = next(n for n in zf.namelist() if n.upper().rsplit("/", 1)[-1] == f"{table}.TSV")
    return pl.read_csv(
        zf.read(name), separator="\t", infer_schema_length=0, quote_char=None, truncate_ragged_lines=True
    )


def num(column: str) -> pl.Expr:
    return pl.col(column).str.strip_chars().str.replace_all(",", "").cast(pl.Float64, strict=False)


def flag(column: str) -> pl.Expr:
    return (pl.col(column).str.to_lowercase() == "true").fill_null(False)


def blank_to_null(expr: pl.Expr) -> pl.Expr:
    return pl.when(expr == "").then(None).otherwise(expr)


def filing_date(column: str) -> pl.Expr:
    value = pl.col(column).str.strip_chars().str.to_titlecase()
    return pl.coalesce(value.str.to_date("%d-%b-%Y", strict=False), value.str.to_date("%Y-%m-%d", strict=False))


def filings(zf: zipfile.ZipFile, quarter: str) -> pl.DataFrame:
    submissions = read_tsv(zf, "FORMDSUBMISSION")
    issuers = read_tsv(zf, "ISSUERS").filter(pl.col("IS_PRIMARYISSUER_FLAG") == "YES")
    issuers = issuers.unique(subset=["ACCESSIONNUMBER"], keep="first")
    offerings = read_tsv(zf, "OFFERING")
    df = submissions.join(issuers, on="ACCESSIONNUMBER", how="left").join(offerings, on="ACCESSIONNUMBER", how="left")
    return df.select(
        pl.col("ACCESSIONNUMBER").alias("accession_number"),
        pl.lit(quarter.upper()).alias("data_set_quarter"),
        pl.col("CIK").str.strip_chars().str.zfill(10).alias("cik"),
        pl.col("ENTITYNAME").str.strip_chars().alias("entity_name"),
        filing_date("FILING_DATE").alias("filing_date"),
        pl.col("SUBMISSIONTYPE").alias("submission_type"),
        pl.col("FILE_NUM").str.strip_chars().alias("file_number"),
        pl.col("STREET1").alias("street1"),
        pl.col("CITY").alias("city"),
        pl.col("STATEORCOUNTRY").alias("state_or_country"),
        pl.col("STATEORCOUNTRYDESCRIPTION").alias("state_or_country_desc"),
        pl.col("ZIPCODE").alias("zipcode"),
        pl.col("ISSUERPHONENUMBER").alias("phone"),
        pl.col("JURISDICTIONOFINC").alias("jurisdiction_of_inc"),
        pl.col("ENTITYTYPE").alias("entity_type"),
        pl.col("YEAROFINC_TIMESPAN_CHOICE").alias("year_of_inc_choice"),
        pl.col("YEAROFINC_VALUE_ENTERED").cast(pl.Int64, strict=False).alias("year_of_inc"),
        blank_to_null(pl.concat_str([pl.col(c) for c in PREVIOUS_NAMES], separator="; ", ignore_nulls=True)).alias(
            "previous_names"
        ),
        pl.col("INDUSTRYGROUPTYPE").alias("industry_group"),
        pl.col("INVESTMENTFUNDTYPE").alias("investment_fund_type"),
        pl.col("REVENUERANGE").alias("revenue_range"),
        pl.col("FEDERALEXEMPTIONS_ITEMS_LIST").alias("federal_exemptions"),
        flag("ISAMENDMENT").alias("is_amendment"),
        pl.col("PREVIOUSACCESSIONNUMBER").alias("previous_accession_number"),
        pl.col("SALE_DATE").str.strip_chars().str.to_date("%Y-%m-%d", strict=False).alias("first_sale_date"),
        flag("YETTOOCCUR").alias("first_sale_yet_to_occur"),
        flag("MORETHANONEYEAR").alias("more_than_one_year"),
        flag("ISEQUITYTYPE").alias("is_equity"),
        flag("ISDEBTTYPE").alias("is_debt"),
        flag("ISOPTIONTOACQUIRETYPE").alias("is_option_warrant"),
        flag("ISSECURITYTOBEACQUIREDTYPE").alias("is_security_to_be_acquired"),
        flag("ISPOOLEDINVESTMENTFUNDTYPE").alias("is_pooled_fund_interest"),
        flag("ISOTHERTYPE").alias("is_other_security"),
        pl.col("DESCRIPTIONOFOTHERTYPE").alias("other_security_desc"),
        flag("ISBUSINESSCOMBINATIONTRANS").alias("is_business_combination"),
        num("MINIMUMINVESTMENTACCEPTED").alias("minimum_investment_usd"),
        num("TOTALOFFERINGAMOUNT").alias("total_offering_amount_usd"),
        (pl.col("TOTALOFFERINGAMOUNT").str.strip_chars().str.to_lowercase() == "indefinite")
        .fill_null(False)
        .alias("offering_amount_indefinite"),
        num("TOTALAMOUNTSOLD").alias("total_amount_sold_usd"),
        num("TOTALREMAINING").alias("total_remaining_usd"),
        flag("HASNONACCREDITEDINVESTORS").alias("has_non_accredited_investors"),
        pl.col("NUMBERNONACCREDITEDINVESTORS").cast(pl.Int64, strict=False).alias("num_non_accredited_investors"),
        pl.col("TOTALNUMBERALREADYINVESTED").cast(pl.Int64, strict=False).alias("num_investors"),
        num("SALESCOMM_DOLLARAMOUNT").alias("sales_commission_usd"),
        num("FINDERSFEE_DOLLARAMOUNT").alias("finders_fee_usd"),
        num("GROSSPROCEEDSUSED_DOLLARAMOUNT").alias("proceeds_to_insiders_usd"),
        pl.col("GROSSPROCEEDSUSED_CLAROFRESP").alias("proceeds_to_insiders_note"),
    ).with_columns(
        pl.concat_str(
            [
                pl.lit("https://www.sec.gov/Archives/edgar/data/"),
                pl.col("cik").str.strip_chars_start("0"),
                pl.lit("/"),
                pl.col("accession_number").str.replace_all("-", ""),
                pl.lit("/"),
            ]
        ).alias("filing_url")
    )


def related_persons(zf: zipfile.ZipFile, quarter: str) -> pl.DataFrame:
    persons = read_tsv(zf, "RELATEDPERSONS")
    roles = [pl.col(c) for c in RELATIONSHIPS]
    return persons.select(
        pl.col("ACCESSIONNUMBER").alias("accession_number"),
        pl.lit(quarter.upper()).alias("data_set_quarter"),
        pl.col("RELATEDPERSON_SEQ_KEY").cast(pl.Int64, strict=False).alias("person_seq"),
        pl.col("FIRSTNAME").str.strip_chars().alias("first_name"),
        pl.col("MIDDLENAME").str.strip_chars().alias("middle_name"),
        pl.col("LASTNAME").str.strip_chars().alias("last_name"),
        pl.concat_str([pl.col("FIRSTNAME"), pl.col("LASTNAME")], separator=" ", ignore_nulls=True)
        .str.strip_chars()
        .alias("full_name"),
        pl.col("CITY").alias("city"),
        pl.col("STATEORCOUNTRY").alias("state_or_country"),
        pl.concat_str(roles, separator=", ", ignore_nulls=True).alias("relationships"),
        pl.any_horizontal([r == "Executive Officer" for r in roles]).fill_null(False).alias("is_executive_officer"),
        pl.any_horizontal([r == "Director" for r in roles]).fill_null(False).alias("is_director"),
        pl.any_horizontal([r == "Promoter" for r in roles]).fill_null(False).alias("is_promoter"),
        pl.col("RELATIONSHIPCLARIFICATION").alias("title"),
    )
