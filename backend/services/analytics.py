"""
Analytics Engine
Financial data extraction and analysis from parsed reports.
"""
import re
from typing import Dict, List, Optional


class AnalyticsEngine:
    """Engine for extracting and analyzing financial metrics"""

    def extract_financial_metrics(self, text: str) -> dict:
        """Extract key financial metrics from report text"""
        metrics = {
            "revenue": self._extract_monetary_value(text, ["revenue", "total revenue", "net revenue", "sales"]),
            "net_income": self._extract_monetary_value(text, ["net income", "net profit", "profit after tax"]),
            "operating_income": self._extract_monetary_value(text, ["operating income", "operating profit", "EBIT"]),
            "total_assets": self._extract_monetary_value(text, ["total assets"]),
            "total_liabilities": self._extract_monetary_value(text, ["total liabilities"]),
            "shareholders_equity": self._extract_monetary_value(text, ["shareholders equity", "stockholders equity", "total equity"]),
            "ebitda": self._extract_monetary_value(text, ["ebitda", "EBITDA"]),
            "eps": self._extract_decimal_value(text, ["earnings per share", "EPS", "basic eps"]),
            "dividend": self._extract_decimal_value(text, ["dividend per share", "dividends declared"]),
        }

        # Calculate derived metrics
        if metrics["revenue"] and metrics["net_income"]:
            metrics["net_margin"] = round(metrics["net_income"] / metrics["revenue"] * 100, 2)
        if metrics["total_assets"] and metrics["net_income"]:
            metrics["roa"] = round(metrics["net_income"] / metrics["total_assets"] * 100, 2)
        if metrics["shareholders_equity"] and metrics["net_income"]:
            metrics["roe"] = round(metrics["net_income"] / metrics["shareholders_equity"] * 100, 2)

        return metrics

    def _extract_monetary_value(self, text: str, keywords: List[str]) -> Optional[float]:
        """Extract a monetary value associated with given keywords"""
        for keyword in keywords:
            pattern = rf'{keyword}\s*[:\-]?\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:million|billion|M|B|mn|bn)?'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = float(match.group(1).replace(',', ''))
                # Detect scale
                context = text[match.start():match.end() + 20].lower()
                if 'billion' in context or 'bn' in context or 'b' in context:
                    value *= 1_000_000_000
                elif 'million' in context or 'mn' in context or 'm' in context:
                    value *= 1_000_000
                return value
        return None

    def _extract_decimal_value(self, text: str, keywords: List[str]) -> Optional[float]:
        """Extract a decimal value associated with given keywords"""
        for keyword in keywords:
            pattern = rf'{keyword}\s*[:\-]?\s*\$?\s*([\d,]+(?:\.\d+)?)'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1).replace(',', ''))
        return None

    def calculate_growth_rate(self, current: float, previous: float) -> float:
        """Calculate year-over-year growth rate"""
        if previous == 0:
            return 0.0
        return round(((current - previous) / previous) * 100, 2)

    def calculate_investment_score(self, metrics: dict) -> dict:
        """Calculate an investment attractiveness score"""
        score = 50  # Base score

        # Revenue growth impact
        if metrics.get("revenue_growth"):
            growth = metrics["revenue_growth"]
            if growth > 20:
                score += 20
            elif growth > 10:
                score += 15
            elif growth > 5:
                score += 10
            elif growth > 0:
                score += 5
            else:
                score -= 10

        # Profitability impact
        if metrics.get("net_margin"):
            margin = metrics["net_margin"]
            if margin > 20:
                score += 15
            elif margin > 10:
                score += 10
            elif margin > 5:
                score += 5
            else:
                score -= 5

        # ROE impact
        if metrics.get("roe"):
            roe = metrics["roe"]
            if roe > 15:
                score += 10
            elif roe > 10:
                score += 5

        score = max(0, min(100, score))

        return {
            "score": score,
            "rating": "Strong Buy" if score >= 80 else "Buy" if score >= 65 else "Hold" if score >= 45 else "Sell" if score >= 30 else "Strong Sell",
            "confidence": "High" if metrics.get("revenue") else "Low"
        }
