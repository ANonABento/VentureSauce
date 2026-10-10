"""Generate the placeholder VentureSauce icons into extension/icons/.

The mark is the "sunrise": an amber sun half-risen over a pine horizon line on
paper. Replace these files with the Figma "App icon" exports when they exist.

    python3 extension/scripts/make_icons.py     (needs Pillow)
"""

from pathlib import Path

from PIL import Image, ImageDraw

PAPER = (0xFB, 0xFA, 0xF7, 255)
PINE = (0x33, 0x3D, 0x34, 255)
AMBER = (0xD9, 0x82, 0x2B, 255)  # the logo sun is one of amber's four allowed uses

OUT = Path(__file__).resolve().parent.parent / "icons"
SUPERSAMPLE = 8


def icon_16() -> Image.Image:
    """Hand-snapped to whole pixels: no anti-aliasing, so it stays crisp."""
    img = Image.new("RGBA", (16, 16), PAPER)
    px = img.load()
    # Half sun, radius 4, sitting on the horizon. (row, first x, last x)
    for y, x0, x1 in ((6, 6, 9), (7, 5, 10), (8, 4, 11), (9, 4, 11)):
        for x in range(x0, x1 + 1):
            px[x, y] = AMBER
    # Horizon: 2px line, inset 2px.
    for y in (10, 11):
        for x in range(2, 14):
            px[x, y] = PINE
    return img


def icon(size: int) -> Image.Image:
    """Anti-aliased sun; the horizon line is snapped to the pixel grid."""
    unit = size // 16  # every measure below is a whole number of pixels
    horizon_top = 10 * unit
    line = 2 * unit
    inset = 2 * unit
    radius = 4 * unit

    s = SUPERSAMPLE
    big = Image.new("RGBA", (size * s, size * s), PAPER)
    draw = ImageDraw.Draw(big)
    cx = size * s // 2
    draw.ellipse(
        (cx - radius * s, (horizon_top - radius) * s, cx + radius * s, (horizon_top + radius) * s),
        fill=AMBER,
    )
    img = big.resize((size, size), Image.LANCZOS)

    draw = ImageDraw.Draw(img)
    # Hide the lower half of the sun, then draw the horizon over the seam.
    draw.rectangle((0, horizon_top, size - 1, size - 1), fill=PAPER)
    draw.rectangle((inset, horizon_top, size - inset - 1, horizon_top + line - 1), fill=PINE)
    return img


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for size in (16, 32, 48, 128):
        img = icon_16() if size == 16 else icon(size)
        path = OUT / f"icon{size}.png"
        img.save(path, optimize=True)
        print(f"{path.name}: {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
