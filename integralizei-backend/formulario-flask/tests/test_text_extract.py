import sys
import types
from unittest.mock import MagicMock, patch

from parsers.text_extract import (
    _try_pdfplumber,
    _try_pypdf,
    _try_ocr,
    extract_any,
)

# =========================
#   _try_pdfplumber
# =========================


def test_try_pdfplumber_success():
    # páginas falsas
    page1 = MagicMock()
    page1.extract_text.return_value = "Hello"
    page2 = MagicMock()
    page2.extract_text.return_value = "World"

    fake_pdf = MagicMock()
    fake_pdf.pages = [page1, page2]

    # contexto do with pdfplumber.open(...)
    fake_ctx = MagicMock()
    fake_ctx.__enter__.return_value = fake_pdf
    fake_ctx.__exit__.return_value = False

    fake_pdfplumber = types.SimpleNamespace(open=MagicMock(return_value=fake_ctx))

    # injeta um "módulo" pdfplumber falso em sys.modules
    with patch.dict(sys.modules, {"pdfplumber": fake_pdfplumber}):
        result = _try_pdfplumber("dummy.pdf")

    assert result == "Hello\nWorld"


def test_try_pdfplumber_exception():
    def fake_open(*args, **kwargs):
        raise Exception("erro intencional")

    fake_pdfplumber = types.SimpleNamespace(open=fake_open)

    with patch.dict(sys.modules, {"pdfplumber": fake_pdfplumber}):
        result = _try_pdfplumber("dummy.pdf")

    assert result is None


# =========================
#   _try_pypdf
# =========================


def test_try_pypdf_success():
    page1 = MagicMock()
    page1.extract_text.return_value = "AAA"
    page2 = MagicMock()
    page2.extract_text.return_value = "BBB"

    fake_reader = MagicMock()
    fake_reader.pages = [page1, page2]

    fake_pypdf2 = types.SimpleNamespace(PdfReader=MagicMock(return_value=fake_reader))

    with patch.dict(sys.modules, {"PyPDF2": fake_pypdf2}):
        result = _try_pypdf("dummy.pdf")

    assert result == "AAA\nBBB"


def test_try_pypdf_exception():
    def fake_reader(*args, **kwargs):
        raise Exception("falhou")

    fake_pypdf2 = types.SimpleNamespace(PdfReader=fake_reader)

    with patch.dict(sys.modules, {"PyPDF2": fake_pypdf2}):
        result = _try_pypdf("dummy.pdf")

    assert result is None


# =========================
#   _try_ocr
# =========================


def test_try_ocr_success():
    img1 = MagicMock()
    img2 = MagicMock()

    fake_pytesseract = types.SimpleNamespace(
        image_to_string=MagicMock(side_effect=["Texto1", "Texto2"])
    )
    fake_pdf2image = types.SimpleNamespace(
        convert_from_path=MagicMock(return_value=[img1, img2])
    )

    with patch.dict(
        sys.modules,
        {
            "pytesseract": fake_pytesseract,
            "pdf2image": fake_pdf2image,
        },
    ):
        result = _try_ocr("dummy.pdf")

    assert result == "Texto1\nTexto2"


def test_try_ocr_conversion_error():
    fake_pytesseract = types.SimpleNamespace(
        image_to_string=MagicMock(return_value="nunca chega aqui")
    )

    def fake_convert_from_path(*args, **kwargs):
        raise Exception("erro na conversão")

    fake_pdf2image = types.SimpleNamespace(convert_from_path=fake_convert_from_path)

    with patch.dict(
        sys.modules,
        {
            "pytesseract": fake_pytesseract,
            "pdf2image": fake_pdf2image,
        },
    ):
        result = _try_ocr("dummy.pdf")

    assert result is None


# =========================
#   extract_any
# =========================


def test_extract_any_usa_pdfplumber_quando_sucesso():
    with patch("parsers.text_extract._try_pdfplumber", return_value="PDF TEXTO"), patch(
        "parsers.text_extract._try_pypdf", return_value=None
    ), patch("parsers.text_extract._try_ocr", return_value=None):

        result = extract_any("arquivo.pdf")

    assert result == "PDF TEXTO"


def test_extract_any_fallback_para_pypdf():
    with patch("parsers.text_extract._try_pdfplumber", return_value=None), patch(
        "parsers.text_extract._try_pypdf", return_value="PYPDF TEXTO"
    ), patch("parsers.text_extract._try_ocr", return_value=None):

        result = extract_any("arquivo.pdf")

    assert result == "PYPDF TEXTO"


def test_extract_any_fallback_para_ocr():
    with patch("parsers.text_extract._try_pdfplumber", return_value=None), patch(
        "parsers.text_extract._try_pypdf", return_value=None
    ), patch("parsers.text_extract._try_ocr", return_value="OCR TEXTO"):

        result = extract_any("arquivo.pdf")

    assert result == "OCR TEXTO"


def test_extract_any_todos_falham_retorna_string_vazia():
    with patch("parsers.text_extract._try_pdfplumber", return_value=None), patch(
        "parsers.text_extract._try_pypdf", return_value=None
    ), patch("parsers.text_extract._try_ocr", return_value=None):

        result = extract_any("arquivo.pdf")

    assert result == ""
