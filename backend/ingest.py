"""Any input → plain text with page/slide markers.

Handles: text PDFs, scanned/image PDFs (vision), images (vision), PPTX, .eml emails, web pages (.html), plain text.
Raw files are never stored; only the extracted text flows on (legal-and-compliance.md).
"""

import base64
import io
import re
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
from email import policy
from email.parser import BytesParser

import pdfplumber
from PIL import Image

from llm import transcribe_image

MAX_VISION_PAGES = 25
IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic")


def _jpeg_b64(img: Image.Image, max_side: int = 1600) -> str:
    img = img.convert("RGB")
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=82)
    return base64.b64encode(buf.getvalue()).decode()


def _vision(images: list[Image.Image]) -> list[str]:
    with ThreadPoolExecutor(6) as ex:
        return list(ex.map(lambda im: transcribe_image(_jpeg_b64(im)), images[:MAX_VISION_PAGES]))


def _marked(pages: list[str], label: str = "page") -> str:
    return "\n".join(f"[{label} {i}] {t.strip()}" for i, t in enumerate(pages, 1) if t and t.strip())


def from_pdf(data: bytes) -> tuple[str, str]:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        texts = [(p.extract_text() or "").strip() for p in pdf.pages]
        # Scanned/exported-as-image decks have little or no text layer: read those pages with vision.
        thin = [i for i, t in enumerate(texts) if len(t) < 40]
        if thin and len(thin) >= len(texts) / 2:
            images = [pdf.pages[i].to_image(resolution=110).original for i in thin[:MAX_VISION_PAGES]]
            for i, t in zip(thin, _vision(images)):
                texts[i] = t
            return _marked(texts), "pdf_scanned"
    return _marked(texts), "pdf"


def from_pptx(data: bytes) -> str:
    from pptx import Presentation

    slides = []
    for slide in Presentation(io.BytesIO(data)).slides:
        parts = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                parts.append(shape.text_frame.text)
            if getattr(shape, "has_table", False) and shape.has_table:
                parts += [" | ".join(c.text for c in row.cells) for row in shape.table.rows]
        if slide.has_notes_slide:
            parts.append("Speaker notes: " + slide.notes_slide.notes_text_frame.text)
        slides.append("\n".join(p for p in parts if p.strip()))
    return _marked(slides, "slide")


def from_eml(data: bytes) -> str:
    msg = BytesParser(policy=policy.default).parsebytes(data)
    body = msg.get_body(preferencelist=("plain", "html"))
    text = body.get_content() if body else ""
    head = f"From: {msg['from']}\nTo: {msg['to']}\nDate: {msg['date']}\nSubject: {msg['subject']}\n\n"
    return head + text


class _PageText(HTMLParser):
    """Readable text of a web page: skips scripts, styles and site chrome; one line per block."""
    SKIP = {"script", "style", "noscript", "svg", "nav", "footer", "header", "form", "button", "iframe", "template"}
    BLOCK = {"p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "br", "section", "article", "blockquote"}

    def __init__(self):
        super().__init__()
        self.depth, self.title, self.og, self.parts, self._in_title = 0, "", "", [], False

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.depth += 1
        elif tag == "title" and not self.title:  # the page's own title, not an icon's <title> inside an svg
            self._in_title = True
        elif tag == "meta" and dict(attrs).get("property") == "og:title":
            self.og = dict(attrs).get("content") or ""
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.depth = max(0, self.depth - 1)
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        elif not self.depth:
            self.parts.append(data)


def from_html(data: bytes) -> tuple[str, str]:
    """→ (title, text) of a web page, capped so a long page doesn't flood extraction."""
    page = _PageText()
    page.feed(data.decode("utf-8", "replace"))
    lines = (re.sub(r"\s+", " ", line).strip() for line in "".join(page.parts).split("\n"))
    text = "\n".join(line for line in lines if len(line) > 1)
    return re.sub(r"\s+", " ", page.og or page.title).strip(), text[:20000]


def to_text(filename: str | None, data: bytes | None, text: str | None, kind_hint: str | None = None) -> dict:
    """Returns {"kind", "text", "label"}. kind: pdf | pdf_scanned | slides | image | email | notes | text."""
    name = (filename or "").lower()
    if data:
        if name.endswith(".pdf") or data[:4] == b"%PDF":
            body, kind = from_pdf(data)
        elif name.endswith(".pptx"):
            body, kind = from_pptx(data), "slides"
        elif name.endswith(".eml"):
            body, kind = from_eml(data), "email"
        elif name.endswith(IMAGE_EXT):
            body, kind = _vision([Image.open(io.BytesIO(data))])[0], "image"
        elif name.endswith((".txt", ".md")):
            body, kind = data.decode("utf-8", "replace"), kind_hint or "notes"
        elif name.endswith((".html", ".htm")) or data[:300].lstrip().lower().startswith((b"<!doctype html", b"<html")):
            title, body = from_html(data)
            kind, filename = kind_hint or "text", title or filename  # the page's title is a better label than its URL
        else:
            raise ValueError(f"unsupported file type: {filename}. Use PDF, PPTX, an image, .eml, or paste text")
    else:
        body, kind = (text or "").strip(), kind_hint or "text"
    if not body.strip():
        raise ValueError("no text found in this input")
    return {"kind": kind, "text": body, "label": filename or {"email": "Pasted email", "notes": "Call notes"}.get(kind, "Pasted text")}
