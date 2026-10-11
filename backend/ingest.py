"""Any input → plain text with page/slide markers.

Handles: text PDFs, scanned/image PDFs (vision), images (vision), PPTX, DOCX, .eml emails, web pages (.html),
plain text and other text files (.csv, .json, ...).
Raw files are never stored; only the extracted text flows on (legal-and-compliance.md).
"""

import base64
import io
import re
import zipfile
from html import unescape
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
from email import policy
from email.parser import BytesParser

import pdfplumber
from PIL import Image

from llm import transcribe_image

MAX_VISION_PAGES = 25
IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic")
TEXT_EXT = (".txt", ".md", ".markdown", ".csv", ".tsv", ".json", ".log", ".rtf", ".xml", ".yaml", ".yml")


def from_docx(data: bytes) -> str:
    """Word document → one line per paragraph (and per table row), from word/document.xml. No extra dependency."""
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        xml = z.read("word/document.xml").decode("utf-8", "replace")
    paras = re.findall(r"<w:p[ >].*?</w:p>", xml, flags=re.S)
    lines = ("".join(re.findall(r"<w:t(?: [^>]*)?>([^<]*)</w:t>", p)) for p in paras)
    return "\n".join(unescape(line).strip() for line in lines if line.strip())


def _looks_like_text(data: bytes) -> bool:
    """An unknown file is read as text only if it decodes as UTF-8 and has no binary bytes."""
    head = data[:4096]
    if b"\x00" in head:
        return False
    try:
        head.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return True


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


def _page_text(page) -> str:
    """Page text; re-read with a tighter word gap when tightly kerned PDFs (e.g. LaTeX reports) lose their spaces.
    Not the default: the tighter gap splits some numbers ("15000" → "15 000") on ordinary pages."""
    text = page.extract_text() or ""
    words = re.findall(r"[A-Za-z]+", text)
    if words and (sum(len(w) > 18 for w in words) >= 3 or sum(map(len, words)) / len(words) > 8):
        text = page.extract_text(x_tolerance=1.5) or text
    return text.strip()


def from_pdf(data: bytes) -> tuple[str, str]:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        texts = [_page_text(p) for p in pdf.pages]
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
    # Not <header>: some sites (Framer) put the whole article in one. Menus are in <nav>.
    SKIP = {"script", "style", "noscript", "svg", "nav", "footer", "form", "button", "iframe", "template"}
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
        elif name.endswith(".docx"):
            body, kind = from_docx(data), "notes"
        elif name.endswith((".html", ".htm")) or data[:300].lstrip().lower().startswith((b"<!doctype html", b"<html")):
            title, body = from_html(data)
            kind, filename = kind_hint or "text", title or filename  # the page's title is a better label than its URL
        elif name.endswith(TEXT_EXT) or _looks_like_text(data):
            raw = data.decode("utf-8", "replace")
            # A text file with mail headers is an email (e.g. a saved message without the .eml extension).
            mail = re.match(r"(?:(?:From|To|Date|Subject|Cc):[^\n]*\n){2,}", raw.lstrip(), flags=re.I)
            body, kind = raw, kind_hint or ("email" if mail else "notes")
        else:
            raise ValueError(f"unsupported file type: {filename}. Use PDF, PPTX, DOCX, an image, .eml, a text file, "
                             "or paste text")
    else:
        body, kind = (text or "").strip(), kind_hint or "text"
    if not body.strip():
        if filename and filename.endswith(".html"):
            raise ValueError("That page has no readable text (it may only load in a browser). Copy its text and paste it instead.")
        raise ValueError("No text found in this item. If it's a scan or a photo, try a clearer image.")
    return {"kind": kind, "text": body, "label": filename or {"email": "Pasted email", "notes": "Call notes"}.get(kind, "Pasted text")}
