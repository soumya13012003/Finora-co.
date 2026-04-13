import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

function InvestmentZones() {
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await api.getInvestmentZones();
      setZones(data);
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
        <p style={{ color: 'var(--gray-400)' }}>Loading investment zones...</p>
      </div>
    );
  }

  const zoneList = zones?.zones || [];

  if (zoneList.length === 0) {
    return (
      <div className="slide-up">
        <div className="page-header">
          <div>
            <h2>Investment Zones</h2>
            <p>AI-identified high-potential investment opportunities</p>
          </div>
        </div>
        <div className="empty-state" style={{ minHeight: 400 }}>
          <div className="empty-state-icon">💰</div>
          <h3>No Investment Data</h3>
          <p>Upload annual reports or load demo data to discover investment opportunities across regions.</p>
          <a href="/" className="btn btn-gold mt-md">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  const getGradeColor = (rec) => {
    if (rec === 'Strong Buy') return 'success';
    if (rec === 'Buy') return 'info';
    return 'warning';
  };

  const getGradeIcon = (rec) => {
    if (rec === 'Strong Buy') return '🟢';
    if (rec === 'Buy') return '🔵';
    return '🟡';
  };

  // Zone comparison chart
  const comparisonData = {
    labels: zoneList.map(z => z.city),
    datasets: [
      {
        label: 'Investment Score',
        data: zoneList.map(z => z.score),
        backgroundColor: zoneList.map(z =>
          z.recommendation === 'Strong Buy' ? '#10b981' :
          z.recommendation === 'Buy' ? '#3b82f6' : '#f59e0b'
        ),
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Investment Zones</h2>
          <p>AI-identified high-potential investment opportunities • {zoneList.length} zones analyzed</p>
        </div>
        {zones?.best_opportunity && (
          <div className="badge success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            🏆 Best: {zones.best_opportunity.city} (Score: {zones.best_opportunity.score?.toFixed(1)})
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon gold">🎯</div>
          <div className="stat-card-value">{zoneList.length}</div>
          <div className="stat-card-label">Investment Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">🟢</div>
          <div className="stat-card-value">{zoneList.filter(z => z.recommendation === 'Strong Buy').length}</div>
          <div className="stat-card-label">Strong Buy Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon blue">🔵</div>
          <div className="stat-card-value">{zoneList.filter(z => z.recommendation === 'Buy').length}</div>
          <div className="stat-card-label">Buy Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red">⚠️</div>
          <div className="stat-card-value">{zoneList.filter(z => z.risk_level === 'High').length}</div>
          <div className="stat-card-label">High Risk Zones</div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <div>
            <div className="card-title">📊 Investment Score Comparison</div>
            <div className="card-subtitle">Higher score = Better investment opportunity</div>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <Bar
              data={comparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.04)' } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0a1628',
                    titleFont: { family: 'Space Grotesk', size: 13 },
                    bodyFont: { family: 'Inter', size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Zone Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {zoneList.map((zone, i) => (
          <div
            className="card"
            key={i}
            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
            onClick={() => setSelectedZone(selectedZone === i ? null : i)}
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-800)' }}>
                    {getGradeIcon(zone.recommendation)} {zone.city}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{zone.state}</p>
                </div>
                <span className={`badge ${getGradeColor(zone.recommendation)}`} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
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

              {/* Expanded details */}
              {selectedZone === i && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Investment Score</div>
                      <div className="progress-bar" style={{ marginTop: 6 }}>
                        <div className="progress-fill green" style={{ width: `${Math.min(Math.max(zone.score, 0), 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Risk Level</div>
                      <div className="progress-bar" style={{ marginTop: 6 }}>
                        <div className={`progress-fill ${zone.risk_level === 'Low' ? 'green' : zone.risk_level === 'Medium' ? 'gold' : 'red'}`}
                          style={{ width: `${zone.risk_level === 'Low' ? 25 : zone.risk_level === 'Medium' ? 55 : 85}%` }} />
                      </div>
                    </div>
                  </div>
                  <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                    💡 <strong>AI Insight:</strong> {zone.city} shows {zone.growth_potential > 20 ? 'exceptional' : 'steady'} growth potential
                    with {zone.risk_level.toLowerCase()} risk.
                    {zone.recommendation === 'Strong Buy' ? ' Highly recommended for immediate investment.' :
                     zone.recommendation === 'Buy' ? ' Good candidate for portfolio diversification.' :
                     ' Monitor for better entry points.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {zones?.summary && (
        <div className="card mt-lg">
          <div className="card-body" style={{ textAlign: 'center', padding: 24 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--navy-700)' }}>
              📌 {zones.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentZones;
