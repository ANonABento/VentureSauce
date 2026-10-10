# Form D Data Guide: checking pitch-deck claims

For the Research and Data roles (VentureSauce side panel). Researched and tested against live EDGAR data on 2026-10-10. This is not legal advice.

## TL;DR
- A Form D is a short **notice** filed for exempt private raises under Rules 504, 506(b) and 506(c), **within 15 days after the first sale**. The first sale is "the date on which the first investor is irrevocably contractually committed to invest." There's no fee. ([SEC](https://www.sec.gov/resources-small-businesses/exempt-offerings/filing-form-d-notice), [17 CFR 230.503](https://www.law.cornell.edu/cfr/text/17/230.503))
- Fields that help check deck claims:
  - `totalAmountSold` vs. `totalOfferingAmount` (and `totalRemaining`)
  - `relatedPersonsList` (executives and directors)
  - `dateOfFirstSale`
  - the D vs. D/A history
  - `totalNumberAlreadyInvested`
- **Form D does not list investors**, the valuation, or the round name (Seed, Series A, etc.).
- **A missing Form D, or a lower Form D number, is weak evidence on its own.** Startups legitimately skip filings, file late, or file partway through a round. Use "unverified", never "false" (see legal-and-compliance.md).

## Fields to use, mapped to deck claims
| Deck claim | Form D field(s) | What a mismatch might mean | Confidence |
|---|---|---|---|
| "Raised $X" / "Closed our $X Series A" | `offeringSalesAmounts/totalAmountSold` (cash and securities sold **so far in this offering**) | Lower: the round isn't fully closed yet, it was a later close, or SAFEs weren't filed. Higher: converted SAFEs or notes are included. | Medium |
| "Raising $X" / round size | `totalOfferingAmount` (can be `Indefinite`) | Offering amount larger than announced suggests a **stealth extension** or upsized round. | Medium |
| Round still open | `totalRemaining` > 0 | Neutral. "Round still open: $11.73M unsold as of filing." | High (as of the filing date) |
| Team / board slide | `relatedPersonsList/relatedPersonInfo` with `relationship` = Executive Officer, Director or Promoter | A director **on the Form D but missing from the deck or press** may be an unannounced investor board seat. A deck "co-founder" missing from the Form D is a weak signal, since only executive officers and directors are listed. | Medium |
| Timeline ("closed in March") | `typeOfFiling/dateOfFirstSale/value` plus filing date | First sale long before the claimed close points to multiple closes or a rolling SAFE round. | Medium |
| "N investors" / "backed by X, Y, Z" | `investors/totalNumberAlreadyInvested` (count only) | Can't verify names. Only the count can be compared. | Low |
| Prior rounds | Earlier Form D and D/A filings in `data.sec.gov/submissions` | Total raised ≈ the sum across filings, but watch for double-counting (see below). | Medium |
| Instrument (SAFE vs. priced) | `typesOfSecuritiesOffered`: `isEquityType`, `isDebtType`, `isOptionToAcquireType`, `isOtherType` + `descriptionOfOtherType` ("Simple Agreement for Future Equity") | A deck says "priced seed" but the filing shows a SAFE, or the reverse. | Medium |
| "Pre-revenue" / revenue | `issuerSize/revenueRange` | **74% of filers chose "Decline to Disclose"** in our sample. Almost never usable. | Low |
| Company age, HQ | `yearOfInc`, `issuerAddress`, `jurisdictionOfInc` | The address is often a registered agent or home address. Don't flag it. | Low |

