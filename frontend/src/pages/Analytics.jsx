import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartColors = {
  navy: '#0a1628', navyLight: '#1e4d7b', gold: '#c4a44a', goldLight: '#e0cb7e',
  blue: '#3b82f6', green: '#10b981', red: '#ef4444', purple: '#8b5cf6',
  cyan: '#06b6d4', orange: '#f59e0b',
};

function Analytics() {
  const [regional, setRegional] = useState(null);
  const [trends, setTrends] = useState(null);
  const [riskGrowth, setRiskGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regional');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reg, trnd, rg] = await Promise.all([
        api.getRegionalAnalytics(),
        api.getDemandTrends(),
        api.getRiskGrowth(),
      ]);
      setRegional(reg);
      setTrends(trnd);
      setRiskGrowth(rg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--gray-400)' }}>Loading analytics...</p>
      </div>
    );
  }

  const hasData = regional?.regions?.length > 0;

  if (!hasData) {
    return (
      <div className="slide-up">
        <div className="page-header">
          <div>
            <h2>Analytics</h2>
            <p>Comprehensive financial analysis and insights</p>
          </div>
        </div>
        <div className="empty-state" style={{ minHeight: 400 }}>
          <div className="empty-state-icon">📈</div>
          <h3>No Analytics Data</h3>
          <p>Upload annual reports or load demo data from the Dashboard to view detailed analytics.</p>
          <a href="/" className="btn btn-gold mt-md">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  const regions = regional?.regions || [];
  const trendData = trends?.trends || [];

  // Demand trend line chart
  const demandLineData = {
    labels: trendData.map(t => t.month),
    datasets: [
      {
        label: 'Avg Demand',
        data: trendData.map(t => t.avg_demand),
        borderColor: chartColors.navy,
        backgroundColor: 'rgba(10, 22, 40, 0.06)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: trendData.map(t => t.peak ? chartColors.gold : chartColors.navy),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: trendData.map(t => t.peak ? 7 : 4),
      },
      {
        label: 'Avg Revenue (₹ Cr)',
        data: trendData.map(t => t.avg_revenue),
        borderColor: chartColors.gold,
        backgroundColor: 'rgba(196, 164, 74, 0.06)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.gold,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Growth vs Risk scatter-ish bar
  const growthVsRisk = {
    labels: regions.slice(0, 10).map(r => r.city),
    datasets: [
      {
        label: 'Growth %',
        data: regions.slice(0, 10).map(r => r.growth),
        backgroundColor: chartColors.green,
        borderRadius: 4,
        barThickness: 18,
      },
      {
        label: 'Risk Score',
        data: regions.slice(0, 10).map(r => r.risk_score),
        backgroundColor: chartColors.red + '80',
        borderRadius: 4,
        barThickness: 18,
      },
    ],
  };

  // Market share doughnut
  const marketShareData = {
    labels: regions.slice(0, 6).map(r => r.city),
    datasets: [{
      data: regions.slice(0, 6).map(r => r.market_share),
      backgroundColor: [
        chartColors.navy, chartColors.gold, chartColors.blue,
        chartColors.green, chartColors.purple, chartColors.cyan,
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  // Demand heatmap-style viz
  const demandByRegion = {
    labels: regions.slice(0, 10).map(r => r.city),
    datasets: [{
      label: 'Demand Score',
      data: regions.slice(0, 10).map(r => r.demand_score),
      backgroundColor: regions.slice(0, 10).map(r => {
        if (r.demand_score > 80) return chartColors.green;
        if (r.demand_score > 60) return chartColors.gold;
        if (r.demand_score > 40) return chartColors.orange;
        return chartColors.red;
      }),
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { font: { family: 'Inter', size: 12 }, color: '#64707f', usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#0a1628',
        titleFont: { family: 'Space Grotesk', size: 13, weight: 600 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const tabs = [
    { id: 'regional', label: '📍 Regional', icon: '📍' },
    { id: 'demand', label: '📈 Demand Trends', icon: '📈' },
    { id: 'risk', label: '⚠️ Risk & Growth', icon: '⚠️' },
  ];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Analytics Center</h2>
          <p>Deep-dive into financial data, trends, and performance metrics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-lg" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`btn btn-ghost ${activeTab === tab.id ? 'text-navy' : ''}`}
            style={{
              borderBottom: activeTab === tab.id ? '2px solid var(--navy-800)' : '2px solid transparent',
              borderRadius: 0,
              paddingBottom: 12,
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Regional Tab */}
      {activeTab === 'regional' && (
        <>
          {/* Summary cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon blue">📍</div>
              <div className="stat-card-value">{regional.total_cities}</div>
              <div className="stat-card-label">Cities Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon gold">🏆</div>
              <div className="stat-card-value">{regional.top_performer?.city}</div>
              <div className="stat-card-label">Top Performer (Revenue)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon green">🚀</div>
              <div className="stat-card-value">{regional.highest_growth?.city}</div>
              <div className="stat-card-label">Highest Growth</div>
              <div className="stat-card-change positive">+{regional.highest_growth?.growth?.toFixed(1)}%</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Demand Score by Region</div>
                  <div className="card-subtitle">Color-coded: 🟢 High · 🟡 Medium · 🔴 Low</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container large">
                  <Bar data={demandByRegion} options={{
                    ...chartOpts,
                    indexAxis: 'y',
                    scales: {
                      x: { grid: { color: 'rgba(0,0,0,0.04)' }, max: 100 },
                      y: { grid: { display: false }, ticks: { font: { weight: 500 } } },
                    },
                    plugins: { ...chartOpts.plugins, legend: { display: false } },
                  }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Market Share Distribution</div>
                  <div className="card-subtitle">Top 6 cities by market share</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container large">
                  <Doughnut data={marketShareData} options={{
                    ...chartOpts,
                    cutout: '60%',
                    plugins: { ...chartOpts.plugins, legend: { position: 'right' } },
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Complete Regional Data</div>
            </div>
            <div className="card-body" style={{ padding: 0, overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                    <th>Market Share</th>
                    <th>Demand</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.city}</td>
                      <td>{r.state}</td>
                      <td>₹{r.revenue?.toFixed(0)} Cr</td>
                      <td>
                        <span className={`badge ${r.growth > 10 ? 'success' : r.growth > 0 ? 'info' : 'danger'}`}>
                          {r.growth > 0 ? '+' : ''}{r.growth?.toFixed(1)}%
                        </span>
                      </td>
                      <td>{r.market_share?.toFixed(1)}%</td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className={`progress-fill ${r.demand_score > 70 ? 'green' : 'gold'}`}
                              style={{ width: `${r.demand_score}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem' }}>{r.demand_score?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.risk_score < 30 ? 'success' : r.risk_score < 55 ? 'warning' : 'danger'}`}>
                          {r.risk_score?.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Demand Trends Tab */}
      {activeTab === 'demand' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon gold">🔥</div>
              <div className="stat-card-value">{trends?.peak_period?.month || 'N/A'}</div>
              <div className="stat-card-label">Peak Demand Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon blue">📊</div>
              <div className="stat-card-value">{trends?.peak_period?.avg_demand?.toFixed(0) || '—'}</div>
              <div className="stat-card-label">Peak Demand Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon green">💡</div>
              <div className="stat-card-value" style={{ fontSize: '1rem' }}>{trends?.seasonal_pattern?.substring(0, 30) || 'N/A'}</div>
              <div className="stat-card-label">Seasonal Pattern</div>
            </div>
          </div>

          <div className="card mb-lg">
            <div className="card-header">
              <div>
                <div className="card-title">📈 Demand & Revenue Trend (12-Month)</div>
                <div className="card-subtitle">🔥 marks indicate peak demand months</div>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container large">
                <Line data={demandLineData} options={{
                  ...chartOpts,
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0,0,0,0.04)' } },
                  },
                }} />
              </div>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📊 Monthly Breakdown</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Avg Demand</th>
                    <th>Avg Revenue</th>
                    <th>Total Orders</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{t.month}</td>
                      <td>{t.avg_demand?.toFixed(1)}</td>
                      <td>₹{t.avg_revenue?.toFixed(1)} Cr</td>
                      <td>{t.total_orders?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${t.peak ? 'gold' : 'navy'}`}>
                          {t.peak ? '🔥 Peak' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {trends?.recommendation && (
              <div className="card-footer">
                <p style={{ fontSize: '0.85rem', color: 'var(--navy-700)' }}>
                  💡 <strong>Recommendation:</strong> {trends.recommendation}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Risk & Growth Tab */}
      {activeTab === 'risk' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon red">⚠️</div>
              <div className="stat-card-value">{riskGrowth?.overall_risk?.toFixed(1)}</div>
              <div className="stat-card-label">Overall Risk Score</div>
              <div className={`stat-card-change ${riskGrowth?.overall_risk < 40 ? 'positive' : 'negative'}`}>
                {riskGrowth?.overall_risk < 40 ? 'Low Risk' : 'Moderate Risk'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon blue">📊</div>
              <div className="stat-card-value">{riskGrowth?.market_volatility?.toFixed(1)}</div>
              <div className="stat-card-label">Market Volatility</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon green">📈</div>
              <div className="stat-card-value">{riskGrowth?.growth_trajectory?.toFixed(1)}%</div>
              <div className="stat-card-label">Growth Trajectory</div>
              <div className="stat-card-change positive">↑ Positive</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Growth vs Risk by Region</div>
                  <div className="card-subtitle">Comparative analysis across cities</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container large">
                  <Bar data={growthVsRisk} options={{
                    ...chartOpts,
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: 'rgba(0,0,0,0.04)' } },
                    },
                  }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Key Performance Indicators</div>
                  <div className="card-subtitle">Financial health metrics</div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(riskGrowth?.indicators || []).map((ind, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {ind.status === 'positive' ? '✅' : ind.status === 'neutral' ? '⚡' : '❌'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                          {ind.name}
                        </div>
                        <div className="progress-bar" style={{ marginTop: 6 }}>
                          <div
                            className={`progress-fill ${ind.status === 'positive' ? 'green' : ind.status === 'neutral' ? 'gold' : 'red'}`}
                            style={{ width: `${Math.min(ind.value, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'Space Grotesk', fontWeight: 700,
                        fontSize: '1rem', color: 'var(--navy-800)'
                      }}>
                        {typeof ind.value === 'number' ? ind.value.toFixed(1) : ind.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {riskGrowth?.recommendation && (
                <div className="card-footer">
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-700)' }}>
                    💡 <strong>Assessment:</strong> {riskGrowth.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
