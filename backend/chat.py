"""Talk to your briefing: a streaming, interruptible voice analyst grounded in the deal inbox.

The client streams text from POST /chat/stream, cuts it into sentences, and voices each one through POST /tts
(Fish Audio, streamed). When the user interrupts, the client stops playback and sends the next turn with the history.
"""

import json
import logging
import os
from collections.abc import Iterator

import re

import delta
import factcheck
import research
import digest
import store
from llm import client

log = logging.getLogger(__name__)

SYSTEM = """You are VentureSauce, a sharp, friendly analyst briefing a VC investor out loud, like a colleague walking
with them to the office. Everything you say is spoken, so:
- Short spoken sentences. No lists, no markdown, no emoji. Say numbers the way they're spoken ("three point six million").
- Keep each turn under 70 words unless the investor asks for detail.

Briefing flow: when asked to start, give a one-sentence overview of what came in, then cover ONE company (its most
important discrepancy or contradiction and the best question to ask), then ask whether they want more on it or the
next company. Contradictions between the investor's own sources come first; they're the most interesting.

Answering questions: use ONLY the inbox data below. Say which source said what ("the deck says…, your call notes say…").
Never calculate new numbers or percentages; never guess. If the answer isn't in the data, say so plainly and suggest
what to ask the founder or what to drop into the inbox. Never say a founder lied and never say "red flag"; say numbers "don't line up". Speak to the investor ("the founder told you"), never as the founder.
Refer to people by name, never with he/she pronouns. Mention it when a company is fictional (a demo company).
Research: when the investor asks you to check, look up, verify or refresh something about a company (or asks about
a company not in the inbox), call research_company. Then report what the lookup found and what changed, citing the
source (SEC Form D, LinkedIn, press). If the result says lookups aren't connected yet, say that plainly.
If a message starts with "[I cut you off mid-answer.]", don't repeat yourself or mention the interruption: answer the
new question directly, then offer to pick the briefing back up."""


def context(period: str = "week") -> str:
    """Compact, spoken-friendly snapshot of the inbox: the digest plus every company's checks and questions."""
    d = digest.build(period, script=False) if store.list_companies() else None
    lines = []
    if d:
        lines.append(f"Inbox over the last {period}: {d['totals']['items']} new items across {d['totals']['companies']} "
                     f"companies; {d['totals']['discrepancies']} discrepancies, {d['totals']['contradictions']} contradictions.")
    for co in store.list_companies():
        full = store.get_company(co["id"]) or {}
        view = full.get("view")
        if not view:
            continue
        head = view.get("company") or {}
        lines.append(f"\n## {co['name']}{' (FICTIONAL demo company)' if head.get('fictional') else ''}"
                     f"{' · SEC filer: ' + head['form_d_entity'] if head.get('form_d_entity') else ''}")
        lines.append("Items in inbox: " + "; ".join(f"{i['kind_name']} '{i['label']}' ({(i.get('item_date') or i['received_at'])[:10]})"
                                                   for i in view.get("items", [])))
        report = delta.to_report(view)
        for r in report["rows"]:
            lines.append(f"- [{r['status']}] {r['signal']}: {r['summary']}")
        for q in view.get("questions", [])[:5]:
            lines.append(f"? {q['question']}")
    return "\n".join(lines) if lines else "The inbox is empty. Nothing has been dropped in yet."


SENTENCE = re.compile(r"^([\s\S]{25,}?[.!?])(\s+)")
FALLBACK_LINE = "I don't have a reliable figure for that in your inbox, so I won't guess."


