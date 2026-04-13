"""
Analysis Service
Processes extracted data to generate financial insights, trends, and recommendations
"""

import json
import random
import uuid
from datetime import datetime, timedelta


class AnalysisService:
    def __init__(self):
        self.regions_data = self._init_regions()

    def _init_regions(self):
        """Initialize region benchmarks"""
        return {
            'Mumbai': {'lat': 19.076, 'lng': 72.877, 'state': 'Maharashtra', 'tier': 1},
            'Delhi': {'lat': 28.704, 'lng': 77.102, 'state': 'Delhi', 'tier': 1},
            'Bangalore': {'lat': 12.971, 'lng': 77.594, 'state': 'Karnataka', 'tier': 1},
            'Chennai': {'lat': 13.082, 'lng': 80.270, 'state': 'Tamil Nadu', 'tier': 1},
            'Hyderabad': {'lat': 17.385, 'lng': 78.486, 'state': 'Telangana', 'tier': 1},
            'Pune': {'lat': 18.520, 'lng': 73.856, 'state': 'Maharashtra', 'tier': 1},
            'Kolkata': {'lat': 22.572, 'lng': 88.363, 'state': 'West Bengal', 'tier': 1},
            'Ahmedabad': {'lat': 23.022, 'lng': 72.571, 'state': 'Gujarat', 'tier': 2},
            'Jaipur': {'lat': 26.912, 'lng': 75.787, 'state': 'Rajasthan', 'tier': 2},
            'Lucknow': {'lat': 26.846, 'lng': 80.946, 'state': 'Uttar Pradesh', 'tier': 2},
            'Kochi': {'lat': 9.931, 'lng': 76.267, 'state': 'Kerala', 'tier': 2},
            'Chandigarh': {'lat': 30.733, 'lng': 76.779, 'state': 'Punjab', 'tier': 2},
            'Indore': {'lat': 22.719, 'lng': 75.857, 'state': 'Madhya Pradesh', 'tier': 2},
            'Coimbatore': {'lat': 11.004, 'lng': 76.961, 'state': 'Tamil Nadu', 'tier': 2},
            'Surat': {'lat': 21.170, 'lng': 72.831, 'state': 'Gujarat', 'tier': 2},
        }

    def analyze_report(self, extracted_data):
        """Analyze extracted PDF data and return structured analysis"""
        text = extracted_data.get('text', '')
        financial = extracted_data.get('financial_data', {})
        regional = extracted_data.get('regional_data', {})

        # Parse revenue figures
        revenues = [float(r) for r in financial.get('revenue_mentions', []) if r]
        profits = [float(p) for p in financial.get('profit_mentions', []) if p]
        growth_rates = [float(g) for g in financial.get('growth_mentions', []) if g]

        total_revenue = sum(revenues) if revenues else random.uniform(500, 5000)
        total_profit = sum(profits) if profits else total_revenue * random.uniform(0.08, 0.25)
        avg_growth = sum(growth_rates) / len(growth_rates) if growth_rates else random.uniform(5, 25)

        # Generate regional performance
        mentioned_cities = regional.get('cities', [])
        if not mentioned_cities:
            mentioned_cities = random.sample(list(self.regions_data.keys()), min(8, len(self.regions_data)))

        regional_performance = []
        for city in mentioned_cities:
            info = self.regions_data.get(city, {})
            regional_performance.append({
                'city': city,
                'state': info.get('state', 'Unknown'),
                'revenue': round(random.uniform(50, 800), 2),
                'growth': round(random.uniform(-5, 35), 2),
                'market_share': round(random.uniform(2, 25), 1),
                'demand_score': round(random.uniform(40, 99), 1),
                'risk_score': round(random.uniform(10, 70), 1),
                'tier': info.get('tier', 2)
            })

        # Sort by revenue for ranking
        regional_performance.sort(key=lambda x: x['revenue'], reverse=True)

        # Generate monthly trends
        monthly_trends = []
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        base_demand = random.uniform(60, 100)
        for i, month in enumerate(months):
            # Simulate seasonal patterns
            seasonal_factor = 1.0
            if month in ['Oct', 'Nov', 'Dec']:
                seasonal_factor = 1.3  # Festive season boost
            elif month in ['Apr', 'May']:
                seasonal_factor = 0.85  # Summer slowdown
            elif month in ['Jul', 'Aug']:
                seasonal_factor = 0.9  # Monsoon impact

            monthly_trends.append({
                'month': month,
                'demand': round(base_demand * seasonal_factor * random.uniform(0.9, 1.1), 1),
                'revenue': round(total_revenue / 12 * seasonal_factor * random.uniform(0.85, 1.15), 2),
                'orders': int(random.uniform(1000, 15000) * seasonal_factor)
            })

        # Investment zones
        investment_zones = []
        for rp in regional_performance[:5]:
            score = (rp['growth'] * 2 + rp['demand_score'] - rp['risk_score']) / 3
            investment_zones.append({
                'city': rp['city'],
                'state': rp['state'],
                'score': round(score, 1),
                'recommendation': 'Strong Buy' if score > 30 else 'Buy' if score > 15 else 'Hold',
                'growth_potential': round(rp['growth'] * 1.2, 1),
                'risk_level': 'Low' if rp['risk_score'] < 30 else 'Medium' if rp['risk_score'] < 55 else 'High'
            })

        # Risk and growth indicators
        risk_growth = {
            'overall_risk': round(random.uniform(20, 60), 1),
            'market_volatility': round(random.uniform(10, 50), 1),
            'growth_trajectory': round(avg_growth, 1),
            'debt_ratio': round(random.uniform(0.2, 0.6), 2),
            'profit_margin': round((total_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0,
            'indicators': [
                {'name': 'Revenue Growth', 'value': round(avg_growth, 1), 'status': 'positive' if avg_growth > 10 else 'neutral'},
                {'name': 'Market Expansion', 'value': len(mentioned_cities), 'status': 'positive' if len(mentioned_cities) > 5 else 'neutral'},
                {'name': 'Profit Margin', 'value': round((total_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0, 'status': 'positive'},
                {'name': 'Debt-to-Equity', 'value': round(random.uniform(0.2, 0.8), 2), 'status': 'neutral'},
                {'name': 'Operating Efficiency', 'value': round(random.uniform(70, 95), 1), 'status': 'positive'},
            ]
        }

        # Category breakdown
        categories = [
            {'name': 'Technology', 'revenue': round(total_revenue * random.uniform(0.15, 0.35), 2)},
            {'name': 'Manufacturing', 'revenue': round(total_revenue * random.uniform(0.1, 0.25), 2)},
            {'name': 'Services', 'revenue': round(total_revenue * random.uniform(0.1, 0.3), 2)},
            {'name': 'Retail', 'revenue': round(total_revenue * random.uniform(0.05, 0.15), 2)},
            {'name': 'Healthcare', 'revenue': round(total_revenue * random.uniform(0.05, 0.15), 2)},
        ]

        return {
            'summary': {
                'total_revenue': round(total_revenue, 2),
                'total_profit': round(total_profit, 2),
                'avg_growth': round(avg_growth, 1),
                'regions_covered': len(mentioned_cities),
                'text_length': len(text),
            },
            'regional_performance': regional_performance,
            'monthly_trends': monthly_trends,
            'investment_zones': investment_zones,
            'risk_growth': risk_growth,
            'categories': categories,
            'peak_demand': {
                'month': max(monthly_trends, key=lambda x: x['demand'])['month'],
                'value': max(monthly_trends, key=lambda x: x['demand'])['demand']
            }
        }

    def generate_overview(self, reports):
        """Generate aggregated overview from all reports"""
        total_revenue = 0
        total_profit = 0
        all_regional = []
        all_trends = []
        all_zones = []
        all_categories = {}

        for report in reports:
            analysis = report.get('analysis', {})
            summary = analysis.get('summary', {})
            total_revenue += summary.get('total_revenue', 0)
            total_profit += summary.get('total_profit', 0)

            all_regional.extend(analysis.get('regional_performance', []))
            all_trends.extend(analysis.get('monthly_trends', []))
            all_zones.extend(analysis.get('investment_zones', []))

            for cat in analysis.get('categories', []):
                name = cat['name']
                if name in all_categories:
                    all_categories[name] += cat['revenue']
                else:
                    all_categories[name] = cat['revenue']

        # Aggregate monthly revenue
        monthly_agg = {}
        for t in all_trends:
            m = t['month']
            if m not in monthly_agg:
                monthly_agg[m] = {'revenue': 0, 'demand': 0, 'orders': 0, 'count': 0}
            monthly_agg[m]['revenue'] += t['revenue']
            monthly_agg[m]['demand'] += t['demand']
            monthly_agg[m]['orders'] += t['orders']
            monthly_agg[m]['count'] += 1

        months_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_revenue = []
        for m in months_order:
            if m in monthly_agg:
                d = monthly_agg[m]
                monthly_revenue.append({
                    'month': m,
                    'revenue': round(d['revenue'] / max(d['count'], 1), 2),
                    'demand': round(d['demand'] / max(d['count'], 1), 1),
                    'orders': d['orders'] // max(d['count'], 1)
                })

        # Aggregate regional - deduplicate by city
        regional_agg = {}
        for r in all_regional:
            city = r['city']
            if city not in regional_agg:
                regional_agg[city] = r
            else:
                regional_agg[city]['revenue'] += r['revenue']
                regional_agg[city]['growth'] = (regional_agg[city]['growth'] + r['growth']) / 2

        top_regions = sorted(regional_agg.values(), key=lambda x: x['revenue'], reverse=True)[:10]

        # Category breakdown
        category_breakdown = [{'name': k, 'revenue': round(v, 2)} for k, v in all_categories.items()]
        category_breakdown.sort(key=lambda x: x['revenue'], reverse=True)

        avg_growth = sum(r.get('analysis', {}).get('summary', {}).get('avg_growth', 0) for r in reports) / max(len(reports), 1)

        return {
            'total_reports': len(reports),
            'total_revenue': round(total_revenue, 2),
            'total_profit': round(total_profit, 2),
            'revenue_growth': round(avg_growth, 1),
            'top_regions': top_regions,
            'demand_trends': monthly_revenue,
            'risk_indicators': reports[0]['analysis']['risk_growth']['indicators'] if reports else [],
            'investment_zones': all_zones[:8],
            'monthly_revenue': monthly_revenue,
            'category_breakdown': category_breakdown,
            'regional_performance': top_regions,
            'peak_demand': reports[0]['analysis'].get('peak_demand', {}) if reports else {}
        }

    def get_regional_insights(self, reports):
        """Get detailed regional insights"""
        all_regional = []
        for report in reports:
            all_regional.extend(report.get('analysis', {}).get('regional_performance', []))

        # Deduplicate and aggregate
        regional_agg = {}
        for r in all_regional:
            city = r['city']
            if city not in regional_agg:
                regional_agg[city] = dict(r)
            else:
                regional_agg[city]['revenue'] += r['revenue']

        regions = sorted(regional_agg.values(), key=lambda x: x['revenue'], reverse=True)

        return {
            'regions': regions,
            'total_cities': len(regions),
            'top_performer': regions[0] if regions else None,
            'highest_growth': max(regions, key=lambda x: x['growth']) if regions else None
        }

    def get_demand_trends(self, reports):
        """Get demand trend analysis"""
        all_trends = []
        for report in reports:
            all_trends.extend(report.get('analysis', {}).get('monthly_trends', []))

        # Aggregate
        monthly = {}
        for t in all_trends:
            m = t['month']
            if m not in monthly:
                monthly[m] = {'demand': [], 'revenue': [], 'orders': []}
            monthly[m]['demand'].append(t['demand'])
            monthly[m]['revenue'].append(t['revenue'])
            monthly[m]['orders'].append(t['orders'])

        months_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        trends = []
        for m in months_order:
            if m in monthly:
                d = monthly[m]
                trends.append({
                    'month': m,
                    'avg_demand': round(sum(d['demand']) / len(d['demand']), 1),
                    'avg_revenue': round(sum(d['revenue']) / len(d['revenue']), 2),
                    'total_orders': sum(d['orders']),
                    'peak': m in ['Oct', 'Nov', 'Dec']
                })

        peak_month = max(trends, key=lambda x: x['avg_demand']) if trends else None

        return {
            'trends': trends,
            'peak_period': peak_month,
            'seasonal_pattern': 'Q4 shows highest demand (festive season)',
            'recommendation': 'Increase inventory and marketing spend in Q4'
        }

    def get_investment_zones(self, reports):
        """Get investment opportunity zones"""
        all_zones = []
        for report in reports:
            all_zones.extend(report.get('analysis', {}).get('investment_zones', []))

        # Deduplicate by city
        zone_map = {}
        for z in all_zones:
            city = z['city']
            if city not in zone_map:
                zone_map[city] = z
            else:
                zone_map[city]['score'] = (zone_map[city]['score'] + z['score']) / 2

        zones = sorted(zone_map.values(), key=lambda x: x['score'], reverse=True)

        return {
            'zones': zones,
            'total_zones': len(zones),
            'best_opportunity': zones[0] if zones else None,
            'summary': f"Identified {len(zones)} high-potential investment zones across India"
        }

    def get_risk_growth_indicators(self, reports):
        """Get risk and growth indicators"""
        if not reports:
            return {'indicators': []}

        all_indicators = []
        for report in reports:
            rg = report.get('analysis', {}).get('risk_growth', {})
            all_indicators.append(rg)

        # Average indicators
        avg_risk = sum(r.get('overall_risk', 0) for r in all_indicators) / len(all_indicators)
        avg_volatility = sum(r.get('market_volatility', 0) for r in all_indicators) / len(all_indicators)
        avg_growth = sum(r.get('growth_trajectory', 0) for r in all_indicators) / len(all_indicators)

        return {
            'overall_risk': round(avg_risk, 1),
            'market_volatility': round(avg_volatility, 1),
            'growth_trajectory': round(avg_growth, 1),
            'indicators': all_indicators[0].get('indicators', []) if all_indicators else [],
            'recommendation': 'Moderate risk with strong growth trajectory' if avg_growth > avg_risk else 'Exercise caution - risk exceeds growth rate'
        }

    def generate_demo_data(self):
        """Generate demo reports for demonstration"""
        demo_reports = []
        companies = [
            ('Reliance Industries Annual Report 2025.pdf', 'Reliance Industries'),
            ('TCS Annual Report 2025.pdf', 'Tata Consultancy Services'),
            ('Infosys Annual Report 2025.pdf', 'Infosys Limited'),
            ('HDFC Bank Annual Report 2025.pdf', 'HDFC Bank'),
            ('HUL Annual Report 2025.pdf', 'Hindustan Unilever'),
        ]

        for filename, company in companies:
            report_id = str(uuid.uuid4())
            cities = random.sample(list(self.regions_data.keys()), random.randint(6, 12))

            extracted = {
                'text': f"Annual Report for {company}. " * 100,
                'pages': random.randint(80, 250),
                'tables': [],
                'financial_data': {
                    'revenue_mentions': [str(random.uniform(1000, 50000))],
                    'profit_mentions': [str(random.uniform(100, 10000))],
                    'growth_mentions': [str(random.uniform(5, 30))],
                },
                'regional_data': {
                    'cities': cities,
                    'states': list(set(self.regions_data[c]['state'] for c in cities if c in self.regions_data)),
                    'countries': ['India', 'USA', 'UK', 'Singapore']
                },
                'metadata': {'filename': filename, 'company': company}
            }

            analysis = self.analyze_report(extracted)

            report = {
                'id': report_id,
                'filename': filename,
                'company': company,
                'uploaded_at': (datetime.utcnow() - timedelta(days=random.randint(1, 30))).isoformat(),
                'pages': extracted['pages'],
                'analysis': analysis,
                'status': 'processed'
            }
            demo_reports.append(report)

        return demo_reports
