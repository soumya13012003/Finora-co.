"""
Report Store Service
In-memory store that tracks uploaded reports and their extracted financial data.
Dashboard endpoints pull from this store; falls back to demo data when empty.
"""
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path


class ReportStore:
    """Centralized store for uploaded report data and extracted metrics."""

    def __init__(self, persist_path: str = "./report_store.json"):
        self.persist_path = persist_path
        self.reports: Dict[str, dict] = {}       # report_id -> report metadata
        self.financial_data: Dict[str, dict] = {} # report_id -> extracted financials
        self.raw_texts: Dict[str, str] = {}       # report_id -> full text
        self._load()

    # ---- Persistence ----

    def _load(self):
        """Load persisted store from disk"""
        if os.path.exists(self.persist_path):
            try:
                with open(self.persist_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.reports = data.get("reports", {})
                self.financial_data = data.get("financial_data", {})
                # raw_texts not persisted (too large)
            except Exception:
                pass

    def _save(self):
        """Persist store to disk"""
        try:
            data = {
                "reports": self.reports,
                "financial_data": self.financial_data,
            }
            with open(self.persist_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            print(f"Store save error: {e}")

    # ---- Report Management ----

    def add_report(self, report_id: str, filename: str, pages: int,
                   file_size_mb: float, text: str, financial_metrics: dict,
                   tables_found: int, chunks_created: int):
        """Add a newly uploaded and parsed report to the store."""
        self.reports[report_id] = {
            "id": report_id,
            "name": filename.replace(".pdf", ""),
            "filename": filename,
            "company": self._extract_company_name(text, filename),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "upload_time": datetime.now().isoformat(),
            "pages": pages,
            "file_size_mb": file_size_mb,
            "status": "analyzed",
            "tables_found": tables_found,
            "chunks_created": chunks_created,
        }

        # Store financial data with extracted + parsed values
        self.financial_data[report_id] = self._enrich_financial_data(
            financial_metrics, text
        )

        # Keep raw text in memory for re-analysis
        self.raw_texts[report_id] = text

        self._save()

    def get_all_reports(self) -> List[dict]:
        """Get all reports sorted by upload time (newest first)."""
        reports = list(self.reports.values())
        reports.sort(key=lambda r: r.get("upload_time", ""), reverse=True)
        return reports

    def get_report(self, report_id: str) -> Optional[dict]:
        return self.reports.get(report_id)

    def has_data(self) -> bool:
        """Check if any reports have been uploaded."""
        return len(self.reports) > 0

    def get_report_count(self) -> int:
        return len(self.reports)

    # ---- Aggregated Dashboard Data ----

    def get_aggregated_metrics(self) -> dict:
        """Aggregate financial metrics across all uploaded reports."""
        if not self.financial_data:
            return None

        total_revenue = 0
        total_profit = 0
        total_assets = 0
        total_liabilities = 0
        revenues = []
        profits = []
        margins = []
        report_details = []

        for rid, fdata in self.financial_data.items():
            report_meta = self.reports.get(rid, {})
            rev = fdata.get("revenue") or 0
            profit = fdata.get("net_income") or 0
            total_revenue += rev
            total_profit += profit
            total_assets += fdata.get("total_assets") or 0
            total_liabilities += fdata.get("total_liabilities") or 0

            if rev > 0:
                revenues.append(rev)
            if profit != 0:
                profits.append(profit)
            if fdata.get("net_margin"):
                margins.append(fdata["net_margin"])

            report_details.append({
                "report_id": rid,
                "company": report_meta.get("company", "Unknown"),
                "filename": report_meta.get("filename", ""),
                "revenue": rev,
                "net_income": profit,
                "ebitda": fdata.get("ebitda"),
                "net_margin": fdata.get("net_margin"),
                "total_assets": fdata.get("total_assets"),
                "eps": fdata.get("eps"),
                "roe": fdata.get("roe"),
                "roa": fdata.get("roa"),
            })

        avg_margin = sum(margins) / len(margins) if margins else None

        return {
            "total_revenue": total_revenue,
            "total_profit": total_profit,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "avg_margin": round(avg_margin, 2) if avg_margin else None,
            "report_count": len(self.reports),
            "report_details": report_details,
        }

    def get_extracted_regions(self) -> List[dict]:
        """Extract any region/location mentions from report text."""
        region_keywords = {
            "North America": ["united states", "usa", "canada", "north america", "american"],
            "Europe": ["europe", "european", "uk", "united kingdom", "germany", "france", "eu"],
            "Asia Pacific": ["asia", "china", "india", "japan", "apac", "asia pacific", "asian"],
            "Latin America": ["latin america", "brazil", "mexico", "south america", "latam"],
            "Middle East": ["middle east", "uae", "saudi", "qatar", "dubai"],
            "Africa": ["africa", "african", "nigeria", "south africa", "kenya"],
        }

        region_data = []
        for region_name, keywords in region_keywords.items():
            mention_count = 0
            for text in self.raw_texts.values():
                text_lower = text.lower()
                for kw in keywords:
                    mention_count += text_lower.count(kw)

            if mention_count > 0:
                region_data.append({
                    "name": region_name,
                    "mentions": mention_count,
                    "relevance": min(mention_count / 10, 1.0),
                })

        region_data.sort(key=lambda r: r["mentions"], reverse=True)
        return region_data

    def get_extracted_products(self) -> List[dict]:
        """Extract product/service category mentions from reports."""
        categories = {
            "Technology": ["software", "technology", "tech", "saas", "cloud", "digital", "IT"],
            "Financial Services": ["banking", "finance", "insurance", "investment", "fintech"],
            "Manufacturing": ["manufacturing", "production", "factory", "industrial"],
            "Healthcare": ["health", "medical", "pharma", "pharmaceutical", "hospital"],
            "Consumer Goods": ["consumer", "retail", "fmcg", "goods", "product"],
            "Energy": ["energy", "oil", "gas", "renewable", "power", "electricity"],
            "Real Estate": ["real estate", "property", "construction", "housing"],
        }

        product_data = []
        for cat_name, keywords in categories.items():
            mention_count = 0
            for text in self.raw_texts.values():
                text_lower = text.lower()
                for kw in keywords:
                    mention_count += text_lower.count(kw)

            if mention_count > 0:
                product_data.append({
                    "category": cat_name,
                    "mentions": mention_count,
                    "demand_index": min(50 + mention_count * 2, 100),
                })

        product_data.sort(key=lambda p: p["mentions"], reverse=True)
        return product_data

    # ---- Helpers ----

    def _extract_company_name(self, text: str, filename: str) -> str:
        """Try to extract company name from the PDF text or filename."""
        # Try first few lines of text
        lines = text.strip().split("\n")[:20]
        for line in lines:
            line = line.strip()
            # Look for lines that look like company names
            if len(line) > 3 and len(line) < 80:
                # Skip common header words
                skip_words = ["annual", "report", "financial", "statement",
                              "page", "table", "contents", "year", "ended",
                              "consolidated", "notes", "the", "for"]
                words = line.lower().split()
                if words and words[0] not in skip_words and not line[0].isdigit():
                    # Simple heuristic: take the first substantial line
                    if any(c.isupper() for c in line):
                        return line[:60]

        # Fallback to filename
        name = filename.replace(".pdf", "").replace("_", " ").replace("-", " ")
        return name.title()

    def _enrich_financial_data(self, metrics: dict, text: str) -> dict:
        """Enrich extracted metrics with additional text analysis."""
        enriched = dict(metrics)

        # Try to extract year/period
        import re
        year_match = re.search(r'(?:FY|fiscal year|year ended)\s*(\d{4})', text, re.IGNORECASE)
        if year_match:
            enriched["fiscal_year"] = year_match.group(1)

        # Count key financial terms for context
        text_lower = text.lower()
        enriched["_context"] = {
            "revenue_mentions": text_lower.count("revenue"),
            "profit_mentions": text_lower.count("profit"),
            "growth_mentions": text_lower.count("growth"),
            "risk_mentions": text_lower.count("risk"),
            "investment_mentions": text_lower.count("invest"),
        }

        return enriched
