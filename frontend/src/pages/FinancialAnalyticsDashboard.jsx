import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './FinancialAnalyticsDashboard.css';

// ═══════════════════════════════════════════════════════════════
// FINORA-CO FINANCIAL ANALYTICS DASHBOARD
// Connected to Flask Backend at http://localhost:5000
// ═══════════════════════════════════════════════════════════════

const API_BASE_URL = '';
const COLORS = {
  navy: '#1a2a5e',
  gold: '#b8963e',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  white: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// ─── API Service ───
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error);
    throw error;
  }
};

// ─── Loading Skeleton Component ───
const LoadingSkeleton = ({ height = 200 }) => (
  <div className="fad-skeleton" style={{ height: `${height}px` }}>
    <div className="fad-skeleton-bar" style={{ animationDelay: '0s' }} />
    <div className="fad-skeleton-bar" style={{ animationDelay: '0.5s' }} />
    <div className="fad-skeleton-bar" style={{ animationDelay: '1s' }} />
  </div>
);

// ─── KPI Card Component ───
const KPICard = ({ label, value, change, icon }) => (
  <div className="fad-kpi-card">
    <div className="fad-kpi-icon">{icon}</div>
    <div className="fad-kpi-content">
      <div className="fad-kpi-label">{label}</div>
      <div className="fad-kpi-value">{value}</div>
      {change && <div className={`fad-kpi-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>{change}</div>}
    </div>
  </div>
);

// ─── Main Dashboard Component ───
function FinancialAnalyticsDashboard() {
  // State
  const [activeZone, setActiveZone] = useState('overview');
  const [backendHealth, setBackendHealth] = useState('checking');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Analytics Data State
  const [overview, setOverview] = useState(null);
  const [regional, setRegional] = useState(null);
  const [demandTrends, setDemandTrends] = useState(null);
  const [investmentZones, setInvestmentZones] = useState(null);
  const [riskGrowth, setRiskGrowth] = useState(null);
  const [documents, setDocuments] = useState(null);

  // Loading & Error State
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(Math.random().toString(36).substr(2, 9));

  // ─── Check Backend Health ───
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          setBackendHealth('healthy');
        } else {
          setBackendHealth('unhealthy');
        }
      } catch (error) {
        setBackendHealth('unreachable');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ─── Fetch All Analytics on Mount ───
  useEffect(() => {
    if (backendHealth === 'healthy') {
      fetchAllAnalytics();
    }
  }, [backendHealth]);

  const fetchAllAnalytics = async () => {
    setLoading(prev => ({
      ...prev,
      overview: true,
      regional: true,
      demandTrends: true,
      investmentZones: true,
      riskGrowth: true,
      documents: true,
    }));

    try {
      const overviewData = await apiCall('/api/analytics/overview');

      // Auto-load demo if no reports
      if (overviewData.total_reports === 0) {
        try {
          await apiCall('/api/demo/load', { method: 'POST' });
          // Re-fetch after demo load
          const newOverview = await apiCall('/api/analytics/overview');
          setOverview(newOverview);
        } catch (error) {
          console.error('Demo load error:', error);
          setOverview(overviewData);
        }
      } else {
        setOverview(overviewData);
      }

      const [regional, demandTrends, investmentZones, riskGrowth, documents] = await Promise.all([
        apiCall('/api/analytics/regional').catch(e => ({ regions: [], error: e.message })),
        apiCall('/api/analytics/demand-trends').catch(e => ({ trends: [], error: e.message })),
        apiCall('/api/analytics/investment-zones').catch(e => ({ zones: [], error: e.message })),
        apiCall('/api/analytics/risk-growth').catch(e => ({ indicators: [], error: e.message })),
        apiCall('/api/documents').catch(e => ({ documents: [], error: e.message })),
      ]);

      setRegional(regional);
      setDemandTrends(demandTrends);
      setInvestmentZones(investmentZones);
      setRiskGrowth(riskGrowth);
      setDocuments(documents);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setErrors(prev => ({ ...prev, general: error.message }));
    } finally {
      setLoading(prev => ({
        ...prev,
        overview: false,
        regional: false,
        demandTrends: false,
        investmentZones: false,
        riskGrowth: false,
        documents: false,
      }));
    }
  };

  // ─── Chat Handler ───
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const response = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: chatMessage,
          session_id: sessionId,
        }),
      });

      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '❌ Error: Unable to get response' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Login Handler ───
  const handleLogin = () => {
    if (!loginEmail.includes('@gmail.com')) {
      alert('Please enter a valid Gmail address');
      return;
    }
    setUserEmail(loginEmail);
    setIsLoggedIn(true);
    setLoginEmail('');
    setShowLoginModal(false);
  };

  // ─── Generate PPT ───
  const generatePPT = async () => {
    setIsGenerating(true);
    setDownloadProgress(0);

    try {
      // Load PptxGenJS library
      if (!window.PptxGenJS) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundled.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const PptxGenJS = window.PptxGenJS;
      const prs = new PptxGenJS();
      setDownloadProgress(10);

      // Fetch all data
      const allData = await Promise.all([
        apiCall('/api/analytics/overview'),
        apiCall('/api/analytics/regional'),
        apiCall('/api/analytics/demand-trends'),
        apiCall('/api/analytics/investment-zones'),
        apiCall('/api/analytics/risk-growth'),
        apiCall('/api/documents'),
      ]);

      const [overviewData, regionalData, trendsData, zonesData, riskData, docsData] = allData;
      setDownloadProgress(30);

      // Define slides
      const addHeaderFooter = (slide) => {
        slide.addShape(prs.ShapeType.rect, {
          x: 0, y: 0, w: '100%', h: 0.5,
          fill: { color: COLORS.navy }, line: { type: 'none' }
        });
        slide.addText('FINORA-CO', {
          x: 0.5, y: 0.05, w: 9, h: 0.4,
          fontSize: 16, bold: true, color: COLORS.gold,
          fontFace: 'Segoe UI'
        });
        slide.addText('Financial Report', {
          x: 9.5, y: 0.05, w: 0.5, h: 0.4,
          fontSize: 10, color: COLORS.gold,
          fontFace: 'Segoe UI', align: 'right'
        });
      };

      // Slide 1: Title
      let slide = prs.addSlide();
      slide.background = { color: COLORS.navy };
      slide.addText('FINORA-CO', {
        x: 0.5, y: 2, w: 9, h: 1,
        fontSize: 54, bold: true, color: COLORS.gold,
        fontFace: 'Segoe UI', align: 'center'
      });
      slide.addText('Financial Report', {
        x: 0.5, y: 3.2, w: 9, h: 0.6,
        fontSize: 32, color: COLORS.white,
        fontFace: 'Segoe UI', align: 'center'
      });
      slide.addText(new Date().toLocaleDateString(), {
        x: 0.5, y: 5.5, w: 9, h: 0.4,
        fontSize: 14, color: COLORS.gold,
        fontFace: 'Segoe UI', align: 'center'
      });
      setDownloadProgress(40);

      // Slide 2: KPI Summary
      slide = prs.addSlide();
      slide.background = { color: COLORS.lightGray };
      addHeaderFooter(slide);
      slide.addText('KPI Summary', {
        x: 0.5, y: 0.7, w: 9, h: 0.4,
        fontSize: 28, bold: true, color: COLORS.navy,
        fontFace: 'Segoe UI'
      });

      const kpiTableData = [
        [
          { text: 'Metric', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Value', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
        ],
        ['Total Reports', `${overviewData.total_reports}`],
        ['Total Revenue', `₹${overviewData.total_revenue?.toFixed(0)} Cr`],
        ['Revenue Growth', `${overviewData.revenue_growth}%`],
        ['Investment Zones', `${overviewData.investment_zones?.length || 0}`],
      ];

      slide.addTable(kpiTableData, {
        x: 1.5, y: 1.3, w: 7, h: 3,
        colW: [3.5, 3.5],
        border: { pt: 1, color: COLORS.gold },
        rowH: 0.5,
        fontSize: 14,
        color: COLORS.darkGray
      });
      setDownloadProgress(50);

      // Slide 3: Monthly Revenue
      slide = prs.addSlide();
      slide.background = { color: COLORS.lightGray };
      addHeaderFooter(slide);
      slide.addText('Monthly Revenue', {
        x: 0.5, y: 0.7, w: 9, h: 0.4,
        fontSize: 28, bold: true, color: COLORS.navy,
        fontFace: 'Segoe UI'
      });

      const monthlyTableData = [
        [
          { text: 'Month', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Revenue (₹ Cr)', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
        ],
        ...(overviewData.monthly_revenue?.slice(0, 10).map(m => [m.month, `₹${m.revenue}`]) || []),
      ];

      slide.addTable(monthlyTableData, {
        x: 1, y: 1.3, w: 8, h: 4,
        colW: [4, 4],
        border: { pt: 1, color: COLORS.gold },
        rowH: 0.35,
        fontSize: 11,
        color: COLORS.darkGray
      });
      setDownloadProgress(60);

      // Slide 4: Investment Zones
      slide = prs.addSlide();
      slide.background = { color: COLORS.lightGray };
      addHeaderFooter(slide);
      slide.addText('Investment Zones', {
        x: 0.5, y: 0.7, w: 9, h: 0.4,
        fontSize: 28, bold: true, color: COLORS.navy,
        fontFace: 'Segoe UI'
      });

      const zonesTableData = [
        [
          { text: 'Zone', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Score', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Risk', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
        ],
        ...(zonesData.zones?.slice(0, 8).map(z => [z.city, `${z.score?.toFixed(1)}`, z.risk_level]) || []),
      ];

      slide.addTable(zonesTableData, {
        x: 1, y: 1.3, w: 8, h: 4,
        colW: [2.7, 2.7, 2.6],
        border: { pt: 1, color: COLORS.gold },
        rowH: 0.4,
        fontSize: 11,
        color: COLORS.darkGray
      });
      setDownloadProgress(70);

      // Slide 5: Regional Performance
      slide = prs.addSlide();
      slide.background = { color: COLORS.lightGray };
      addHeaderFooter(slide);
      slide.addText('Regional Performance', {
        x: 0.5, y: 0.7, w: 9, h: 0.4,
        fontSize: 28, bold: true, color: COLORS.navy,
        fontFace: 'Segoe UI'
      });

      const regionalTableData = [
        [
          { text: 'Region', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Revenue (₹ Cr)', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
          { text: 'Growth %', options: { bold: true, fill: COLORS.navy, color: COLORS.white } },
        ],
        ...(regionalData.regions?.slice(0, 8).map(r => [r.region, `${r.revenue?.toFixed(1)}`, `${r.growth?.toFixed(1)}%`]) || []),
      ];

      slide.addTable(regionalTableData, {
        x: 0.75, y: 1.3, w: 8.5, h: 4,
        colW: [2.8, 2.9, 2.8],
        border: { pt: 1, color: COLORS.gold },
        rowH: 0.4,
        fontSize: 11,
        color: COLORS.darkGray
      });
      setDownloadProgress(80);

      // Slide 6: Summary
      slide = prs.addSlide();
      slide.background = { color: COLORS.lightGray };
      addHeaderFooter(slide);
      slide.addText('Report Summary', {
        x: 0.5, y: 0.7, w: 9, h: 0.4,
        fontSize: 28, bold: true, color: COLORS.navy,
        fontFace: 'Segoe UI'
      });

      slide.addText(
        `Generated: ${new Date().toLocaleString()}\n\n` +
        `Total Reports Analyzed: ${overviewData.total_reports}\n` +
        `Total Revenue: ₹${overviewData.total_revenue?.toFixed(0)} Crores\n` +
        `Revenue Growth: ${overviewData.revenue_growth}%\n` +
        `Investment Opportunities Identified: ${zonesData.zones?.length || 0}\n` +
        `Regions Covered: ${regionalData.regions?.length || 0}\n\n` +
        'Finora-Co - AI-Powered Investment Intelligence',
        {
          x: 1.5, y: 1.5, w: 7, h: 4,
          fontSize: 14, color: COLORS.darkGray,
          fontFace: 'Segoe UI', valign: 'top', lineSpacing: 20
        }
      );
      setDownloadProgress(90);

      // Save
      prs.save({ fileName: `Finora-Co_Financial_Report_${new Date().toISOString().split('T')[0]}.pptx` });
      setDownloadProgress(100);
    } catch (error) {
      console.error('PPT generation error:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      generatePPT();
    }
  };

  // ─── Render Zone Components ───
  const renderZone = () => {
    if (backendHealth === 'unreachable') {
      return (
        <div className="fad-error-banner">
          <span>⚠️ Backend unreachable at {API_BASE_URL}. Make sure Flask is running.</span>
          <button onClick={fetchAllAnalytics}>Retry</button>
        </div>
      );
    }

    switch (activeZone) {
      case 'overview':
        return (
          <div className="fad-zone-content">
            <h2>Overview</h2>
            {loading.overview ? (
              <LoadingSkeleton height={300} />
            ) : overview ? (
              <>
                <div className="fad-kpi-grid">
                  <KPICard label="Total Reports" value={overview.total_reports} icon="📊" />
                  <KPICard label="Total Revenue" value={`₹${overview.total_revenue?.toFixed(0)} Cr`} icon="💰" />
                  <KPICard label="Revenue Growth" value={`${overview.revenue_growth}%`} change="+2.3%" icon="📈" />
                  <KPICard label="Investment Zones" value={overview.investment_zones?.length || 0} icon="🎯" />
                </div>

                {overview.monthly_revenue?.length > 0 && (
                  <div className="fad-chart">
                    <h3>Monthly Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={overview.monthly_revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" stroke={COLORS.darkGray} />
                        <YAxis stroke={COLORS.darkGray} />
                        <Tooltip contentStyle={{ backgroundColor: COLORS.navy, border: `1px solid ${COLORS.gold}` }} />
                        <Line type="monotone" dataKey="revenue" stroke={COLORS.gold} strokeWidth={2} dot={{ fill: COLORS.gold }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {overview.category_breakdown?.length > 0 && (
                  <div className="fad-chart">
                    <h3>Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={overview.category_breakdown} dataKey="revenue" cx="50%" cy="50%" outerRadius={80} label>
                          {overview.category_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[COLORS.navy, COLORS.gold, COLORS.info, COLORS.success, COLORS.warning][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="fad-empty">No data available</div>
            )}
          </div>
        );

      case 'investment-zones':
        return (
          <div className="fad-zone-content">
            <h2>Investment Zones</h2>
            {loading.investmentZones ? (
              <LoadingSkeleton height={400} />
            ) : investmentZones?.zones?.length > 0 ? (
              <div className="fad-zones-grid">
                {investmentZones.zones.map((zone, idx) => (
                  <div key={idx} className={`fad-zone-card risk-${zone.risk_level?.toLowerCase()}`}>
                    <div className="fad-zone-header">
                      <h3>{zone.city}</h3>
                      <span className={`fad-risk-badge ${zone.risk_level?.toLowerCase()}`}>{zone.risk_level}</span>
                    </div>
                    <div className="fad-zone-body">
                      <div className="fad-zone-stat">
                        <span>Score</span>
                        <strong>{zone.score?.toFixed(1)}</strong>
                      </div>
                      <div className="fad-zone-stat">
                        <span>Growth</span>
                        <strong>{zone.growth_potential?.toFixed(1)}%</strong>
                      </div>
                      <div className="fad-zone-stat">
                        <span>Action</span>
                        <strong className="fad-action">{zone.recommendation}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fad-empty">No investment zones available</div>
            )}
          </div>
        );

      case 'regional':
        return (
          <div className="fad-zone-content">
            <h2>Regional Analytics</h2>
            {loading.regional ? (
              <LoadingSkeleton height={400} />
            ) : regional?.regions?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regional.regions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="region" stroke={COLORS.darkGray} />
                    <YAxis stroke={COLORS.darkGray} />
                    <Tooltip contentStyle={{ backgroundColor: COLORS.navy, border: `1px solid ${COLORS.gold}` }} />
                    <Bar dataKey="revenue" fill={COLORS.gold} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '20px' }}>
                  <table className="fad-table">
                    <thead>
                      <tr style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
                        <th>Region</th>
                        <th>Revenue (₹ Cr)</th>
                        <th>Growth %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regional.regions.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.region}</td>
                          <td>₹{r.revenue?.toFixed(1)}</td>
                          <td className={r.growth > 0 ? 'positive' : 'negative'}>{r.growth?.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="fad-empty">No regional data available</div>
            )}
          </div>
        );

      case 'demand-trends':
        return (
          <div className="fad-zone-content">
            <h2>Demand Trends</h2>
            {loading.demandTrends ? (
              <LoadingSkeleton height={400} />
            ) : demandTrends?.trends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={demandTrends.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="period" stroke={COLORS.darkGray} />
                  <YAxis stroke={COLORS.darkGray} />
                  <Tooltip contentStyle={{ backgroundColor: COLORS.navy, border: `1px solid ${COLORS.gold}` }} />
                  <Area type="monotone" dataKey="demand" stroke={COLORS.gold} fill={COLORS.gold} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="fad-empty">No trend data available</div>
            )}
          </div>
        );

      case 'risk-growth':
        return (
          <div className="fad-zone-content">
            <h2>Risk & Growth Indicators</h2>
            {loading.riskGrowth ? (
              <LoadingSkeleton height={400} />
            ) : riskGrowth?.indicators?.length > 0 ? (
              <div className="fad-indicators-grid">
                {riskGrowth.indicators.map((ind, idx) => (
                  <div key={idx} className="fad-indicator-card">
                    <div className="fad-indicator-label">{ind.name}</div>
                    <div className="fad-indicator-value">{ind.value}</div>
                    <div className="fad-indicator-bar">
                      <div style={{ width: `${Math.min(ind.value * 10, 100)}%`, backgroundColor: COLORS.gold }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fad-empty">No risk/growth data available</div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="fad-zone-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Documents</h2>
              <button className="fad-upload-btn" onClick={() => alert('Upload functionality to be implemented')}>
                📤 Upload New Report
              </button>
            </div>
            {loading.documents ? (
              <LoadingSkeleton height={400} />
            ) : documents?.documents?.length > 0 ? (
              <table className="fad-table">
                <thead>
                  <tr style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
                    <th>Filename</th>
                    <th>Pages</th>
                    <th>Status</th>
                    <th>Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.documents.map((doc, idx) => (
                    <tr key={idx}>
                      <td>{doc.filename}</td>
                      <td>{doc.pages}</td>
                      <td>
                        <span className={`fad-status-badge ${doc.status?.toLowerCase()}`}>{doc.status}</span>
                      </td>
                      <td>{doc.analysis_data ? '✓ Ready' : '⏳ Processing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="fad-empty">No documents uploaded yet. Upload annual reports to get started.</div>
            )}
          </div>
        );

      case 'chat':
        return (
          <div className="fad-zone-content">
            <h2>Finora Assistant</h2>
            <div className="fad-chat-container">
              <div className="fad-chat-history">
                {chatHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                    💬 Start typing to ask about financial insights...
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`fad-chat-bubble fad-chat-${msg.role}`}>
                      {msg.content}
                    </div>
                  ))
                )}
                {chatLoading && <div className="fad-chat-bubble fad-chat-assistant">⏳ Thinking...</div>}
              </div>
              <form onSubmit={handleChatSubmit} className="fad-chat-input-form">
                <input
                  type="text"
                  placeholder="Ask about revenue, investments, regions..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  disabled={chatLoading}
                  className="fad-chat-input"
                />
                <button type="submit" disabled={chatLoading} className="fad-chat-send">
                  {chatLoading ? '...' : '→'}
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return <div className="fad-zone-content">Select a zone</div>;
    }
  };

  return (
    <div className="fad-dashboard">
      {/* Navbar */}
      <nav className="fad-navbar">
        <div className="fad-navbar-brand">
          <span className="fad-brand-icon">₹</span>
          <span className="fad-brand-text">FINORA-CO</span>
        </div>
        <div className="fad-navbar-center">
          {backendHealth === 'healthy' ? (
            <span className="fad-health-indicator" title="Backend connected">🟢 Connected</span>
          ) : (
            <span className="fad-health-indicator error" title="Backend disconnected">🔴 Disconnected</span>
          )}
        </div>
        <div className="fad-navbar-right">
          <button onClick={handleDownloadClick} disabled={isGenerating} className="fad-download-report-btn" title="Download as PowerPoint">
            {isGenerating ? `📥 Generating... ${downloadProgress}%` : '📥 Download Report'}
          </button>
          {isLoggedIn ? (
            <div className="fad-user-info">
              <span className="fad-user-email">{userEmail}</span>
              <button onClick={() => { setIsLoggedIn(false); setUserEmail(''); }} className="fad-logout-btn">
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </nav>

      <div className="fad-main">
        {/* Sidebar */}
        <aside className="fad-sidebar">
          <div className="fad-sidebar-header">
            <div className="fad-sidebar-logo">FINORA-CO</div>
            <div className="fad-sidebar-tagline">RISE UP NOW</div>
          </div>
          <nav className="fad-sidebar-menu">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'investment-zones', label: 'Investment Zones', icon: '🎯' },
              { id: 'regional', label: 'Regional Analytics', icon: '🗺️' },
              { id: 'demand-trends', label: 'Demand Trends', icon: '📈' },
              { id: 'risk-growth', label: 'Risk & Growth', icon: '⚡' },
              { id: 'documents', label: 'Documents', icon: '📄' },
              { id: 'chat', label: 'AI Assistant', icon: '🤖' },
            ].map(item => (
              <button
                key={item.id}
                className={`fad-menu-item ${activeZone === item.id ? 'active' : ''}`}
                onClick={() => setActiveZone(item.id)}
              >
                <span className="fad-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="fad-content-area">
          {renderZone()}
        </main>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fad-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="fad-modal" onClick={e => e.stopPropagation()}>
            <div className="fad-modal-header">
              <h2>Sign in to Download Report</h2>
              <button className="fad-modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
            </div>
            <div className="fad-modal-body">
              <p>Please sign in with your Gmail account to download the financial report</p>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="fad-modal-input"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="fad-modal-footer">
              <button onClick={() => setShowLoginModal(false)} className="fad-modal-btn cancel">Cancel</button>
              <button onClick={handleLogin} className="fad-modal-btn signin">Sign In with Gmail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialAnalyticsDashboard;
