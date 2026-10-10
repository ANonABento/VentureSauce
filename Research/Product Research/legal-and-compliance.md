# Legal and Compliance: decks in, verdicts out

This is practical guidance for a hackathon build of VentureSauce, not legal advice. Researched on 2026-10-10. Items marked **(unverified)** are industry practice or our reading, not checked against a primary source.

## TL;DR
1. **Using Form D data is fine.**
   - It's a public filing on a US government system. Facts aren't copyrightable.
   - Respect SEC fair-access rules (User-Agent, ≤10 req/s).
   - Don't imply SEC endorsement.
   - Sources: [EDGAR access](https://www.sec.gov/os/accessing-edgar-data), [17 USC 105](https://www.law.cornell.edu/uscode/text/17/105).
2. **Uploading decks is the biggest adoption risk.** Associates may be barred by fund policy from putting deck contents into third-party tools (our hypothesis H5). Answer it with data handling, not with an NDA.
3. **Publicly labeling a named founder's claim a "gap" is the biggest legal risk** (defamation and trade libel). Keep verdicts private to the user, cite a source for every one, and word them as observations ("unverified", "differs from Form D"), never as accusations ("false", "lied").

## 1. Confidential decks and third-party tools
**What's true about deck confidentiality**
- **VCs generally don't sign NDAs to read decks** (well known; unverified). So a deck usually isn't covered by an NDA. Even so, founders expect discretion, and some decks carry "Confidential" legends or were shared under an NDA in a later diligence stage.
- Funds increasingly have **AI/data policies** that restrict pasting portfolio or deal materials into unapproved SaaS or LLMs (unverified, but expect this objection from any VC judge). A deck shared under a data-room NDA (later stage) almost certainly can't be uploaded.
- The deck holds the company's information, and it may also hold personal data: founder names, photos, emails, cap-table names. California (CCPA/CPRA) and EU (GDPR) rules may apply if we store it. See the [CA AG CCPA page](https://oag.ca.gov/privacy/ccpa).

**What VentureSauce should do and say (cheap to build today)**
| Control | Why | Effort |
|---|---|---|
| Send only the **extracted claims plus the company name** to the enrichment sources (Bright Data, EDGAR). The deck file never goes to them. | Limits who sees the deck | Already in the architecture |
| LLM provider on commercial API terms. **Anthropic: by default, commercial API inputs aren't used for training** ([Anthropic privacy center](https://privacy.anthropic.com/en/articles/7996868-is-my-data-used-for-model-training), [commercial terms](https://www.anthropic.com/legal/commercial-terms)). Check the current wording before quoting it on stage. | It's the first question a judge will ask | 0 |
| Store the parsed claims and verdicts. **Don't store the raw PDF**, or delete it after parsing. Add a "Delete this analysis" button and a retention note (e.g., "deleted after 30 days"). | Minimizes what's kept | Low |
| Never use one user's deck data in another user's output. The plan already cut the anonymized feed; keep any benchmarks opt-in and aggregate. | Selling insights drawn from confidential decks is the deal-breaker objection | 0 |
| Paste-text mode, so users can redact before analyzing. | Gives compliance teams a path | Already planned |
| One-line panel footer: "Your deck stays private to you. Only company names are sent to public-data sources. Not investment advice." | Builds trust, and is a slide-worthy answer | Low |

**Questions to ask in interviews (feeds H5):**
- "Would your fund let you upload a deck to a tool like this? What would compliance need to see? SOC 2? Self-hosting? No retention?"

## 2. Risks of labeling a founder's claim a "gap"
**Legal frame**
- Defamation requires a false statement **of fact** that harms reputation and is communicated to a third party. Truth is a defense. ([Cornell LII: defamation](https://www.law.cornell.edu/wex/defamation))
- Opinions that imply false facts can still be actionable ([*Milkovich v. Lorain Journal*, 497 U.S. 1 (1990)](https://www.law.cornell.edu/supremecourt/text/497/1)). So "this founder is lying" is risky even when it's framed as an opinion.
- Statements about a company's business can also be **trade libel** (injurious falsehood).
- **Section 230 doesn't protect content we generate ourselves.** An LLM-written verdict is our speech, not a third party's ([47 USC 230](https://www.law.cornell.edu/uscode/text/47/230)). (Our reading; courts haven't settled how AI output is treated. Unverified.)
- Risk rises sharply when the content is **published**. A private analysis shown only to the user who uploaded the deck is far lower risk than a shared, public or sold "gap" label. Today's plan keeps verdicts private, so keep it that way.

**Where the false-positive risk comes from** (see form-d-data-guide.md)
- Matching the wrong EDGAR entity (same-name funds or hotels)
- Form D undercounting rounds that had multiple closes
- SAFEs that were never filed
- LinkedIn undercounting early teams and contractors (hypothesis H3)
- LLM misreading a deck

Each of these produces a "gap" that isn't real. That's both a legal risk and the fastest way to lose testers' trust.

### Wording guide (use it in the verdict enum and the LLM prompt)
| Avoid | Use instead |
|---|---|
| False / Lie / Misrepresented / Inflated | **Differs from source**: "Deck: $5M raised. Form D (Mar 3, 2026): $3.2M sold of a $5M offering." |
| Gap (alone, in red) | **Unverified** or **Doesn't match public records yet**. Keep "gap" as an internal enum only. |
| "No funding found" | "No Form D found under '{legal name}'. Many startups don't file or file late." |
| "Founder overstated headcount" | "LinkedIn lists 9 employees; the deck says 25. LinkedIn often undercounts early teams and contractors." |
| "Unannounced investor" | "Form D lists Matt Turck as a director; not on the deck's board slide." |
| A confident score | Show **confidence plus the reason**, and always link the source |

**Rules for the panel**
1. Every verdict shows the claimed value, the observed value, a source link and the source's date. No verdict without a receipt.
2. State observed facts. Let the analyst draw the conclusion.
3. Add a "Questions to ask the founder" framing. It turns a possible accusation into diligence.
4. Show `unverifiable` by default whenever entity match confidence is low.
5. Disclaimer: "Automated comparison of public records. May be incomplete or out of date. Not investment advice."
6. **Demo:** follow the plan's rule. Use a clearly labeled fictional company for the dramatic gaps. Present real companies (Daytona, Clerk) only with neutral facts, and never say a real founder misled anyone.

## 3. Other notes
- **Bright Data / LinkedIn:** scraping public LinkedIn data has a long legal history (hiQ v. LinkedIn ended in 2022 with hiQ found liable for breach of LinkedIn's user agreement; unverified detail). Going through Bright Data's compliant data products shifts collection to them, but don't log in to LinkedIn accounts, and store only company-level counts.
- **Investment-adviser risk:** the per-deck tool doesn't recommend securities, so it's low risk. Keep the "not investment advice" footer. If the paid feed or scout notes ever return, revisit the Advisers Act publisher exclusion (*Lowe v. SEC*, 472 U.S. 181 (1985)) and [15 USC 80b-2(a)(11)](https://www.law.cornell.edu/uscode/text/15/80b-2).
- **Founder-facing features** (e.g., founders sharing their round) can create general-solicitation problems for 506(b) issuers ([SEC on 506(b)](https://www.sec.gov/resources-small-businesses/exempt-offerings/private-placements-rule-506b), [506(c)](https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c)). This is out of scope for today.
