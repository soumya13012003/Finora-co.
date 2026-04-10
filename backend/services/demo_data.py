"""
Demo Data Generator
Generates realistic sample data for the dashboard when no real reports are uploaded.
"""


def generate_demo_data() -> dict:
    """Generate comprehensive demo data for the dashboard"""

    # Monthly Revenue Data (24 months)
    monthly_revenue = [
        {"month": "Jan 2024", "revenue": 18200000, "profit": 2730000, "expenses": 15470000},
        {"month": "Feb 2024", "revenue": 19100000, "profit": 2865000, "expenses": 16235000},
        {"month": "Mar 2024", "revenue": 22400000, "profit": 3360000, "expenses": 19040000},
        {"month": "Apr 2024", "revenue": 21300000, "profit": 3195000, "expenses": 18105000},
        {"month": "May 2024", "revenue": 20800000, "profit": 3120000, "expenses": 17680000},
        {"month": "Jun 2024", "revenue": 23500000, "profit": 3525000, "expenses": 19975000},
        {"month": "Jul 2024", "revenue": 24200000, "profit": 3630000, "expenses": 20570000},
        {"month": "Aug 2024", "revenue": 22800000, "profit": 3420000, "expenses": 19380000},
        {"month": "Sep 2024", "revenue": 25100000, "profit": 3765000, "expenses": 21335000},
        {"month": "Oct 2024", "revenue": 27300000, "profit": 4095000, "expenses": 23205000},
        {"month": "Nov 2024", "revenue": 28900000, "profit": 4335000, "expenses": 24565000},
        {"month": "Dec 2024", "revenue": 26400000, "profit": 3960000, "expenses": 22440000},
        {"month": "Jan 2025", "revenue": 21500000, "profit": 3225000, "expenses": 18275000},
        {"month": "Feb 2025", "revenue": 22300000, "profit": 3345000, "expenses": 18955000},
        {"month": "Mar 2025", "revenue": 25800000, "profit": 3870000, "expenses": 21930000},
        {"month": "Apr 2025", "revenue": 24200000, "profit": 3630000, "expenses": 20570000},
        {"month": "May 2025", "revenue": 23600000, "profit": 3540000, "expenses": 20060000},
        {"month": "Jun 2025", "revenue": 26100000, "profit": 3915000, "expenses": 22185000},
        {"month": "Jul 2025", "revenue": 27400000, "profit": 4110000, "expenses": 23290000},
        {"month": "Aug 2025", "revenue": 25900000, "profit": 3885000, "expenses": 22015000},
        {"month": "Sep 2025", "revenue": 28300000, "profit": 4245000, "expenses": 24055000},
        {"month": "Oct 2025", "revenue": 31200000, "profit": 4680000, "expenses": 26520000},
        {"month": "Nov 2025", "revenue": 33100000, "profit": 4965000, "expenses": 28135000},
        {"month": "Dec 2025", "revenue": 29800000, "profit": 4470000, "expenses": 25330000},
    ]

    # Quarterly Revenue
    quarterly_revenue = [
        {"quarter": "Q1 2024", "revenue": 59700000, "profit": 8955000, "growth": 8.2},
        {"quarter": "Q2 2024", "revenue": 65600000, "profit": 9840000, "growth": 11.5},
        {"quarter": "Q3 2024", "revenue": 72100000, "profit": 10815000, "growth": 14.8},
        {"quarter": "Q4 2024", "revenue": 82600000, "profit": 12390000, "growth": 18.2},
        {"quarter": "Q1 2025", "revenue": 69600000, "profit": 10440000, "growth": 16.6},
        {"quarter": "Q2 2025", "revenue": 73900000, "profit": 11085000, "growth": 12.7},
        {"quarter": "Q3 2025", "revenue": 81600000, "profit": 12240000, "growth": 13.2},
        {"quarter": "Q4 2025", "revenue": 94100000, "profit": 14115000, "growth": 13.9},
    ]

    # Yearly Revenue
    yearly_revenue = [
        {"year": "2021", "revenue": 198000000, "profit": 25740000, "margin": 13.0},
        {"year": "2022", "revenue": 219000000, "profit": 30660000, "margin": 14.0},
        {"year": "2023", "revenue": 242000000, "profit": 36300000, "margin": 15.0},
        {"year": "2024", "revenue": 280000000, "profit": 42000000, "margin": 15.0},
        {"year": "2025", "revenue": 319200000, "profit": 47880000, "margin": 15.0},
    ]

    # Regional Performance
    regions = [
        {"name": "North America", "revenue": 89200000, "growth": 14.2, "market_share": 31.3, "risk_score": 22, "color": "#3B82F6",
         "countries": ["USA", "Canada", "Mexico"], "lat": 39.8283, "lng": -98.5795},
        {"name": "South Asia", "revenue": 54800000, "growth": 22.1, "market_share": 19.3, "risk_score": 38, "color": "#10B981",
         "countries": ["India", "Bangladesh", "Sri Lanka"], "lat": 20.5937, "lng": 78.9629},
        {"name": "Western Europe", "revenue": 48300000, "growth": 6.8, "market_share": 17.0, "risk_score": 18, "color": "#8B5CF6",
         "countries": ["UK", "Germany", "France", "Netherlands"], "lat": 48.8566, "lng": 2.3522},
        {"name": "East Asia", "revenue": 41200000, "growth": 9.5, "market_share": 14.5, "risk_score": 35, "color": "#F59E0B",
         "countries": ["China", "Japan", "South Korea"], "lat": 35.8617, "lng": 104.1954},
        {"name": "Latin America", "revenue": 28700000, "growth": 17.3, "market_share": 10.1, "risk_score": 52, "color": "#EF4444",
         "countries": ["Brazil", "Argentina", "Colombia"], "lat": -14.2350, "lng": -51.9253},
        {"name": "Middle East", "revenue": 14300000, "growth": 11.8, "market_share": 5.0, "risk_score": 45, "color": "#06B6D4",
         "countries": ["UAE", "Saudi Arabia", "Qatar"], "lat": 23.4241, "lng": 53.8478},
        {"name": "Africa", "revenue": 8000000, "growth": 28.5, "market_share": 2.8, "risk_score": 61, "color": "#EC4899",
         "countries": ["Nigeria", "South Africa", "Kenya"], "lat": -8.7832, "lng": 34.5085},
    ]

    # Top Cities
    top_cities = [
        {"city": "Mumbai", "country": "India", "revenue": 18400000, "growth": 28.3, "demand_index": 94},
        {"city": "New York", "country": "USA", "revenue": 15700000, "growth": 11.2, "demand_index": 88},
        {"city": "Singapore", "country": "Singapore", "revenue": 12900000, "growth": 33.1, "demand_index": 96},
        {"city": "London", "country": "UK", "revenue": 11800000, "growth": 5.4, "demand_index": 79},
        {"city": "São Paulo", "country": "Brazil", "revenue": 10200000, "growth": 21.7, "demand_index": 85},
        {"city": "Tokyo", "country": "Japan", "revenue": 9800000, "growth": 7.2, "demand_index": 76},
        {"city": "Dubai", "country": "UAE", "revenue": 8500000, "growth": 19.4, "demand_index": 82},
        {"city": "Shanghai", "country": "China", "revenue": 7900000, "growth": 12.8, "demand_index": 80},
        {"city": "Berlin", "country": "Germany", "revenue": 6700000, "growth": 8.9, "demand_index": 73},
        {"city": "Lagos", "country": "Nigeria", "revenue": 4200000, "growth": 42.1, "demand_index": 71},
    ]

    # Country Performance
    country_performance = [
        {"country": "USA", "revenue": 68500000, "growth": 12.8, "investment_score": 85},
        {"country": "India", "revenue": 42300000, "growth": 24.5, "investment_score": 92},
        {"country": "UK", "revenue": 19800000, "growth": 5.2, "investment_score": 72},
        {"country": "Germany", "revenue": 15600000, "growth": 7.8, "investment_score": 75},
        {"country": "Brazil", "revenue": 18200000, "growth": 19.3, "investment_score": 78},
        {"country": "China", "revenue": 28400000, "growth": 8.9, "investment_score": 74},
        {"country": "Japan", "revenue": 12800000, "growth": 4.2, "investment_score": 68},
        {"country": "UAE", "revenue": 10500000, "growth": 15.7, "investment_score": 81},
        {"country": "Singapore", "revenue": 12900000, "growth": 33.1, "investment_score": 94},
        {"country": "Nigeria", "revenue": 4200000, "growth": 42.1, "investment_score": 69},
    ]

    # Demand Trends
    demand_trends = [
        {"month": "Jan", "electronics": 78, "fmcg": 82, "industrial": 65, "software": 71},
        {"month": "Feb", "electronics": 82, "fmcg": 80, "industrial": 68, "software": 74},
        {"month": "Mar", "electronics": 95, "fmcg": 88, "industrial": 72, "software": 89},
        {"month": "Apr", "electronics": 88, "fmcg": 85, "industrial": 70, "software": 92},
        {"month": "May", "electronics": 85, "fmcg": 83, "industrial": 74, "software": 86},
        {"month": "Jun", "electronics": 90, "fmcg": 87, "industrial": 78, "software": 83},
        {"month": "Jul", "electronics": 98, "fmcg": 91, "industrial": 71, "software": 80},
        {"month": "Aug", "electronics": 102, "fmcg": 89, "industrial": 69, "software": 78},
        {"month": "Sep", "electronics": 94, "fmcg": 86, "industrial": 76, "software": 88},
        {"month": "Oct", "electronics": 115, "fmcg": 95, "industrial": 80, "software": 94},
        {"month": "Nov", "electronics": 128, "fmcg": 105, "industrial": 75, "software": 97},
        {"month": "Dec", "electronics": 135, "fmcg": 112, "industrial": 68, "software": 85},
    ]

    # Peak Periods
    peak_periods = [
        {"period": "Oct-Dec", "demand_index": 142, "driver": "Festival & Holiday Season", "yoy_change": 15.3},
        {"period": "Mar-Apr", "demand_index": 128, "driver": "Fiscal Year-End Purchases", "yoy_change": 12.1},
        {"period": "Jul-Aug", "demand_index": 115, "driver": "Back-to-School & Summer", "yoy_change": 8.7},
        {"period": "Jan-Feb", "demand_index": 89, "driver": "Post-Holiday Slowdown", "yoy_change": 3.2},
    ]

    # Product Demand
    product_demand = [
        {"product": "Enterprise Software", "demand": 94, "revenue": 89400000, "growth": 18.5, "forecast": "up"},
        {"product": "Cloud Services", "demand": 98, "revenue": 52800000, "growth": 34.2, "forecast": "up"},
        {"product": "Consumer Electronics", "demand": 87, "revenue": 45200000, "growth": 12.1, "forecast": "stable"},
        {"product": "Professional Services", "demand": 76, "revenue": 38600000, "growth": 8.4, "forecast": "stable"},
        {"product": "Hardware Solutions", "demand": 62, "revenue": 28900000, "growth": -2.3, "forecast": "down"},
        {"product": "Security Products", "demand": 91, "revenue": 34100000, "growth": 27.8, "forecast": "up"},
    ]

    # Seasonal Index
    seasonal_index = [
        {"month": "Jan", "index": 82}, {"month": "Feb", "index": 85},
        {"month": "Mar", "index": 105}, {"month": "Apr", "index": 98},
        {"month": "May", "index": 92}, {"month": "Jun", "index": 97},
        {"month": "Jul", "index": 108}, {"month": "Aug", "index": 103},
        {"month": "Sep", "index": 95}, {"month": "Oct", "index": 118},
        {"month": "Nov", "index": 132}, {"month": "Dec", "index": 142},
    ]

    # Investment Opportunities
    investment_opportunities = [
        {
            "region": "South-East Asia",
            "score": 92,
            "growth_potential": 23.4,
            "market_penetration": 34,
            "risk_level": "Medium",
            "roi_estimate": 34,
            "timeline": "18-24 months",
            "key_factors": ["Rapid digitalization", "Growing middle class", "Government incentives"]
        },
        {
            "region": "Western India",
            "score": 87,
            "growth_potential": 31.2,
            "market_penetration": 28,
            "risk_level": "Medium",
            "roi_estimate": 28,
            "timeline": "12-18 months",
            "key_factors": ["Tier-2 city boom", "Manufacturing hub", "Infrastructure development"]
        },
        {
            "region": "Eastern Europe",
            "score": 81,
            "growth_potential": 18.7,
            "market_penetration": 22,
            "risk_level": "Medium-High",
            "roi_estimate": 22,
            "timeline": "24-30 months",
            "key_factors": ["EU integration", "Tech talent pool", "Lower labor costs"]
        },
        {
            "region": "Sub-Saharan Africa",
            "score": 74,
            "growth_potential": 42.1,
            "market_penetration": 8,
            "risk_level": "High",
            "roi_estimate": 45,
            "timeline": "30-36 months",
            "key_factors": ["Untapped market", "Mobile-first economy", "Youth demographics"]
        },
        {
            "region": "Nordic Countries",
            "score": 79,
            "growth_potential": 8.4,
            "market_penetration": 56,
            "risk_level": "Low",
            "roi_estimate": 15,
            "timeline": "12-15 months",
            "key_factors": ["Stable economy", "High digital adoption", "Strong purchasing power"]
        },
    ]

    # Risk Matrix
    risk_matrix = [
        {"factor": "Supply Chain", "probability": 0.65, "impact": 0.78, "score": 67, "trend": "rising"},
        {"factor": "Currency Volatility", "probability": 0.45, "impact": 0.62, "score": 54, "trend": "stable"},
        {"factor": "Regulatory Changes", "probability": 0.35, "impact": 0.58, "score": 41, "trend": "declining"},
        {"factor": "Market Competition", "probability": 0.72, "impact": 0.68, "score": 72, "trend": "rising"},
        {"factor": "Geopolitical", "probability": 0.30, "impact": 0.55, "score": 38, "trend": "stable"},
        {"factor": "Technology Disruption", "probability": 0.55, "impact": 0.72, "score": 58, "trend": "rising"},
        {"factor": "Talent Retention", "probability": 0.48, "impact": 0.45, "score": 44, "trend": "stable"},
    ]

    # ROI Projections
    roi_projections = [
        {"quarter": "Q1 2026", "conservative": 8, "moderate": 14, "aggressive": 22},
        {"quarter": "Q2 2026", "conservative": 10, "moderate": 17, "aggressive": 28},
        {"quarter": "Q3 2026", "conservative": 12, "moderate": 20, "aggressive": 32},
        {"quarter": "Q4 2026", "conservative": 14, "moderate": 23, "aggressive": 38},
        {"quarter": "Q1 2027", "conservative": 15, "moderate": 26, "aggressive": 41},
        {"quarter": "Q2 2027", "conservative": 17, "moderate": 29, "aggressive": 45},
    ]

    # Risk Factors
    risk_factors = [
        {"name": "Supply Chain Disruption", "score": 67, "trend": "rising", "impact": "high",
         "description": "Global supply chain pressures continue with increasing logistics costs"},
        {"name": "Market Competition", "score": 72, "trend": "rising", "impact": "high",
         "description": "New entrants in key markets increasing competitive pressure"},
        {"name": "Technology Disruption", "score": 58, "trend": "rising", "impact": "medium",
         "description": "AI and automation changing industry dynamics rapidly"},
        {"name": "Currency Volatility", "score": 54, "trend": "stable", "impact": "medium",
         "description": "Emerging market currencies showing higher-than-normal volatility"},
        {"name": "Talent Retention", "score": 44, "trend": "stable", "impact": "medium",
         "description": "Competitive job market making key talent retention challenging"},
        {"name": "Regulatory Changes", "score": 41, "trend": "declining", "impact": "medium",
         "description": "New data privacy and AI regulations coming into effect"},
        {"name": "Geopolitical Risk", "score": 38, "trend": "stable", "impact": "low",
         "description": "Regional conflicts creating uncertainty in select markets"},
    ]

    # Risk Trend
    risk_trend = [
        {"month": "Jul 2025", "overall": 38, "supply_chain": 58, "market": 65, "regulatory": 48},
        {"month": "Aug 2025", "overall": 36, "supply_chain": 60, "market": 66, "regulatory": 46},
        {"month": "Sep 2025", "overall": 35, "supply_chain": 62, "market": 68, "regulatory": 44},
        {"month": "Oct 2025", "overall": 34, "supply_chain": 63, "market": 69, "regulatory": 43},
        {"month": "Nov 2025", "overall": 33, "supply_chain": 65, "market": 70, "regulatory": 42},
        {"month": "Dec 2025", "overall": 32, "supply_chain": 67, "market": 72, "regulatory": 41},
    ]

    # Mitigation Suggestions
    mitigation_suggestions = [
        {"risk": "Supply Chain", "action": "Diversify supplier base across 3+ regions", "priority": "high", "timeline": "Q2 2026"},
        {"risk": "Market Competition", "action": "Accelerate product innovation cycle by 30%", "priority": "high", "timeline": "Q1 2026"},
        {"risk": "Currency Volatility", "action": "Implement dynamic hedging for EM currencies", "priority": "medium", "timeline": "Q2 2026"},
        {"risk": "Technology Disruption", "action": "Invest 15% more in R&D and AI capabilities", "priority": "high", "timeline": "Q1 2026"},
        {"risk": "Talent Retention", "action": "Launch equity-based retention program", "priority": "medium", "timeline": "Q1 2026"},
    ]

    # Recent Reports
    recent_reports = [
        {"id": "rpt-001", "name": "Annual Report FY 2025", "company": "TechCorp Inc.", "date": "2025-12-15", "pages": 142, "status": "analyzed"},
        {"id": "rpt-002", "name": "Q4 Financial Statement", "company": "Global Industries", "date": "2025-11-28", "pages": 86, "status": "analyzed"},
        {"id": "rpt-003", "name": "Annual Report FY 2025", "company": "InnovateTech", "date": "2025-12-20", "pages": 198, "status": "analyzed"},
        {"id": "rpt-004", "name": "Sustainability Report", "company": "GreenEnergy Corp", "date": "2025-10-15", "pages": 64, "status": "analyzed"},
        {"id": "rpt-005", "name": "Investor Presentation", "company": "FinServe Ltd", "date": "2025-11-05", "pages": 45, "status": "analyzed"},
    ]

    return {
        "monthly_revenue": monthly_revenue,
        "quarterly_revenue": quarterly_revenue,
        "yearly_revenue": yearly_revenue,
        "regions": regions,
        "top_cities": top_cities,
        "country_performance": country_performance,
        "demand_trends": demand_trends,
        "peak_periods": peak_periods,
        "product_demand": product_demand,
        "seasonal_index": seasonal_index,
        "investment_opportunities": investment_opportunities,
        "risk_matrix": risk_matrix,
        "roi_projections": roi_projections,
        "risk_factors": risk_factors,
        "risk_trend": risk_trend,
        "mitigation_suggestions": mitigation_suggestions,
        "recent_reports": recent_reports,
    }
