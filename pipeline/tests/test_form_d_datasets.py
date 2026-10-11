import io
import zipfile
from datetime import date

import pytest

from delta.edgar import datasets

SUBMISSION_COLUMNS = ["ACCESSIONNUMBER", "FILE_NUM", "FILING_DATE", "SIC_CODE", "SUBMISSIONTYPE"]
ISSUER_COLUMNS = [
    "ACCESSIONNUMBER",
    "IS_PRIMARYISSUER_FLAG",
    "CIK",
    "ENTITYNAME",
    "STREET1",
    "CITY",
    "STATEORCOUNTRY",
    "STATEORCOUNTRYDESCRIPTION",
    "ZIPCODE",
    "ISSUERPHONENUMBER",
    "JURISDICTIONOFINC",
    "ENTITYTYPE",
    "YEAROFINC_TIMESPAN_CHOICE",
    "YEAROFINC_VALUE_ENTERED",
    *datasets.PREVIOUS_NAMES,
]
OFFERING_COLUMNS = [
    "ACCESSIONNUMBER",
    "INDUSTRYGROUPTYPE",
    "INVESTMENTFUNDTYPE",
    "REVENUERANGE",
    "FEDERALEXEMPTIONS_ITEMS_LIST",
    "ISAMENDMENT",
    "PREVIOUSACCESSIONNUMBER",
    "SALE_DATE",
    "YETTOOCCUR",
    "MORETHANONEYEAR",
    "ISEQUITYTYPE",
    "ISDEBTTYPE",
    "ISOPTIONTOACQUIRETYPE",
    "ISSECURITYTOBEACQUIREDTYPE",
    "ISPOOLEDINVESTMENTFUNDTYPE",
    "ISOTHERTYPE",
    "DESCRIPTIONOFOTHERTYPE",
    "ISBUSINESSCOMBINATIONTRANS",
    "MINIMUMINVESTMENTACCEPTED",
    "TOTALOFFERINGAMOUNT",
    "TOTALAMOUNTSOLD",
    "TOTALREMAINING",
    "HASNONACCREDITEDINVESTORS",
    "NUMBERNONACCREDITEDINVESTORS",
    "TOTALNUMBERALREADYINVESTED",
    "SALESCOMM_DOLLARAMOUNT",
    "FINDERSFEE_DOLLARAMOUNT",
    "GROSSPROCEEDSUSED_DOLLARAMOUNT",
    "GROSSPROCEEDSUSED_CLAROFRESP",
]
PERSON_COLUMNS = [
    "ACCESSIONNUMBER",
    "RELATEDPERSON_SEQ_KEY",
    "FIRSTNAME",
    "MIDDLENAME",
    "LASTNAME",
    "CITY",
    "STATEORCOUNTRY",
    *datasets.RELATIONSHIPS,
    "RELATIONSHIPCLARIFICATION",
]
ACCESSION = "0001-26-000001"


def tsv(columns: list[str], rows: list[dict[str, str]]) -> str:
    lines = ["\t".join(columns)] + ["\t".join(row.get(c, "") for c in columns) for row in rows]
    return "\n".join(lines) + "\n"


@pytest.fixture
def zf() -> zipfile.ZipFile:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as out:
        for name, body in {
            "FORMDSUBMISSION": tsv(
                SUBMISSION_COLUMNS,
                [
                    {
                        "ACCESSIONNUMBER": ACCESSION,
                        "FILE_NUM": "021-555",
                        "FILING_DATE": "02-JUL-2026",
                        "SUBMISSIONTYPE": "D",
                    }
                ],
            ),
            "ISSUERS": tsv(
                ISSUER_COLUMNS,
                [
                    {"ACCESSIONNUMBER": ACCESSION, "IS_PRIMARYISSUER_FLAG": "YES", "CIK": "1999001", "CITY": "AUSTIN"}
                    | {
                        "ENTITYNAME": "Example Robotics, Inc.",
                        "ENTITYTYPE": "Corporation",
                        "YEAROFINC_VALUE_ENTERED": "2024",
                    },
                    {
                        "ACCESSIONNUMBER": ACCESSION,
                        "IS_PRIMARYISSUER_FLAG": "NO",
                        "CIK": "1999002",
                        "ENTITYNAME": "Co LLC",
                    },
                ],
            ),
            "OFFERING": tsv(
                OFFERING_COLUMNS,
                [
                    {"ACCESSIONNUMBER": ACCESSION, "INDUSTRYGROUPTYPE": "Other Technology", "ISAMENDMENT": "false"}
                    | {"SALE_DATE": "2026-06-02", "ISEQUITYTYPE": "true", "ISOTHERTYPE": "true", "TOTALREMAINING": "0"}
                    | {
                        "TOTALOFFERINGAMOUNT": "Indefinite",
                        "TOTALAMOUNTSOLD": "12,300,000",
                        "TOTALNUMBERALREADYINVESTED": "14",
                    },
                ],
            ),
            "RELATEDPERSONS": tsv(
                PERSON_COLUMNS,
                [
                    {
                        "ACCESSIONNUMBER": ACCESSION,
                        "RELATEDPERSON_SEQ_KEY": "1",
                        "FIRSTNAME": "Ada",
                        "LASTNAME": "Lovelace",
                    }
                    | {"RELATIONSHIP_1": "Executive Officer", "RELATIONSHIP_2": "Director"}
                    | {"RELATIONSHIPCLARIFICATION": "CEO and Founder"},
                ],
            ),
        }.items():
            out.writestr(f"2026Q3_d/{name}.tsv", body)
    return zipfile.ZipFile(buffer)


def test_quarters_run_through_current_quarter():
    assert datasets.quarters("2025q3", date(2026, 10, 11)) == [
        "2025q3",
        "2025q4",
        "2026q1",
        "2026q2",
        "2026q3",
        "2026q4",
    ]


def test_filings_join_primary_issuer_and_offering(zf):
    row = datasets.filings(zf, "2026q3").row(0, named=True)

    assert row["cik"] == "0001999001"
    assert row["entity_name"] == "Example Robotics, Inc."
    assert row["filing_date"] == date(2026, 7, 2)
    assert row["first_sale_date"] == date(2026, 6, 2)
    assert row["entity_type"] == "Corporation"
    assert row["year_of_inc"] == 2024
    assert row["previous_names"] is None
    assert row["total_offering_amount_usd"] is None
    assert row["offering_amount_indefinite"] is True
    assert row["total_amount_sold_usd"] == 12300000
    assert row["num_investors"] == 14
    assert (row["is_equity"], row["is_other_security"], row["is_debt"]) == (True, True, False)
    assert row["filing_url"] == "https://www.sec.gov/Archives/edgar/data/1999001/000126000001/"


def test_related_persons_flags_roles(zf):
    row = datasets.related_persons(zf, "2026q3").row(0, named=True)

    assert row["full_name"] == "Ada Lovelace"
    assert row["relationships"] == "Executive Officer, Director"
    assert (row["is_executive_officer"], row["is_director"], row["is_promoter"]) == (True, True, False)
    assert row["title"] == "CEO and Founder"
