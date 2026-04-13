import React, { useState } from 'react';
import './FinancialReportDashboard.css';

// Mock Financial Data
const mockData = {
  revenue: {
    monthly: [
      { month: 'Jan', value: 2400, target: 2210 },
      { month: 'Feb', value: 1398, target: 1290 },
      { month: 'Mar', value: 9800, target: 3908 },
      { month: 'Apr', value: 3908, target: 4800 },
      { month: 'May', value: 4800, target: 3800 },
      { month: 'Jun', value: 3800, target: 4300 },
    ],
    total: '₹456.2 Cr',
    growth: '+24.5%',
  },
  portfolio: [
    { name: 'Tech Stocks', value: '₹125.4 Cr', change: '+18.2%', alloc: '27%' },
    { name: 'Real Estate', value: '₹89.7 Cr', change: '+12.4%', alloc: '20%' },
    { name: 'Bonds & Fixed', value: '₹98.5 Cr', change: '+5.2%', alloc: '22%' },
    { name: 'Commodities', value: '₹65.3 Cr', change: '-2.1%', alloc: '14%' },
    { name: 'International', value: '₹77.3 Cr', change: '+8.9%', alloc: '17%' },
  ],
  metrics: [
    { label: 'Total Assets', value: '₹456.2 Cr', change: '+4.2%', trend: 'up' },
    { label: 'Returns (YTD)', value: '16.8%', change: '+3.1%', trend: 'up' },
    { label: 'Sharpe Ratio', value: '1.85', change: '+0.12', trend: 'up' },
    { label: 'Risk Score', value: '3.2/10', change: '-0.4', trend: 'down' },
  ],
  marketTrends: [
    { sector: 'Technology', trend: 'Bullish', confidence: '85%' },
    { sector: 'Healthcare', trend: 'Neutral', confidence: '62%' },
    { sector: 'Finance', trend: 'Bullish', confidence: '78%' },
    { sector: 'Energy', trend: 'Bearish', confidence: '71%' },
  ],
};

function FinancialReportDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [authModal, setAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [email, setEmail] = useState('');
  const [pptLoading, setPptLoading] = useState(false);

  const loadPptxScript = () => {
    return new Promise((resolve) => {
      if (window.PptxGenJS) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundled.js';
        script.onload = resolve;
        document.head.appendChild(script);
      }
    });
  };

  const handleDownloadClick = () => {
    if (!isLoggedIn) {
      setAuthModal(true);
    } else {
      generatePPT();
    }
  };

  const handleGoogleLogin = () => {
    if (!email.includes('@gmail.com')) {
      alert('Please enter a valid Gmail address (@gmail.com)');
      return;
    }
    setUserEmail(email);
    setIsLoggedIn(true);
    setEmail('');
    setAuthModal(false);
    setTimeout(() => generatePPT(), 500);
  };

  const generatePPT = async () => {
    setPptLoading(true);
    try {
      await loadPptxScript();
      const PptxGenJS = window.PptxGenJS;
      const prs = new PptxGenJS();

      // Set presentation defaults
      prs.defineLayout({ name: 'LAYOUT1', master: 'MASTER1' });
      prs.setDefaultFontFace('Segoe UI');

      // Define color scheme
      const navy = '#1a2a5e';
      const gold = '#b8963e';
      const lightGray = '#f5f5f5';
      const darkGray = '#333333';

      // --- Slide 1: Title Slide ---
      let slide = prs.addSlide();
      slide.background = { color: navy };
      
      // Add gradient effect with rectangles
      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '40%',
        fill: { color: gold }, line: { type: 'none' }
      });

      slide.addText('FINORA-CO', {
        x: 0.5, y: 1.5, w: 9, h: 1,
        fontSize: 60, bold: true, color: navy,
        fontFace: 'Segoe UI', align: 'center'
      });

      slide.addText('Financial Report Dashboard', {
        x: 0.5, y: 2.7, w: 9, h: 0.8,
        fontSize: 32, color: darkGray,
        fontFace: 'Segoe UI', align: 'center'
      });

      slide.addText('AI-Powered Investment Intelligence', {
        x: 0.5, y: 4.2, w: 9, h: 0.5,
        fontSize: 18, color: navy, italic: true,
        fontFace: 'Segoe UI', align: 'center'
      });

      slide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: 0.5, y: 6.5, w: 9, h: 0.4,
        fontSize: 12, color: '#999999',
        fontFace: 'Segoe UI', align: 'center'
      });

      // --- Slide 2: Executive Summary ---
      slide = prs.addSlide();
      slide.background = { color: lightGray };

      // Header
      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.7,
        fill: { color: navy }, line: { type: 'none' }
      });

      slide.addText('Executive Summary', {
        x: 0.5, y: 0.15, w: 9, h: 0.4,
        fontSize: 32, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      // KPI Cards
      const kpiData = [
        { title: 'Total Assets', value: mockData.metrics[0].value },
        { title: 'YTD Returns', value: mockData.metrics[1].value },
        { title: 'Sharpe Ratio', value: mockData.metrics[2].value },
      ];

      kpiData.forEach((kpi, idx) => {
        const xPos = 0.5 + idx * 3.2;
        slide.addShape(prs.ShapeType.rect, {
          x: xPos, y: 1.2, w: 3, h: 1.5,
          fill: { color: '#ffffff' },
          line: { color: gold, width: 2 }
        });

        slide.addText(kpi.title, {
          x: xPos + 0.2, y: 1.4, w: 2.6, h: 0.3,
          fontSize: 11, color: '#999999', bold: true,
          fontFace: 'Segoe UI'
        });

        slide.addText(kpi.value, {
          x: xPos + 0.2, y: 1.8, w: 2.6, h: 0.6,
          fontSize: 24, color: navy, bold: true,
          fontFace: 'Segoe UI'
        });
      });

      // Summary text
      slide.addText(
        'Finora-Co demonstrates strong financial performance with diversified portfolio allocation across multiple asset classes. Year-to-date returns of 16.8% exceed market benchmarks with controlled risk exposure.',
        {
          x: 0.5, y: 3.0, w: 9, h: 2,
          fontSize: 14, color: darkGray,
          fontFace: 'Segoe UI', align: 'left', valign: 'top'
        }
      );

      // --- Slide 3: Revenue Overview ---
      slide = prs.addSlide();
      slide.background = { color: lightGray };

      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.7,
        fill: { color: navy }, line: { type: 'none' }
      });

      slide.addText('Revenue Overview', {
        x: 0.5, y: 0.15, w: 9, h: 0.4,
        fontSize: 32, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      // Revenue metrics
      slide.addText(`Total Revenue: ${mockData.revenue.total}`, {
        x: 0.5, y: 1.0, w: 4, h: 0.4,
        fontSize: 18, bold: true, color: navy,
        fontFace: 'Segoe UI'
      });

      slide.addText(`Growth: ${mockData.revenue.growth}`, {
        x: 5.5, y: 1.0, w: 4, h: 0.4,
        fontSize: 18, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      // Simple bar chart data visualization
      slide.addText('Monthly Revenue Trend (in Crores)', {
        x: 0.5, y: 1.6, w: 9, h: 0.3,
        fontSize: 12, color: '#666666', bold: true,
        fontFace: 'Segoe UI'
      });

      const chartData = [];
      const maxValue = Math.max(...mockData.revenue.monthly.map(m => m.value));
      mockData.revenue.monthly.forEach((month, idx) => {
        chartData.push([
          {
            name: month.month,
            labels: ['Revenue', 'Target'],
            data: [{ name: 'Revenue', val: [month.value] }, { name: 'Target', val: [month.target] }]
          }
        ]);
      });

      // Add table with revenue data
      const tableData = [
        [
          { text: 'Month', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Revenue (Cr)', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Target (Cr)', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'vs Target', options: { bold: true, color: '#ffffff', fill: navy } }
        ],
        ...mockData.revenue.monthly.map(m => [
          m.month,
          `₹${m.value}`,
          `₹${m.target}`,
          `${(((m.value - m.target) / m.target) * 100).toFixed(1)}%`
        ])
      ];

      slide.addTable(tableData, {
        x: 0.5, y: 2.0, w: 9, h: 3.5,
        colW: [2, 2.3, 2.3, 2.4],
        border: { pt: 1, color: '#cccccc' },
        rowH: 0.4,
        fontSize: 11,
        color: darkGray
      });

      // --- Slide 4: Portfolio Performance ---
      slide = prs.addSlide();
      slide.background = { color: lightGray };

      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.7,
        fill: { color: navy }, line: { type: 'none' }
      });

      slide.addText('Portfolio Performance', {
        x: 0.5, y: 0.15, w: 9, h: 0.4,
        fontSize: 32, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      const portfolioTable = [
        [
          { text: 'Asset Class', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Value', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Change', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Allocation', options: { bold: true, color: '#ffffff', fill: navy } }
        ],
        ...mockData.portfolio.map(p => [
          p.name,
          p.value,
          p.change,
          p.alloc
        ])
      ];

      slide.addTable(portfolioTable, {
        x: 0.5, y: 1.1, w: 9, h: 4.0,
        colW: [2.5, 2, 2, 2.5],
        border: { pt: 1, color: '#cccccc' },
        rowH: 0.5,
        fontSize: 12,
        color: darkGray
      });

      // --- Slide 5: Market Trends ---
      slide = prs.addSlide();
      slide.background = { color: lightGray };

      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.7,
        fill: { color: navy }, line: { type: 'none' }
      });

      slide.addText('Market Trends Analysis', {
        x: 0.5, y: 0.15, w: 9, h: 0.4,
        fontSize: 32, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      const trendTable = [
        [
          { text: 'Sector', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Trend', options: { bold: true, color: '#ffffff', fill: navy } },
          { text: 'Confidence', options: { bold: true, color: '#ffffff', fill: navy } }
        ],
        ...mockData.marketTrends.map(t => [
          t.sector,
          t.trend,
          t.confidence
        ])
      ];

      slide.addTable(trendTable, {
        x: 1.5, y: 1.1, w: 7, h: 2.5,
        colW: [2.3, 2.3, 2.4],
        border: { pt: 1, color: '#cccccc' },
        rowH: 0.5,
        fontSize: 13,
        color: darkGray
      });

      slide.addText(
        'Key Insights:\n\n' +
        '• Technology sector showing strong bullish signals with 85% confidence\n' +
        '• Healthcare remains neutral with selective opportunities\n' +
        '• Energy sector faces headwinds with bearish outlook\n' +
        '• Recommendation: Maintain current allocation with selective rebalancing',
        {
          x: 1.5, y: 4.0, w: 7, h: 2.0,
          fontSize: 12, color: darkGray,
          fontFace: 'Segoe UI', valign: 'top'
        }
      );

      // --- Slide 6: Key Metrics ---
      slide = prs.addSlide();
      slide.background = { color: lightGray };

      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.7,
        fill: { color: navy }, line: { type: 'none' }
      });

      slide.addText('Key Performance Metrics', {
        x: 0.5, y: 0.15, w: 9, h: 0.4,
        fontSize: 32, bold: true, color: gold,
        fontFace: 'Segoe UI'
      });

      mockData.metrics.forEach((metric, idx) => {
        const yPos = 1.2 + idx * 1.2;
        slide.addShape(prs.ShapeType.rect, {
          x: 0.5, y: yPos, w: 9, h: 1.0,
          fill: { color: '#ffffff' },
          line: { color: gold, width: 1 }
        });

        slide.addText(metric.label, {
          x: 0.7, y: yPos + 0.1, w: 3, h: 0.3,
          fontSize: 12, color: '#666666', bold: true,
          fontFace: 'Segoe UI'
        });

        slide.addText(metric.value, {
          x: 4.0, y: yPos + 0.1, w: 2.5, h: 0.3,
          fontSize: 18, color: navy, bold: true,
          fontFace: 'Segoe UI'
        });

        const changeColor = metric.trend === 'up' ? '#10b981' : '#ef4444';
        slide.addText(`${metric.trend === 'up' ? '↑' : '↓'} ${metric.change}`, {
          x: 6.8, y: yPos + 0.1, w: 2.4, h: 0.3,
          fontSize: 14, color: changeColor, bold: true,
          fontFace: 'Segoe UI', align: 'right'
        });
      });

      // --- Slide 7: Summary Slide ---
      slide = prs.addSlide();
      slide.background = { color: navy };

      slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 1.5, w: '100%', h: '100%',
        fill: { color: gold }, line: { type: 'none' }
      });

      slide.addText('Thank You', {
        x: 0.5, y: 2.0, w: 9, h: 0.8,
        fontSize: 48, bold: true, color: navy,
        fontFace: 'Segoe UI', align: 'center'
      });

      slide.addText('FINORA-CO', {
        x: 0.5, y: 3.0, w: 9, h: 0.5,
        fontSize: 28, bold: true, color: navy,
        fontFace: 'Segoe UI', align: 'center'
      });

      slide.addText('Rise Up Now', {
        x: 0.5, y: 3.6, w: 9, h: 0.4,
        fontSize: 18, color: navy,
        fontFace: 'Segoe UI', align: 'center', italic: true
      });

      slide.addText('AI-Powered Investment Intelligence', {
        x: 0.5, y: 5.5, w: 9, h: 0.3,
        fontSize: 12, color: navy,
        fontFace: 'Segoe UI', align: 'center'
      });

      // Save presentation
      prs.save({ fileName: 'Finora-Co_Financial_Report.pptx' });
      setPptLoading(false);
    } catch (error) {
      console.error('Error generating PPT:', error);
      alert('Error generating report. Please try again.');
      setPptLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  return (
    <div className="frd-container">
      {/* Navbar */}
      <nav className="frd-navbar">
        <div className="frd-navbar-brand">
          <span className="frd-brand-logo">₹</span>
          <span className="frd-brand-text">FINORA-CO</span>
        </div>
        <div className="frd-navbar-right">
          {isLoggedIn && (
            <div className="frd-user-info">
              <span className="frd-user-email">{userEmail}</span>
              <button onClick={handleLogout} className="frd-logout-btn">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="frd-main">
        {/* Sidebar */}
        <aside className="frd-sidebar">
          <div className="frd-sidebar-menu">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'revenue', label: '💰 Revenue', icon: '💰' },
              { id: 'portfolio', label: '📈 Portfolio', icon: '📈' },
              { id: 'trends', label: '📉 Market Trends', icon: '📉' },
              { id: 'metrics', label: '⚡ Metrics', icon: '⚡' },
            ].map(item => (
              <button
                key={item.id}
                className={`frd-menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="frd-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="frd-content">
          <div className="frd-header">
            <div>
              <h1>Financial Report Dashboard</h1>
              <p>AI-Powered Investment Intelligence • {new Date().toLocaleDateString()}</p>
            </div>
            <button
              className="frd-download-btn"
              onClick={handleDownloadClick}
              disabled={pptLoading}
            >
              {pptLoading ? '⏳ Generating...' : '📥 Download Report (PPT)'}
            </button>
          </div>

          {/* Content Sections */}
          {activeSection === 'overview' && (
            <div className="frd-section">
              <h2>Executive Overview</h2>
              <div className="frd-metrics-grid">
                {mockData.metrics.map((metric, idx) => (
                  <div key={idx} className="frd-metric-card">
                    <div className="frd-metric-label">{metric.label}</div>
                    <div className="frd-metric-value">{metric.value}</div>
                    <div className={`frd-metric-change ${metric.trend}`}>
                      {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'revenue' && (
            <div className="frd-section">
              <h2>Revenue Overview</h2>
              <div className="frd-revenue-header">
                <div className="frd-revenue-stat">
                  <span className="frd-label">Total Revenue</span>
                  <span className="frd-value">{mockData.revenue.total}</span>
                </div>
                <div className="frd-revenue-stat">
                  <span className="frd-label">YoY Growth</span>
                  <span className="frd-value" style={{ color: '#b8963e' }}>
                    {mockData.revenue.growth}
                  </span>
                </div>
              </div>
              <div className="frd-table">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Revenue (₹ Cr)</th>
                      <th>Target (₹ Cr)</th>
                      <th>vs Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.revenue.monthly.map((month, idx) => (
                      <tr key={idx}>
                        <td>{month.month}</td>
                        <td>₹{month.value}</td>
                        <td>₹{month.target}</td>
                        <td className={((month.value - month.target) / month.target) * 100 > 0 ? 'positive' : 'negative'}>
                          {(((month.value - month.target) / month.target) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'portfolio' && (
            <div className="frd-section">
              <h2>Portfolio Performance</h2>
              <div className="frd-table">
                <table>
                  <thead>
                    <tr>
                      <th>Asset Class</th>
                      <th>Value</th>
                      <th>Change</th>
                      <th>Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.portfolio.map((asset, idx) => (
                      <tr key={idx}>
                        <td>{asset.name}</td>
                        <td>{asset.value}</td>
                        <td className={asset.change.includes('-') ? 'negative' : 'positive'}>
                          {asset.change}
                        </td>
                        <td>{asset.alloc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="frd-allocation-chart">
                <h3>Asset Allocation Distribution</h3>
                <div className="frd-allocation-bars">
                  {mockData.portfolio.map((asset, idx) => (
                    <div key={idx} className="frd-allocation-item">
                      <div className="frd-allocation-label">{asset.name}</div>
                      <div className="frd-allocation-bar-container">
                        <div
                          className="frd-allocation-bar"
                          style={{
                            width: asset.alloc,
                            backgroundColor: ['#b8963e', '#1a2a5e', '#3b82f6', '#10b981', '#f59e0b'][idx],
                          }}
                        />
                      </div>
                      <div className="frd-allocation-percent">{asset.alloc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'trends' && (
            <div className="frd-section">
              <h2>Market Trends Analysis</h2>
              <div className="frd-table">
                <table>
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Trend</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.marketTrends.map((trend, idx) => (
                      <tr key={idx}>
                        <td>{trend.sector}</td>
                        <td>
                          <span className={`frd-trend-badge ${trend.trend.toLowerCase()}`}>
                            {trend.trend === 'Bullish' ? '📈' : trend.trend === 'Bearish' ? '📉' : '➡️'} {trend.trend}
                          </span>
                        </td>
                        <td>{trend.confidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="frd-insights">
                <h3>📌 Key Insights</h3>
                <ul>
                  <li><strong>Technology:</strong> Strong bullish signals across semiconductor and software sectors</li>
                  <li><strong>Healthcare:</strong> Selective opportunities in biotech and diagnostics</li>
                  <li><strong>Finance:</strong> Stable outlook with interest rate sensitivity</li>
                  <li><strong>Energy:</strong> Transitional phase with renewable energy opportunities</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'metrics' && (
            <div className="frd-section">
              <h2>Key Performance Metrics</h2>
              <div className="frd-metrics-detailed">
                {mockData.metrics.map((metric, idx) => (
                  <div key={idx} className="frd-metric-detailed-card">
                    <div className="frd-metric-details-header">
                      <span className="frd-metric-details-label">{metric.label}</span>
                      <span className={`frd-metric-change-badge ${metric.trend}`}>
                        {metric.trend === 'up' ? '📈' : '📉'} {metric.change}
                      </span>
                    </div>
                    <div className="frd-metric-details-value">{metric.value}</div>
                    <div className="frd-metric-details-bar">
                      <div
                        className={`frd-metric-details-fill ${metric.trend}`}
                        style={{ width: `${Math.min(parseFloat(metric.value) * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      {authModal && (
        <div className="frd-modal-overlay" onClick={() => setAuthModal(false)}>
          <div className="frd-modal" onClick={e => e.stopPropagation()}>
            <div className="frd-modal-header">
              <h2>Sign in with Google</h2>
              <button className="frd-modal-close" onClick={() => setAuthModal(false)}>✕</button>
            </div>
            <div className="frd-modal-body">
              <p>Please sign in with your Gmail account to download the report</p>
              <input
                type="email"
                placeholder="Enter your Gmail address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="frd-modal-input"
                onKeyPress={e => e.key === 'Enter' && handleGoogleLogin()}
              />
            </div>
            <div className="frd-modal-footer">
              <button className="frd-modal-btn cancel" onClick={() => setAuthModal(false)}>
                Cancel
              </button>
              <button className="frd-modal-btn signin" onClick={handleGoogleLogin}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialReportDashboard;
