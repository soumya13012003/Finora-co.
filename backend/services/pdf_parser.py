"""
PDF Parser Service
Handles extraction of text, tables, and metadata from annual report PDFs.
"""
import re
from typing import List, Dict, Optional


class PDFParserService:
    """Service for parsing PDF annual reports"""

    def parse(self, file_path: str) -> dict:
        """Parse a PDF file and extract text, tables, and metadata"""
        try:
            import pdfplumber

            text_content = []
            tables = []
            metadata = {}

            with pdfplumber.open(file_path) as pdf:
                metadata = {
                    "pages": len(pdf.pages),
                    "metadata": pdf.metadata or {}
                }

                for i, page in enumerate(pdf.pages):
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)

                    # Extract tables
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table in page_tables:
                            tables.append({
                                "page": i + 1,
                                "data": table
                            })

            return {
                "text": "\n\n".join(text_content),
                "tables": tables,
                "pages": metadata["pages"],
                "metadata": metadata.get("metadata", {})
            }

        except ImportError:
            # Fallback if pdfplumber not installed
            return self._basic_parse(file_path)

    def _basic_parse(self, file_path: str) -> dict:
        """Basic fallback parser"""
        try:
            import PyPDF2
            text_content = []
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)

            return {
                "text": "\n\n".join(text_content),
                "tables": [],
                "pages": len(text_content),
                "metadata": {}
            }
        except Exception:
            return {"text": "", "tables": [], "pages": 0, "metadata": {}}

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks for embedding"""
        if not text:
            return []

        # Split by paragraphs first
        paragraphs = re.split(r'\n\s*\n', text)
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += (" " if current_chunk else "") + para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                    # Keep overlap
                    words = current_chunk.split()
                    overlap_text = " ".join(words[-overlap:]) if len(words) > overlap else ""
                    current_chunk = overlap_text + " " + para if overlap_text else para
                else:
                    # Paragraph itself is too long, split by sentences
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    for sent in sentences:
                        if len(current_chunk) + len(sent) <= chunk_size:
                            current_chunk += (" " if current_chunk else "") + sent
                        else:
                            if current_chunk:
                                chunks.append(current_chunk)
                            current_chunk = sent

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def extract_financial_tables(self, tables: List[dict]) -> List[dict]:
        """Extract and structure financial data from parsed tables"""
        financial_tables = []
        financial_keywords = [
            'revenue', 'profit', 'loss', 'income', 'expense', 'asset',
            'liability', 'equity', 'cash', 'ebitda', 'margin', 'dividend'
        ]

        for table_data in tables:
            data = table_data.get("data", [])
            if not data or len(data) < 2:
                continue

            # Check if table contains financial data
            header = " ".join(str(cell) for cell in data[0] if cell).lower()
            if any(kw in header for kw in financial_keywords):
                financial_tables.append({
                    "page": table_data["page"],
                    "headers": data[0],
                    "rows": data[1:]
                })

        return financial_tables
