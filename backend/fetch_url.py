"""A pasted or dropped link → an upload for the normal pipeline.

Direct files (PDF, PPTX, images, .eml, .txt) come back as-is; web pages come back as .html for ingest to turn into
text. Links to our own /samples/ are read from disk (that's how the demo desk's attachments arrive, and it works on
localhost where the network guard below would refuse). Everything else is fetched with a guard against internal
addresses, a size cap and a timeout.
"""

import ipaddress
import mimetypes
import socket
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

import httpx

MAX_BYTES = 25 * 1024 * 1024
TIMEOUT = 15
MAX_REDIRECTS = 4
SAMPLES = Path(__file__).parent / "samples"
# Share links that only show a login page to a server.
LOGIN_WALLS = ("docsend.com", "drive.google.com", "docs.google.com", "dropbox.com", "box.com", "notion.so", "sharepoint.com")
EXT = {"application/pdf": ".pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
       "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif", "message/rfc822": ".eml",
       "text/plain": ".txt", "text/markdown": ".md", "text/html": ".html", "application/xhtml+xml": ".html"}


class LinkError(ValueError):
    """A link we can't or won't open; the message is shown to the user."""


def _public(host: str) -> None:
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise LinkError(f"Couldn't find {host}. Check the link.")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise LinkError("That link points to a private network address, so it can't be opened from here.")


def _name(url: str, content_type: str, disposition: str | None) -> str:
    if disposition and "filename=" in disposition:
        name = disposition.split("filename=")[-1].strip('"; ')
        if name:
            return name
    path = urlparse(url)
    base = unquote(Path(path.path).name) or path.hostname or "link"
    ext = EXT.get(content_type) or mimetypes.guess_extension(content_type) or ""
    if content_type in ("text/html", "application/xhtml+xml"):
        return f"{path.hostname}{path.path.rstrip('/') or ''}.html".replace("/", "_")
    return base if Path(base).suffix else base + ext


def fetch(url: str) -> dict:
    """→ {"filename", "data"} for ingest.to_text. Raises LinkError with a message for the user."""
    url = url.strip()
    if "://" not in url:
        url = "https://" + url
    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise LinkError("Only web links (http or https) can be opened.")
    if parts.path.startswith("/samples/"):
        local = SAMPLES / Path(unquote(parts.path)).name
        if local.is_file():
            return {"filename": local.name, "data": local.read_bytes()}
    host = parts.hostname.lower()
    if any(host == w or host.endswith("." + w) for w in LOGIN_WALLS):
        raise LinkError("That's a share link that needs a login. Download the file and drop it in instead.")

    with httpx.Client(timeout=TIMEOUT, follow_redirects=False,
                      headers={"User-Agent": "Mozilla/5.0 (VentureSauce link reader)"}) as client:
        for _ in range(MAX_REDIRECTS + 1):
            _public(urlparse(url).hostname or "")
            with client.stream("GET", url) as r:
                if r.is_redirect and r.headers.get("location"):
                    url = urljoin(url, r.headers["location"])
                    continue
                if r.status_code in (401, 403):
                    raise LinkError("That page needs a login. Download the file and drop it in instead.")
                if r.status_code >= 400:
                    raise LinkError(f"That link returned an error ({r.status_code}).")
                data = bytearray()
                for chunk in r.iter_bytes():
                    data += chunk
                    if len(data) > MAX_BYTES:
                        raise LinkError("That file is over 25 MB.")
                content_type = r.headers.get("content-type", "").split(";")[0].strip().lower()
                return {"filename": _name(url, content_type, r.headers.get("content-disposition")), "data": bytes(data)}
    raise LinkError("That link redirects too many times.")
