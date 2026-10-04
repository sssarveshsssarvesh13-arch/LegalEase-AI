from utils.document_formatter import format_docx,format_pdf,format_html_preview

def test_html_preview():
    result=format_html_preview("TITLE\nSample paragraph")
    assert "Sample paragraph" in result
    assert "<h3>" in result

def test_docx_export():
    result=format_docx("Sample legal document","Agreement")
    assert result[:2]==b"PK"

def test_pdf_export():
    result=format_pdf("Sample legal document","Agreement")
    assert result.startswith(b"%PDF")