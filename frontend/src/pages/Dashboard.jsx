import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// Chart theme colors
const chartColors = {
  navy: '#0a1628',
  navyLight: '#1e4d7b',
  gold: '#c4a44a',
  goldLight: '#e0cb7e',
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  orange: '#f59e0b',
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: 'Inter', size: 12 },
        color: '#64707f',
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#0a1628',
      titleFont: { family: 'Space Grotesk', size: 13, weight: 600 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
    },
  },
};

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const loadDemo = async () => {
    setDemoLoading(true);
    try {
      await api.loadDemoData();
      await fetchOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const clearData = async () => {
    try {
      await api.clearData();
      await fetchOverview();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary mt-md" onClick={fetchOverview}>
          Retry Connection
        </button>
        <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          Make sure the backend is running: <code>python app.py</code>
        </p>
      </div>
    );
  }

  const hasData = overview && overview.total_reports > 0;

  // Revenue trend chart data
  const revenueTrendData = {
    labels: (overview?.monthly_revenue || []).map(m => m.month),
    datasets: [
      {
        label: 'Revenue (₹ Cr)',
        data: (overview?.monthly_revenue || []).map(m => m.revenue),
        borderColor: chartColors.navy,
        backgroundColor: 'rgba(10, 22, 40, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.navy,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Demand Index',
        data: (overview?.monthly_revenue || []).map(m => m.demand),
        borderColor: chartColors.gold,
        backgroundColor: 'rgba(196, 164, 74, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.gold,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Category breakdown doughnut
  const categoryData = {
    labels: (overview?.category_breakdown || []).map(c => c.name),
    datasets: [{
      data: (overview?.category_breakdown || []).map(c => c.revenue),
      backgroundColor: [
        chartColors.navy,
        chartColors.gold,
        chartColors.blue,
        chartColors.green,
        chartColors.purple,
        chartColors.cyan,
      ],
      borderWidth: 2,
      borderColor: '#fff',
      hoverBorderWidth: 3,
    }],
  };

  // Regional performance bar chart
  const topRegions = (overview?.top_regions || []).slice(0, 8);
  const regionalBarData = {
    labels: topRegions.map(r => r.city),
    datasets: [
      {
        label: 'Revenue (₹ Cr)',
        data: topRegions.map(r => r.revenue),
        backgroundColor: topRegions.map((_, i) =>
          i === 0 ? chartColors.gold : `rgba(10, 22, 40, ${0.8 - i * 0.08})`
        ),
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  // Risk indicators radar
  const riskIndicators = overview?.risk_indicators || [];
  const radarData = {
    labels: riskIndicators.map(i => i.name),
    datasets: [{
      label: 'Score',
      data: riskIndicators.map(i => i.value),
      backgroundColor: 'rgba(196, 164, 74, 0.15)',
      borderColor: chartColors.gold,
      borderWidth: 2,
      pointBackgroundColor: chartColors.gold,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  return (
    <div className="slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>AI-Powered Annual Report Intelligence</p>
        </div>
        <div className="flex gap-sm">
          {hasData && (
            <button className="btn btn-outline btn-sm" onClick={clearData}>
              🗑️ Clear Data
            </button>
          )}
          <button
            className="btn btn-gold btn-sm"
            onClick={loadDemo}
            disabled={demoLoading}
          >
            {demoLoading ? '⏳ Loading...' : '📊 Load Demo Data'}
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="empty-state" style={{ minHeight: 400 }}>
          <div className="empty-state-icon">📊</div>
          <h3>Welcome to Finora-Co</h3>
          <p>Upload annual reports or load demo data to start seeing insights, analytics, and investment intelligence.</p>
          <div className="flex gap-sm mt-lg">
            <button className="btn btn-gold" onClick={loadDemo} disabled={demoLoading}>
              {demoLoading ? '⏳ Loading Demo...' : '🚀 Load Demo Data'}
            </button>
            <a href="/documents" className="btn btn-outline">📁 Upload Reports</a>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon blue">📋</div>
              <div className="stat-card-value">{overview.total_reports}</div>
              <div className="stat-card-label">Reports Analyzed</div>
              <div className="stat-card-change positive">↑ Active</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon gold">💰</div>
              <div className="stat-card-value">₹{(overview.total_revenue / 1000).toFixed(1)}K</div>
              <div className="stat-card-label">Total Revenue (Cr)</div>
              <div className="stat-card-change positive">↑ {overview.revenue_growth}%</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon green">📈</div>
              <div className="stat-card-value">{overview.revenue_growth}%</div>
              <div className="stat-card-label">Average Growth</div>
              <div className={`stat-card-change ${overview.revenue_growth > 10 ? 'positive' : 'neutral'}`}>
                {overview.revenue_growth > 10 ? '↑ Strong' : '→ Moderate'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon red">📍</div>
              <div className="stat-card-value">{(overview.top_regions || []).length}</div>
              <div className="stat-card-label">Regions Covered</div>
              <div className="stat-card-change positive">↑ Expanding</div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Revenue & Demand Trends</div>
                  <div className="card-subtitle">Monthly performance overview</div>
                </div>
                {overview.peak_demand && (
                  <span className="badge gold">🔥 Peak: {overview.peak_demand.month}</span>
                )}
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <Line
                    data={revenueTrendData}
                    options={{
                      ...chartDefaults,
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { family: 'Inter', size: 11 }, color: '#8892a6' },
                        },
                        y: {
                          grid: { color: 'rgba(0,0,0,0.04)' },
                          ticks: { font: { family: 'Inter', size: 11 }, color: '#8892a6' },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Revenue by Category</div>
                  <div className="card-subtitle">Business segment distribution</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <Doughnut
                    data={categoryData}
                    options={{
                      ...chartDefaults,
                      cutout: '65%',
                      plugins: {
                        ...chartDefaults.plugins,
                        legend: {
                          ...chartDefaults.plugins.legend,
                          position: 'right',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Regional Performance</div>
                  <div className="card-subtitle">Top performing cities by revenue</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container large">
                  <Bar
                    data={regionalBarData}
                    options={{
                      ...chartDefaults,
                      indexAxis: 'y',
                      scales: {
                        x: {
                          grid: { color: 'rgba(0,0,0,0.04)' },
                          ticks: { font: { family: 'Inter', size: 11 }, color: '#8892a6' },
                        },
                        y: {
                          grid: { display: false },
                          ticks: { font: { family: 'Inter', size: 12, weight: 500 }, color: '#2d3748' },
                        },
                      },
                      plugins: {
                        ...chartDefaults.plugins,
                        legend: { display: false },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Performance Indicators</div>
                  <div className="card-subtitle">Key financial metrics radar</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container large">
                  {riskIndicators.length > 0 ? (
                    <Radar
                      data={radarData}
                      options={{
                        ...chartDefaults,
                        scales: {
                          r: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            angleLines: { color: 'rgba(0,0,0,0.06)' },
                            pointLabels: {
                              font: { family: 'Inter', size: 11 },
                              color: '#4a5568',
                            },
                            ticks: { display: false },
                          },
                        },
                        plugins: {
                          ...chartDefaults.plugins,
                          legend: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <div className="empty-state">
                      <p className="text-gray">No indicator data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Investment Zones Preview */}
          <div className="card mb-lg">
            <div className="card-header">
              <div>
                <div className="card-title">🎯 Top Investment Opportunities</div>
                <div className="card-subtitle">AI-identified high-potential zones</div>
              </div>
              <a href="/investments" className="btn btn-ghost btn-sm">View All →</a>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {(overview.investment_zones || []).slice(0, 4).map((zone, i) => (
                  <div className="zone-card" key={i}>
                    <div className="zone-card-header">
                      <div>
                        <div className="zone-card-title">{zone.city}, {zone.state}</div>
                      </div>
                      <span className={`badge ${zone.recommendation === 'Strong Buy' ? 'success' : zone.recommendation === 'Buy' ? 'info' : 'warning'}`}>
                        {zone.recommendation}
                      </span>
                    </div>
                    <div className="zone-card-metrics">
                      <div className="zone-metric">
                        <div className="zone-metric-value">{zone.score?.toFixed(1)}</div>
                        <div className="zone-metric-label">Score</div>
                      </div>
                      <div className="zone-metric">
                        <div className="zone-metric-value text-success">+{zone.growth_potential?.toFixed(1)}%</div>
                        <div className="zone-metric-label">Growth</div>
                      </div>
                      <div className="zone-metric">
                        <div className={`zone-metric-value ${zone.risk_level === 'Low' ? 'text-success' : zone.risk_level === 'Medium' ? 'text-warning' : 'text-danger'}`}>
                          {zone.risk_level}
                        </div>
                        <div className="zone-metric-label">Risk</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Regions Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📍 Regional Performance Breakdown</div>
                <div className="card-subtitle">Detailed city-wise analysis</div>
              </div>
              <a href="/analytics" className="btn btn-ghost btn-sm">Full Analytics →</a>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Revenue (₹ Cr)</th>
                    <th>Growth</th>
                    <th>Demand Score</th>
                    <th>Risk</th>
                    <th>Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {topRegions.map((region, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%',
                          background: i === 0 ? 'var(--gold-500)' : i < 3 ? 'var(--navy-800)' : 'var(--gray-200)',
                          color: i < 3 ? 'white' : 'var(--gray-600)',
                          fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{region.city}</td>
                      <td>{region.state}</td>
                      <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>₹{region.revenue?.toFixed(0)}</td>
                      <td>
                        <span className={`badge ${region.growth > 10 ? 'success' : region.growth > 0 ? 'info' : 'danger'}`}>
                          {region.growth > 0 ? '+' : ''}{region.growth?.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div
                              className={`progress-fill ${region.demand_score > 70 ? 'green' : region.demand_score > 40 ? 'gold' : 'red'}`}
                              style={{ width: `${region.demand_score}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{region.demand_score?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${region.risk_score < 30 ? 'success' : region.risk_score < 55 ? 'warning' : 'danger'}`}>
                          {region.risk_score < 30 ? 'Low' : region.risk_score < 55 ? 'Med' : 'High'}
                        </span>
                      </td>
                      <td>
                        <span className="badge navy">Tier {region.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
