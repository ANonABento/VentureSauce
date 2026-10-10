"""Live research for the voice analyst: refresh a company's public records and say what changed.

For a company in the inbox: fetch fresh ground truth, recompute every check, save, and diff against the last view.
For any other company name: fetch ground truth and summarize the raw facts (nothing is saved).
"""

import logging

import jobs
import store
from sources import ground_truth
from verdicts import usd

log = logging.getLogger(__name__)

TOOLS = [{
    "type": "function",
    "function": {
        "name": "research_company",
        "description": "Fetch fresh public records (SEC Form D, LinkedIn headcount, press) for a company and report "
                       "what changed since the last check. Use when the investor asks you to check, look up, verify, "
                       "refresh or research something about a company, or asks about a company not in the inbox.",
        "parameters": {
            "type": "object",
            "properties": {
                "company": {"type": "string", "description": "Company name as the investor said it"},
                "focus": {"type": "string", "description": "What they want checked, e.g. 'new Form D', 'headcount'"},
            },
            "required": ["company"],
        },
    },
}]


def _key(c: dict) -> tuple:
    return (c["source"], c["claim_type"], str(c.get("claimed_value")), c["claim_text"])


def diff(old: list[dict], new: list[dict]) -> list[str]:
    before = {_key(c): c for c in old}
    out = []
    for c in new:
        o = before.pop(_key(c), None)
        if o is None:
            if c["verdict"] != "match":
                out.append(f"New: {c['note']}")
        elif (o["verdict"], o.get("observed_value")) != (c["verdict"], c.get("observed_value")):
            out.append(f"Changed ({o['label']} → {c['label']}): {c['note']}")
    out += [f"No longer flagged: {o['note']}" for o in before.values() if o["verdict"] == "gap"]
    return out


def facts(gt: dict) -> list[str]:
    lines = []
    fd = gt.get("form_d")
    if fd:
        lines.append(f"Latest SEC Form D by {fd.get('entity_name')} (CIK {fd.get('cik')}), filed {fd.get('filing_date')}: "
                     f"{usd(fd.get('total_sold'))} sold of a {usd(fd.get('total_offering')) if isinstance(fd.get('total_offering'), (int, float)) else fd.get('total_offering')} offering, "
                     f"first sale {fd.get('date_of_first_sale')}, {fd.get('num_investors')} investors. "
                     f"Related persons: {', '.join(fd.get('related_persons') or []) or 'none listed'}.")
        for person in fd.get("related_people") or []:
            roles = [r for r, on in (("founder", person.get("founder")), ("director", person.get("director")),
                                     ("executive officer", person.get("officer"))) if on]
            extra = (f"; named on {person['startups_named_on']} startups' Form D filings"
                     if (person.get("startups_named_on") or 0) >= 2 else "")
            lines.append(f"{person['name']}: {', '.join(roles) or 'related person'}"
                         f"{' (' + person['title'] + ')' if person.get('title') else ''}{extra}.")
        if fd.get("history"):
            lines.append(f"Earlier Form D filings: {len(fd['history'])}.")
    else:
        lines.append("No SEC Form D found.")
    li = gt.get("linkedin")
    lines.append(f"LinkedIn lists {li['employees']} employees (as of {(li.get('fetched_at') or '')[:10]})." if li and li.get("employees") is not None
                 else "No LinkedIn company data found.")
    press = gt.get("press") or []
    lines += [f"Press: \"{p['title']}\" ({p.get('date')})" for p in press[:3]] or ["No press coverage found."]
    return lines


def research_company(company: str, focus: str | None = None) -> dict:
    """Returns {"summary": text for the model}. Never raises: failures come back as text the analyst can say."""
    live = not getattr(ground_truth, "IS_STUB", False)
    caveat = "" if live else ("NOTE: live public-record lookups aren't connected yet (demo data only). Say so plainly "
                              "if asked about real companies.")
    try:
        co = store.find_company(name=company)
        if co:
            old = (co.get("view") or {}).get("checks", [])
            gt = ground_truth.get_ground_truth(co["name"], co.get("domain"), use_cache=False)
            view = jobs.company_view(co["id"], gt)
            saved = {**(co.get("view") or {}), "company": view["company"], "items": view["items"], "checks": view["checks"]}
            store.update_company(co["id"], view=saved)
            changes = diff(old, view["checks"])
            summary = [f"Refreshed public records for {co['name']} (in the inbox)."] + facts(gt)
            summary += (["What changed since the last check:"] + changes) if changes else ["Nothing changed since the last check."]
        else:
            gt = ground_truth.get_ground_truth(company, None, use_cache=False)
            summary = [f"{company} is not in the inbox; looked up public records only."] + facts(gt)
        if focus:
            summary.append(f"The investor asked specifically about: {focus}.")
        return {"summary": "\n".join(summary + ([caveat] if caveat else []))}
    except Exception as e:
        log.warning("research_company(%s) failed: %s", company, e)
        return {"summary": f"The lookup for {company} failed ({e}). Tell the investor it didn't work and to try again."}
