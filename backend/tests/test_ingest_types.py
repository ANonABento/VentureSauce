"""Attachment types the panel accepts: every one reads to text with the right kind, or fails with a clear message."""

import io
import zipfile

import pytest

import ingest
import llm


def docx_bytes(paragraphs: list[str]) -> bytes:
    body = "".join(f'<w:p><w:r><w:t xml:space="preserve">{p}</w:t></w:r></w:p>' for p in paragraphs)
    xml = ('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
           f"<w:body>{body}</w:body></w:document>")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("word/document.xml", xml)
    return buf.getvalue()


def test_docx_reads_paragraphs():
    out = ingest.to_text("memo.docx", docx_bytes(["Acme AI raised a $10M seed.", "Team of 25 &amp; growing."]), None)
    assert out["kind"] == "notes"
    assert out["text"] == "Acme AI raised a $10M seed.\nTeam of 25 & growing."


@pytest.mark.parametrize("name", ["cap_table.csv", "deal.json", "notes.markdown", "export.tsv"])
def test_text_like_files_read_as_notes(name):
    out = ingest.to_text(name, b"company,raised\nAcme AI,10000000\n", None)
    assert out["kind"] == "notes" and "Acme AI" in out["text"]


def test_unknown_extension_with_text_content_is_read():
    out = ingest.to_text("forwarded.msgtxt", b"Founder says ARR is $3M and the team is 40 people.", None)
    assert out["kind"] == "notes"


def test_text_file_with_mail_headers_is_an_email():
    raw = b"From: Jane <jane@acme.ai>\nTo: me@fund.vc\nSubject: Acme update\n\nWe closed a $10M seed."
    assert ingest.to_text("acme_update.txt", raw, None)["kind"] == "email"


def test_binary_unknown_file_is_rejected_clearly():
    with pytest.raises(ValueError, match="unsupported file type: blob.bin"):
        ingest.to_text("blob.bin", b"\x00\x01\x02binary", None)


def test_vision_tries_next_model_when_first_returns_nothing(monkeypatch):
    replies = iter(["", "Acme AI raised $10M"])

    class Completions:
        @staticmethod
        def create(**_):
            msg = type("M", (), {"content": next(replies)})
            return type("R", (), {"choices": [type("C", (), {"message": msg})]})

    fake = type("Client", (), {"chat": type("Chat", (), {"completions": Completions})})
    monkeypatch.setattr(llm, "client", lambda: fake)
    monkeypatch.setattr(llm, "vision_models", lambda: ["first", "second"])
    assert llm.transcribe_image("b64") == "Acme AI raised $10M"
