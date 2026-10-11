import re
from dataclasses import dataclass
from datetime import date, datetime

ARCHIVES = "https://www.sec.gov/Archives"
FORM_D_TYPES = frozenset({"D", "D/A"})

ROW = re.compile(
    r"^(?P<form_type>.+?)\s{2,}(?P<company_name>.+?)\s+(?P<cik>\d+)\s+"
    r"(?P<filed>\d{8}|\d{4}-\d{2}-\d{2})\s+(?P<path>edgar/\S+)\s*$"
)


@dataclass(frozen=True)
class IndexEntry:
    form_type: str
    company_name: str
    cik: str
    filed_date: date
    path: str

    @property
    def accession_number(self) -> str:
        return self.path.rsplit("/", 1)[-1].removesuffix(".txt")

    @property
    def folder_url(self) -> str:
        return f"{ARCHIVES}/edgar/data/{int(self.cik)}/{self.accession_number.replace('-', '')}"

    @property
    def primary_doc_url(self) -> str:
        return f"{self.folder_url}/primary_doc.xml"

    @property
    def filing_url(self) -> str:
        return f"{self.folder_url}/{self.accession_number}-index.htm"


def index_url(day: date) -> str:
    quarter = (day.month - 1) // 3 + 1
    return f"{ARCHIVES}/edgar/daily-index/{day.year}/QTR{quarter}/form.{day:%Y%m%d}.idx"


def parse_form_index(text: str) -> list[IndexEntry]:
    return [
        IndexEntry(
            form_type=match["form_type"].strip(),
            company_name=match["company_name"].strip(),
            cik=match["cik"],
            filed_date=datetime.strptime(match["filed"].replace("-", ""), "%Y%m%d").date(),
            path=match["path"],
        )
        for match in map(ROW.match, text.splitlines())
        if match and match["form_type"].strip() in FORM_D_TYPES
    ]
