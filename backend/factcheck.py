"""Number guard for LLM-written text: every number it says must appear in the data it was given.

Catches invented or self-computed figures ("a thirty-nine percent gap") in founder questions, the podcast script
and the voice chat. Understands numerals ("$3.6M", "3,600,000", "36%") and spoken numbers ("three point six million").
It does NOT check which source a number is attributed to; that still relies on the prompt.
"""

import re

SMALL_FREEBIES = {0, 1, 2, 3}  # "one company at a time", "two things": not worth policing
TOLERANCE = 0.011              # $3.1M vs $3.10M, rounding

_UNITS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
    "seventeen eighteen nineteen".split())}
_TENS = {w: 10 * i for i, w in enumerate("_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()) if w != "_"}
_SCALES = {"hundred": 100, "thousand": 1e3, "million": 1e6, "billion": 1e9}
_SUFFIX = {"k": 1e3, "thousand": 1e3, "m": 1e6, "mm": 1e6, "million": 1e6, "b": 1e9, "bn": 1e9, "billion": 1e9}

_NUMERAL = re.compile(r"(?<![\w.])\$?(\d[\d,]*(?:\.\d+)?)\s*(%|k|mm|m|bn|b|thousand|million|billion)?(?![\w])", re.I)
_WORD = re.compile(r"[a-z]+")


def _numerals(text: str) -> list[float]:
    out = []
    for m in _NUMERAL.finditer(text):
        raw, suffix = m.group(1).replace(",", ""), (m.group(2) or "").lower()
        try:
            v = float(raw)
        except ValueError:
            continue
        out.append(v * _SUFFIX.get(suffix, 1))
    return out


def _spoken(text: str) -> list[float]:
    """'three point six million' → 3600000; 'twenty-five' → 25; 'fifteen million dollars' → 15000000."""
    words = _WORD.findall(text.lower().replace("-", " "))
    out, i = [], 0
    while i < len(words):
        if words[i] not in _UNITS and words[i] not in _TENS:
            i += 1
            continue
        total, current, frac, j = 0.0, 0.0, "", i
        while j < len(words):
            w = words[j]
            if w in _UNITS and not frac:
                current += _UNITS[w]
            elif w in _TENS and not frac:
                current += _TENS[w]
            elif w == "point" and j + 1 < len(words) and words[j + 1] in _UNITS:
                j += 1
                while j < len(words) and words[j] in _UNITS and _UNITS[words[j]] < 10:
                    frac += str(_UNITS[words[j]])
                    j += 1
                current = float(f"{int(current)}.{frac}")
                continue
            elif w == "hundred":
                current = (current or 1) * 100
            elif w in _SCALES:
                total += (current or 1) * _SCALES[w]
                current = 0
            elif w == "and" and j + 1 < len(words) and (words[j + 1] in _UNITS or words[j + 1] in _TENS):
                pass
            else:
                break
            j += 1
        out.append(total + current)
        i = max(j, i + 1)
    return out


def numbers(text: str) -> list[float]:
    return _numerals(text) + _spoken(text)


def allowed(*sources: str) -> set[float]:
    vals = set()
    for s in sources:
        for v in numbers(s or ""):
            vals.add(v)
            # "$15M" in the data also allows "fifteen" alone, and "3.6" for "$3.6M".
            for scale in (1e3, 1e6, 1e9):
                if v >= scale:
                    vals.add(round(v / scale, 6))
    return vals


def _ok(v: float, ok: set[float]) -> bool:
    if v in SMALL_FREEBIES or 1900 <= v <= 2100:  # small counts and years
        return True
    return any(abs(v - a) <= TOLERANCE * max(abs(v), abs(a)) for a in ok)


def unsupported(text: str, ok: set[float]) -> list[float]:
    """Numbers in `text` that don't appear (within rounding) in the allowed set."""
    return [v for v in numbers(text) if not _ok(v, ok)]