### Worked example: Daytona Platforms Inc. (CIK 1977563), verified 2026-10-10
| Filed | Offering | Sold | Remaining | First sale | Investors | Exemption |
|---|---|---|---|---|---|---|
| [2026-08-17](https://www.sec.gov/Archives/edgar/data/1977563/000197756326000002/primary_doc.xml) | $60,000,000 | $48,274,000 | $11,726,000 | 2026-07-31 | 6 | 506(b), equity |
| [2026-02-05](https://www.sec.gov/Archives/edgar/data/1977563/000197756326000001/primary_doc.xml) | $23,797,784 | $23,259,739 | $538,045 | 2026-01-22 | 9 | 506(b), equity |

Related persons are the same on both filings:
- Ivan Burazin (Executive Officer, Director)
- Vedran Jukic (Director)
- Kevin Zhang (Director)
- Matt Turck (Director; a VC partner, which shows how investor board seats appear)

How the side panel should word it: "Form D (Aug 17, 2026) shows $48.3M sold of a $60M offering; $11.7M unsold at filing." Use a neutral tone. **We have not compared these figures with Daytona's press coverage.** The Data role owns that check.

### The raw XML (trimmed)
```xml
<offeringData>
  <industryGroup><industryGroupType>Other Technology</industryGroupType></industryGroup>
  <federalExemptionsExclusions><item>06b</item></federalExemptionsExclusions>
  <typeOfFiling>
    <newOrAmendment><isAmendment>false</isAmendment></newOrAmendment>
    <dateOfFirstSale><value>2026-07-31</value></dateOfFirstSale>
  </typeOfFiling>
  <typesOfSecuritiesOffered><isEquityType>true</isEquityType></typesOfSecuritiesOffered>
  <offeringSalesAmounts>
    <totalOfferingAmount>60000000</totalOfferingAmount>
    <totalAmountSold>48274000</totalAmountSold>
    <totalRemaining>11726000</totalRemaining>
  </offeringSalesAmounts>
  <investors>
    <hasNonAccreditedInvestors>false</hasNonAccreditedInvestors>
    <totalNumberAlreadyInvested>6</totalNumberAlreadyInvested>
  </investors>
</offeringData>
```
Other paths: `primaryIssuer/entityName`, `primaryIssuer/cik`, `relatedPersonsList/relatedPersonInfo/relatedPersonName/{firstName,lastName}`, and `.../relatedPersonRelationshipList/relationship`.

## Why "raised $X" in a deck can legitimately differ from Form D
1. **SAFEs or notes were never filed.** A 506(b) SAFE round triggers a filing, but failing to file doesn't void the exemption ([Rule 503](https://www.law.cornell.edu/cfr/text/17/230.503), [Rule 507](https://www.law.cornell.edu/cfr/text/17/230.507)). Many pre-seed SAFEs never appear, and some companies raise under 4(a)(2) without Reg D. (That this is common is industry practice; we couldn't verify a rate.)
2. **Multiple closes.** The Form D is filed within 15 days of the *first* sale, so it often reflects only the first close. A D/A isn't required just because amount sold or investor count changes ([Rule 503(a)(3)](https://www.law.cornell.edu/cfr/text/17/230.503)). **The Form D number can stay frozen below the final round size indefinitely.**
3. **A 10% buffer.** Raising the offering amount by 10% or less doesn't require a D/A.
4. **SAFE conversions are counted in the priced round.** A Series A Form D may include converted SAFE or note dollars, so it can be *higher* than "new money." One filing on 2026-10-09 (Archaius Inc.) described its security as a "conversion of Simple...".
5. **Different scopes.** A deck's "total raised" spans all rounds, plus grants, debt and revenue-based financing. A single Form D covers one offering. Venture debt often isn't filed under Reg D at all.
6. **506(c) and marketing.** A 506(c) round can be publicly marketed, but it files a Form D the same way. 506(b) vs. 506(c) doesn't change the amounts, but a 506(c) round may be "announced" while it's still filling.
7. **Timing.** The deck may be newer than the latest filing (the round is still being raised), or older (the deck understates what has since been raised).
8. **Different entity.** A parent holdco, a foreign parent, or an old legal name may be the issuer. Check `issuerPreviousNameList`.

## False-positive risks testers will distrust
| Risk | Example | Mitigation |
|---|---|---|
| **Wrong entity match** | An EDGAR search for "Daytona" returns 27 Form D hits, including "TL Daytona IRF Partners LLC" and "Hall Structured Finance Daytona Beach Hotel, LP". | Match on exact legal name, then confirm a related person or city against the deck/LinkedIn. Show the matched entity name and CIK in the UI. Exclude `Pooled Investment Fund`, real-estate industry groups, and `3C` exemptions. |
| No Form D found → "gap" | A stealth or non-filing startup | Verdict **unverifiable**, not gap: "No Form D found under this name; many startups don't file." |
| Amount sold < claimed raise | A multi-close round | Flag only if the gap is >25% **and** the filing is >90 days old. Phrase it as "Form D shows $X sold as of {date}." |
| Board member not on the Form D | Board observers, or a seat added later | Show it as "not listed on latest Form D (filed {date})". |
| Form D director not in the deck | Founders may leave investor directors off their own deck | Treat it as an interesting signal ("unannounced director?"), not a contradiction. |
| SPV/fund noise | 59% of new Form Ds on 2026-10-09 were pooled funds | Filter by industry group and `3C` before matching |
| Duplicate filings | One issuer (Mars Energy Holdco) filed **6 Form Ds in one day** | Dedupe by CIK + accession, and show history as a list |
| Late filings | A filing date months after first sale | Use `dateOfFirstSale`, not the filing date, for timeline checks |

## Context: what share of Form Ds are startups?
We tested all 207 new Form Ds in the 2026-10-09 daily index (plus 158 D/As):
- 123 pooled funds (59%)
- 16 real estate
- 7 finance
- **59 (28%) operating companies with no 3(c) exemption**
- 38 (18%) operating corporations

Hand review suggests **about 15–20% are venture-style startups.** This matters for name lookups: most same-name hits will be funds or real estate.

Industry group list: [Form D, Item 4](https://www.sec.gov/files/formd.pdf).
