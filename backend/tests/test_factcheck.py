import pytest

import factcheck as fc

DATA = ("Form D shows $15M sold vs. $10M claimed. LinkedIn lists 9 employees vs. 25 claimed (36%). "
        "Deck says $3.10M; Email (2026-10-08) says $3.60M; Call notes say $2.20M.")
OK = fc.allowed(DATA)


@pytest.mark.parametrize("text,expected", [
    ("three point six million", [3_600_000]),
    ("fifteen million dollars", [15_000_000]),
    ("twenty-five engineers", [25]),
    ("two hundred and forty", [240]),
    ("$3.6M and 3,100,000", [3_600_000, 3_100_000]),
    ("36% of the claim", [36]),
])
def test_parses_numerals_and_spoken_numbers(text, expected):
    assert sorted(fc.numbers(text)) == sorted(expected)


@pytest.mark.parametrize("text", [
    "The deck says three point one million, your email says three point six million.",
    "Form D shows fifteen million dollars sold versus ten million claimed.",
    "LinkedIn shows nine employees against twenty-five claimed, about 36%.",
    "Two things came in on October eight, 2026.",
    "Is the fifteen the right number?",
])
def test_supported_text_passes(text):
    assert fc.unsupported(text, OK) == []


@pytest.mark.parametrize("text,bad", [
    ("That's a thirty-nine percent gap.", 39),
    ("ARR is four point two million.", 4_200_000),
    ("They raised $22M in total.", 22_000_000),
])
def test_invented_numbers_are_flagged(text, bad):
    assert bad in fc.unsupported(text, OK)
