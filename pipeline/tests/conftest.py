from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def form_index() -> str:
    return (FIXTURES / "form.20260709.idx").read_text()


@pytest.fixture
def primary_doc() -> bytes:
    return (FIXTURES / "primary_doc.xml").read_bytes()
