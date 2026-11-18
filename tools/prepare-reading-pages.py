"""Regenerate the web reader assets from the original local course documents."""
import json
from pathlib import Path

import pymupdf
from PIL import Image


def prepare(source):
    target = source.parent / "reading"
    target.mkdir(exist_ok=True)
    pages = []
    with pymupdf.open(source) as document:
        for page in document:
            scale = 1900 / max(page.rect.width, page.rect.height)
            pixels = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            image = Image.frombytes("RGB", (pixels.width, pixels.height), pixels.samples)
            image.save(target / f"{page.number + 1}.webp", quality=88, method=4)
            text = "\n".join(line.rstrip() for line in page.get_text(sort=True).splitlines()).strip()
            if text:
                (target / f"{page.number + 1}.txt").write_text(text, encoding="utf-8")
            pages.append({"width": pixels.width, "height": pixels.height, "hasText": bool(text)})
    (target / "pages.json").write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    print(f"{source}: {len(pages)} pages", flush=True)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    for pattern in ["assets/lecture.pdf", "lessons/*/*/assets/lecture.pdf",
                    "laboratories/*/assets/manual.pdf"]:
        for pdf in sorted(root.glob(pattern)):
            prepare(pdf)
