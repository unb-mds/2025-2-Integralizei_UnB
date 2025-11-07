import re
from typing import Optional


def _try_pdfplumber(path: str) -> Optional[str]:
    try:
        import pdfplumber

        pages = []
        with pdfplumber.open(path) as pdf:
            for p in pdf.pages:
                pages.append(p.extract_text() or "")
        return "\n".join(pages)
    except Exception:
        return None


def _try_pypdf(path: str) -> Optional[str]:
    try:
        from PyPDF2 import PdfReader

        reader = PdfReader(path)
        pages = [(pg.extract_text() or "") for pg in reader.pages]
        return "\n".join(pages)
    except Exception:
        return None


def _try_ocr(path: str) -> Optional[str]:
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except Exception:
        return None
    try:
        txts = []
        for img in convert_from_path(path):
            txts.append(pytesseract.image_to_string(img, lang="por+eng") or "")
        return "\n".join(txts)
    except Exception:
        return None


def extract_any(path: str) -> str:
    for fn in (_try_pdfplumber, _try_pypdf, _try_ocr):
        t = fn(path)
        if t and t.strip():
            return t.replace("\xa0", " ")
    return ""
