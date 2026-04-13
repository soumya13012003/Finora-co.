"""
Chat Service
Handles the Finora AI Assistant chatbot using RAG (Retrieval-Augmented Generation)
"""

import os
import json
import re
from datetime import datetime


class ChatService:
    def __init__(self, vector_service):
        self.vector_service = vector_service
        self.openai_client = None

        # Try to initialize OpenAI
        api_key = os.getenv('OPENAI_API_KEY', '')
        if api_key and api_key != 'your_openai_api_key_here':
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=api_key)
                print("[OK] OpenAI client initialized")
            except Exception as e:
                print(f"[INFO] OpenAI not available: {e}")

    def generate_response(self, message, context, reports_data, chat_history=None):
        """Generate a response using RAG (retrieval-augmented generation)"""

        # Build context from retrieved documents
        rag_context = self._build_rag_context(context)

        # Build reports summary
        reports_summary = self._build_reports_summary(reports_data)

        # Try OpenAI first
        if self.openai_client:
            return self._openai_response(message, rag_context, reports_summary, chat_history)

        # Fallback to rule-based responses
        return self._rule_based_response(message, rag_context, reports_summary, reports_data)

    def _build_rag_context(self, context):
        """Build context string from vector search results"""
        if not context:
            return "No specific document context available."

        parts = []
        for item in context[:5]:
            text = item.get('text', '')[:300]
            score = item.get('score', 0)
            metadata = item.get('metadata', {})
            filename = metadata.get('filename', 'Unknown')
            parts.append(f"[Source: {filename}, Relevance: {score:.2f}]\n{text}")

        return '\n\n'.join(parts)

    def _build_reports_summary(self, reports_data):
        """Build a summary of all processed reports"""
        if not reports_data:
            return "No reports have been processed yet."

        summaries = []
        for report in reports_data[:10]:
            analysis = report.get('analysis', {})
            summary = analysis.get('summary', {})
            zones = analysis.get('investment_zones', [])
            peak = analysis.get('peak_demand', {})
            regional = analysis.get('regional_performance', [])

            company = report.get('company', report.get('filename', 'Unknown'))
            top_regions = ', '.join([r['city'] for r in regional[:5]]) if regional else 'N/A'
            top_zone = zones[0] if zones else {}

            summaries.append(
                f"Report: {company}\n"
                f"  Revenue: ₹{summary.get('total_revenue', 0):.0f} Cr | "
                f"Profit: ₹{summary.get('total_profit', 0):.0f} Cr | "
                f"Growth: {summary.get('avg_growth', 0):.1f}%\n"
                f"  Top Regions: {top_regions}\n"
                f"  Peak Demand: {peak.get('month', 'N/A')}\n"
                f"  Best Investment Zone: {top_zone.get('city', 'N/A')} "
                f"(Score: {top_zone.get('score', 0):.1f}, Rec: {top_zone.get('recommendation', 'N/A')})"
            )

        return '\n\n'.join(summaries)

    def _openai_response(self, message, rag_context, reports_summary, chat_history):
        """Generate response using OpenAI API"""
        system_prompt = f"""You are the Finora-Co AI Assistant, an expert financial analyst specializing in annual report analysis, 
investment intelligence, and market trends. You help users understand financial data, identify investment opportunities, 
and make data-driven decisions.

AVAILABLE DATA CONTEXT:
{rag_context}

PROCESSED REPORTS SUMMARY:
{reports_summary}

GUIDELINES:
- Provide specific, data-driven answers referencing the available reports
- Use numbers, percentages, and specific regions when available
- Give actionable investment recommendations
- Highlight risk factors alongside opportunities
- Be professional but approachable
- If data isn't available, suggest uploading relevant reports
- Use bullet points and structured formatting for clarity
- Always mention which report/source your insights come from"""

        messages = [{"role": "system", "content": system_prompt}]

        # Add recent chat history for context
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })

        messages.append({"role": "user", "content": message})

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return self._rule_based_response(message, rag_context, reports_summary, [])

    def _rule_based_response(self, message, rag_context, reports_summary, reports_data):
        """Generate rule-based responses when OpenAI is not available"""
        msg_lower = message.lower()

        # Greeting
        if any(w in msg_lower for w in ['hello', 'hi', 'hey', 'greetings']):
            return ("👋 **Hello! I'm the Finora-Co AI Assistant.**\n\n"
                    "I can help you with:\n"
                    "- 📊 **Annual report analysis** and key financial insights\n"
                    "- 📍 **Regional performance** and location-based investment intelligence\n"
                    "- 📈 **Demand trends** and peak period identification\n"
                    "- 💰 **Investment recommendations** and opportunity zones\n"
                    "- ⚠️ **Risk assessment** and growth indicators\n\n"
                    "Try asking me:\n"
                    "- *\"Where should we invest more?\"*\n"
                    "- *\"Which region has the highest demand?\"*\n"
                    "- *\"What is the peak sales period?\"*\n\n"
                    "Upload your annual reports or load demo data to get started!")

        # No data check
        if not reports_data:
            if any(w in msg_lower for w in ['invest', 'demand', 'revenue', 'growth', 'region', 'performance', 'risk', 'peak', 'trend', 'sales', 'profit']):
                return ("📋 **No reports have been processed yet.**\n\n"
                        "To get financial insights, you can:\n"
                        "1. **Upload PDF annual reports** via the Documents section\n"
                        "2. **Load demo data** from the Dashboard to explore sample insights\n\n"
                        "Once data is available, I can answer all your financial questions!")

        # Investment queries
        if any(w in msg_lower for w in ['invest', 'where should', 'opportunity', 'invest more']):
            zones_info = []
            for report in reports_data[:3]:
                zones = report.get('analysis', {}).get('investment_zones', [])
                for z in zones[:3]:
                    zones_info.append(z)

            if zones_info:
                response = "💰 **Investment Opportunity Analysis**\n\n"
                response += "Based on the analyzed reports, here are the top investment zones:\n\n"
                for i, z in enumerate(zones_info[:5], 1):
                    icon = "🟢" if z.get('recommendation') == 'Strong Buy' else "🟡" if z.get('recommendation') == 'Buy' else "🔴"
                    response += (f"{i}. **{z['city']}, {z['state']}** {icon}\n"
                               f"   - Score: {z.get('score', 0):.1f}/100\n"
                               f"   - Recommendation: **{z.get('recommendation', 'N/A')}**\n"
                               f"   - Growth Potential: {z.get('growth_potential', 0):.1f}%\n"
                               f"   - Risk: {z.get('risk_level', 'N/A')}\n\n")
                response += "💡 *Tip: Focus on cities with 'Strong Buy' recommendations and low-medium risk profiles for optimal returns.*"
                return response
            return "I need more data to provide investment recommendations. Please upload annual reports first."

        # Regional demand queries
        if any(w in msg_lower for w in ['region', 'highest demand', 'top city', 'best performing', 'location', 'city', 'state']):
            regional = []
            for report in reports_data[:3]:
                regional.extend(report.get('analysis', {}).get('regional_performance', []))

            if regional:
                # Sort by demand score
                regional.sort(key=lambda x: x.get('demand_score', 0), reverse=True)
                top = regional[:5]

                response = "📍 **Regional Performance Analysis**\n\n"
                response += "Top performing regions by demand score:\n\n"
                for i, r in enumerate(top, 1):
                    bar_width = int(r.get('demand_score', 0) / 5)
                    bar = "█" * bar_width
                    response += (f"{i}. **{r['city']}** ({r['state']})\n"
                               f"   - Demand Score: {r.get('demand_score', 0):.1f} {bar}\n"
                               f"   - Revenue: ₹{r.get('revenue', 0):.0f} Cr\n"
                               f"   - Growth: {r.get('growth', 0):+.1f}%\n"
                               f"   - Market Share: {r.get('market_share', 0):.1f}%\n\n")
                response += f"🏆 **{top[0]['city']}** leads with the highest demand score of {top[0].get('demand_score', 0):.1f}!"
                return response

        # Peak sales/demand period queries
        if any(w in msg_lower for w in ['peak', 'sales period', 'peak demand', 'best month', 'seasonal', 'when']):
            trends = []
            for report in reports_data[:3]:
                trends.extend(report.get('analysis', {}).get('monthly_trends', []))

            if trends:
                # Aggregate by month
                monthly = {}
                for t in trends:
                    m = t['month']
                    if m not in monthly:
                        monthly[m] = {'demand': [], 'revenue': []}
                    monthly[m]['demand'].append(t['demand'])
                    monthly[m]['revenue'].append(t['revenue'])

                sorted_months = sorted(monthly.items(),
                                      key=lambda x: sum(x[1]['demand']) / len(x[1]['demand']),
                                      reverse=True)

                response = "📈 **Peak Demand Period Analysis**\n\n"
                response += "Monthly demand distribution:\n\n"

                months_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                for m in months_order:
                    if m in monthly:
                        avg_d = sum(monthly[m]['demand']) / len(monthly[m]['demand'])
                        bar_len = int(avg_d / 5)
                        indicator = " 🔥" if m in [sorted_months[0][0], sorted_months[1][0]] else ""
                        response += f"  {m}: {'█' * bar_len} {avg_d:.0f}{indicator}\n"

                peak = sorted_months[0]
                peak_demand = sum(peak[1]['demand']) / len(peak[1]['demand'])
                response += (f"\n🏆 **Peak Period: {peak[0]}** (Avg Demand: {peak_demand:.1f})\n\n"
                           f"📌 **Key Insights:**\n"
                           f"- Q4 (Oct-Dec) shows festive season boost\n"
                           f"- Q2 (Apr-Jun) tends to have lower demand (summer effect)\n"
                           f"- Recommended: Increase inventory by 30% before peak months")
                return response

        # Revenue/profit queries
        if any(w in msg_lower for w in ['revenue', 'profit', 'financial', 'earnings', 'income']):
            response = "💹 **Financial Summary**\n\n"
            for report in reports_data[:5]:
                summary = report.get('analysis', {}).get('summary', {})
                company = report.get('company', report.get('filename', 'Report'))
                response += (f"**{company}**\n"
                           f"  Revenue: ₹{summary.get('total_revenue', 0):,.0f} Cr\n"
                           f"  Profit: ₹{summary.get('total_profit', 0):,.0f} Cr\n"
                           f"  Growth: {summary.get('avg_growth', 0):.1f}%\n"
                           f"  Regions: {summary.get('regions_covered', 0)}\n\n")
            return response

        # Risk queries
        if any(w in msg_lower for w in ['risk', 'danger', 'warning', 'concern', 'volatility']):
            response = "⚠️ **Risk & Growth Assessment**\n\n"
            for report in reports_data[:3]:
                rg = report.get('analysis', {}).get('risk_growth', {})
                company = report.get('company', report.get('filename', 'Report'))
                response += (f"**{company}**\n"
                           f"  Overall Risk: {rg.get('overall_risk', 0):.1f}/100\n"
                           f"  Market Volatility: {rg.get('market_volatility', 0):.1f}/100\n"
                           f"  Growth Trajectory: {rg.get('growth_trajectory', 0):.1f}%\n"
                           f"  Debt Ratio: {rg.get('debt_ratio', 0):.2f}\n\n")

                for ind in rg.get('indicators', []):
                    icon = "✅" if ind['status'] == 'positive' else "⚡"
                    response += f"  {icon} {ind['name']}: {ind['value']}\n"
                response += "\n"
            return response

        # Growth queries
        if any(w in msg_lower for w in ['growth', 'growing', 'expand', 'increase', 'trend up']):
            response = "📈 **Growth Analysis**\n\n"
            for report in reports_data[:3]:
                analysis = report.get('analysis', {})
                summary = analysis.get('summary', {})
                regional = analysis.get('regional_performance', [])
                company = report.get('company', report.get('filename', 'Report'))

                fastest_growing = sorted(regional, key=lambda x: x.get('growth', 0), reverse=True)[:3]
                response += f"**{company}** - Avg Growth: {summary.get('avg_growth', 0):.1f}%\n\n"
                response += "Fastest growing regions:\n"
                for r in fastest_growing:
                    response += f"  📍 {r['city']}: **{r.get('growth', 0):+.1f}%** growth\n"
                response += "\n"
            return response

        # Help/capabilities
        if any(w in msg_lower for w in ['help', 'what can you', 'capabilities', 'features', 'how to']):
            return ("🤖 **Finora-Co AI Assistant - Capabilities**\n\n"
                    "I can help you analyze annual reports and provide investment intelligence:\n\n"
                    "**📊 Report Analysis**\n"
                    "- *\"Show me the financial summary\"*\n"
                    "- *\"What are the key revenue figures?\"*\n\n"
                    "**📍 Regional Intelligence**\n"
                    "- *\"Which region has highest demand?\"*\n"
                    "- *\"Show top performing cities\"*\n\n"
                    "**💰 Investment Guidance**\n"
                    "- *\"Where should we invest more?\"*\n"
                    "- *\"What are the best investment zones?\"*\n\n"
                    "**📈 Demand & Trends**\n"
                    "- *\"What is the peak sales period?\"*\n"
                    "- *\"Show demand trends\"*\n\n"
                    "**⚠️ Risk Assessment**\n"
                    "- *\"What are the risk indicators?\"*\n"
                    "- *\"Show growth vs risk analysis\"*\n\n"
                    "Upload annual reports or load demo data to get started!")

        # Default response
        return ("🤖 I understand you're asking about **\"" + message[:80] + "\"**.\n\n"
                "I can help with:\n"
                "- 📊 Financial analysis & summaries\n"
                "- 📍 Regional performance & demand\n"
                "- 💰 Investment opportunities\n"
                "- 📈 Demand trends & peak periods\n"
                "- ⚠️ Risk assessment\n\n"
                "Try being more specific, or ask one of these:\n"
                "- *\"Where should we invest more?\"*\n"
                "- *\"Which region has highest demand?\"*\n"
                "- *\"What is the peak sales period?\"*")
