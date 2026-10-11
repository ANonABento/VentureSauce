"""Turn a rendered page (PNG) into a convincing scan: grey paper, slight tilt, blur and speckle, saved as an
image-only PDF (no text layer, so ingest takes the vision path).
Run from backend/: uv run python samples/src/make_scan.py <page.png> samples/08_acme_cap_table_scan_FICTIONAL.pdf [preview.webp]"""
import random
import sys

from PIL import Image, ImageFilter, ImageOps

src, out = sys.argv[1], sys.argv[2]
random.seed(7)
img = ImageOps.grayscale(Image.open(src).convert("RGB"))
img = img.point(lambda v: 28 + v * 0.83)  # ink isn't pure black, paper isn't pure white
img = img.rotate(0.6, resample=Image.BICUBIC, expand=True, fillcolor=236)
img = img.filter(ImageFilter.GaussianBlur(0.7))
px = img.load()
w, h = img.size
for _ in range(w * h // 260):  # speckle
    x, y = random.randrange(w), random.randrange(h)
    px[x, y] = max(0, px[x, y] - random.randrange(40, 120))
for x in range(0, 38):  # darker scanner edge on the left
    for y in range(h):
        px[x, y] = int(px[x, y] * (0.78 + x / 38 * 0.22))
img = img.convert("RGB")
img.save(out, "PDF", resolution=150, title="Acme AI capitalization summary (FICTIONAL company, demo data)")
if len(sys.argv) > 3:
    img.resize((w // 2, h // 2)).save(sys.argv[3], "WEBP", quality=80)
print("scanned", img.size)