def stream(messages: list[dict], period: str = "week") -> Iterator[str]:
    """Yields whole sentences, each fact-checked: a sentence with a number that isn't in the inbox data, a research
    result, or what the investor said is replaced before it can be spoken. May call research_company mid-answer."""
    ctx = context(period)
    ok = factcheck.allowed(ctx, *(m["content"] for m in messages if m.get("role") == "user"))
    convo = [{"role": "system", "content": SYSTEM + "\n\n# Inbox data\n" + ctx}]
    convo += [{"role": m["role"], "content": m["content"]} for m in messages[-20:] if m.get("role") in ("user", "assistant")]

    for round_ in range(2):  # at most one research round, then answer
        pending, calls = "", []
        for kind, payload in _model_stream(convo, tools=research.TOOLS if round_ == 0 else None):
            if kind == "tool":
                calls = payload
                continue
            pending += payload
            while (m := SENTENCE.match(pending)):
                yield _checked(m.group(1), ok) + m.group(2)
                pending = pending[m.end():]
        if pending.strip():
            yield _checked(pending, ok) + " "
        if not calls:
            return

        # Say something while we look it up, so the investor isn't left in silence.
        names = ", ".join(sorted({c["args"].get("company", "that company") for c in calls}))
        yield f"Give me a second, I'm checking public records for {names}. "
        convo.append({"role": "assistant", "content": None, "tool_calls": [
            {"id": c["id"], "type": "function", "function": {"name": c["name"], "arguments": json.dumps(c["args"])}} for c in calls]})
        for c in calls:
            result = research.research_company(**{k: v for k, v in c["args"].items() if k in ("company", "focus")})
            ok |= factcheck.allowed(result["summary"])
            convo.append({"role": "tool", "tool_call_id": c["id"], "content": result["summary"]})


def _checked(sentence: str, ok: set[float]) -> str:
    # It's spoken: drop markdown bullets/bold the model sometimes slips in.
    sentence = re.sub(r"(?m)^\s*(?:[-*•]|\d+\.)\s+", "", sentence).replace("**", "")
    bad = factcheck.unsupported(sentence, ok)
    if bad:
        log.warning("chat: replaced sentence with unsupported numbers %s: %r", bad, sentence)
        return FALLBACK_LINE
    return sentence


def _model_stream(convo: list[dict], tools: list | None) -> Iterator[tuple[str, object]]:
    """Yields ("text", delta) as it streams, then ("tool", [calls]) if the model asked for research.
    Tries the primary model, then the fallback, if the stream fails before producing anything."""
    models = [os.getenv("CHAT_MODEL") or os.getenv("LLM_MODEL", "openai/gpt-oss-120b"),
              os.getenv("LLM_FALLBACK_MODEL", "deepseek-ai/DeepSeek-V4.1-Flash")]
    for model in models:
        started, calls = False, []
        try:
            extra = {"reasoning_effort": "low"} if "gpt-oss" in model else {}
            if tools:
                extra["tools"] = tools
            for chunk in client().chat.completions.create(model=model, messages=convo, stream=True,
                                                          temperature=0.3, max_tokens=600, **extra):
                if not chunk.choices:
                    continue
                d = chunk.choices[0].delta
                if d.content:
                    started = True
                    yield "text", d.content
                for tc in d.tool_calls or []:
                    started = True
                    # gpt-oss sometimes continues one call's arguments under a new index with no name: append.
                    if tc.function and tc.function.name or not calls:
                        calls.append({"id": tc.id or f"call_{len(calls)}", "name": (tc.function and tc.function.name) or "", "raw": ""})
                    calls[-1]["raw"] += (tc.function and tc.function.arguments) or ""
            if calls:
                parsed = []
                for c in calls:
                    try:
                        args = json.loads(c["raw"] or "{}")
                    except json.JSONDecodeError:
                        args = {}
                    if c["name"] == "research_company" and args.get("company"):
                        parsed.append({"id": c["id"], "name": c["name"], "args": args})
                if parsed:
                    yield "tool", parsed
            return
        except Exception as e:
            log.warning("chat stream %s failed: %s", model, e)
            if started:
                return
    yield "text", "Sorry, I lost my train of thought. Could you ask that again?"


def sse(messages: list[dict], period: str) -> Iterator[str]:
    for text in stream(messages, period):
        yield f"data: {json.dumps({'text': text})}\n\n"
    yield "data: {\"done\": true}\n\n"
