import xml.etree.ElementTree as ET
from dataclasses import dataclass, field

OFFERING = "offeringData"
ISSUER = "primaryIssuer"

TEXT_FIELDS = {
    "entity_name": f"{ISSUER}/entityName",
    "entity_type": f"{ISSUER}/entityType",
    "jurisdiction_of_inc": f"{ISSUER}/jurisdictionOfInc",
    "year_of_inc": f"{ISSUER}/yearOfInc/value",
    "city": f"{ISSUER}/issuerAddress/city",
    "state_or_country": f"{ISSUER}/issuerAddress/stateOrCountry",
    "industry_group": f"{OFFERING}/industryGroup/industryGroupType",
    "investment_fund_type": f"{OFFERING}/industryGroup/investmentFundInfo/investmentFundType",
    "revenue_range": f"{OFFERING}/issuerSize/revenueRange",
    "previous_accession_number": f"{OFFERING}/typeOfFiling/newOrAmendment/previousAccessionNumber",
    "date_of_first_sale": f"{OFFERING}/typeOfFiling/dateOfFirstSale/value",
    "minimum_investment": f"{OFFERING}/minimumInvestmentAccepted",
    "total_offering_amount": f"{OFFERING}/offeringSalesAmounts/totalOfferingAmount",
    "total_amount_sold": f"{OFFERING}/offeringSalesAmounts/totalAmountSold",
    "total_remaining": f"{OFFERING}/offeringSalesAmounts/totalRemaining",
    "total_investors": f"{OFFERING}/investors/totalNumberAlreadyInvested",
}

FLAG_FIELDS = {
    "is_amendment": f"{OFFERING}/typeOfFiling/newOrAmendment/isAmendment",
    "first_sale_yet_to_occur": f"{OFFERING}/typeOfFiling/dateOfFirstSale/yetToOccur",
    "more_than_one_year": f"{OFFERING}/durationOfOffering/moreThanOneYear",
    "is_equity": f"{OFFERING}/typesOfSecuritiesOffered/isEquityType",
    "is_debt": f"{OFFERING}/typesOfSecuritiesOffered/isDebtType",
    "is_pooled_fund": f"{OFFERING}/typesOfSecuritiesOffered/isPooledInvestmentFundType",
    "has_non_accredited_investors": f"{OFFERING}/investors/hasNonAccreditedInvestors",
}

PERSON_TEXT_FIELDS = {
    "first_name": "relatedPersonName/firstName",
    "middle_name": "relatedPersonName/middleName",
    "last_name": "relatedPersonName/lastName",
    "city": "relatedPersonAddress/city",
    "state_or_country": "relatedPersonAddress/stateOrCountry",
    "clarification": "relationshipClarification",
}


@dataclass(frozen=True)
class RelatedPerson:
    first_name: str | None
    middle_name: str | None
    last_name: str | None
    city: str | None
    state_or_country: str | None
    clarification: str | None
    relationships: list[str]


@dataclass(frozen=True)
class FormD:
    entity_name: str | None
    entity_type: str | None
    jurisdiction_of_inc: str | None
    year_of_inc: str | None
    city: str | None
    state_or_country: str | None
    industry_group: str | None
    investment_fund_type: str | None
    revenue_range: str | None
    previous_accession_number: str | None
    date_of_first_sale: str | None
    minimum_investment: str | None
    total_offering_amount: str | None
    total_amount_sold: str | None
    total_remaining: str | None
    total_investors: str | None
    is_amendment: bool | None
    first_sale_yet_to_occur: bool | None
    more_than_one_year: bool | None
    is_equity: bool | None
    is_debt: bool | None
    is_pooled_fund: bool | None
    has_non_accredited_investors: bool | None
    federal_exemptions: list[str]
    related_persons: list[RelatedPerson] = field(default_factory=list)


def text(element: ET.Element, path: str) -> str | None:
    found = element.find(path)
    return found.text.strip() or None if found is not None and found.text else None


def flag(element: ET.Element, path: str) -> bool | None:
    value = text(element, path)
    return None if value is None else value.lower() in {"true", "y", "yes"}


def texts(element: ET.Element, path: str) -> list[str]:
    return [found.text.strip() for found in element.findall(path) if found.text and found.text.strip()]


def strip_namespaces(root: ET.Element) -> ET.Element:
    for element in root.iter():
        element.tag = element.tag.rpartition("}")[2]
    return root


def parse_person(element: ET.Element) -> RelatedPerson:
    return RelatedPerson(
        **{name: text(element, path) for name, path in PERSON_TEXT_FIELDS.items()},
        relationships=texts(element, "relatedPersonRelationshipList/relationship"),
    )


def parse_form_d(xml: str | bytes) -> FormD:
    root = strip_namespaces(ET.fromstring(xml))
    return FormD(
        **{name: text(root, path) for name, path in TEXT_FIELDS.items()},
        **{name: flag(root, path) for name, path in FLAG_FIELDS.items()},
        federal_exemptions=texts(root, f"{OFFERING}/federalExemptionsExclusions/item"),
        related_persons=[parse_person(p) for p in root.findall("relatedPersonsList/relatedPersonInfo")],
    )
