import { useState } from 'react'
import { 
  DollarSign, TrendingUp, FileText, Globe, Target, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Rocket, AlertTriangle, Lightbulb,
  Upload
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const formatCurrency = (val) => {
  if (!val || val === 0) return '$0'
  if (val >= 1e9) return `$${(val/1e9).toFixed(1)}B`
  if (val >= 1e6) return `$${(val/1e6).toFixed(1)}M`
  if (val >= 1e3) return `$${(val/1e3).toFixed(0)}K`
  return `$${val}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="item">
          <span className="dot" style={{ background: entry.color }} />
          <span>{entry.name}: {typeof entry.value === 'number' && entry.value > 1 ? `$${entry.value.toFixed(1)}M` : entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ data, onNavigate }) {
  const [revenueView, setRevenueView] = useState('monthly')
  const { overview, revenue, regional } = data

  const hasData = overview.source !== 'no_data' && overview.source !== 'offline'
  const hasRevenueData = revenue.monthly && revenue.monthly.length > 0
  const hasRegionalData = regional.regions && regional.regions.length > 0

  const metrics = [
    { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, color: 'blue', format: formatCurrency },
    { key: 'net_profit', label: 'Net Profit', icon: TrendingUp, color: 'green', format: formatCurrency },
    { key: 'reports_analyzed', label: 'Reports Analyzed', icon: FileText, color: 'purple', format: (v) => v },
    { key: 'active_regions', label: 'Active Regions', icon: Globe, color: 'cyan', format: (v) => v },
    { key: 'investment_score', label: 'Investment Score', icon: Target, color: 'amber', format: (v) => `${v}/100` },
    { key: 'risk_index', label: 'Risk Index', icon: ShieldCheck, color: 'red', format: (v) => `${v}/100` },
  ]

  const alertIcons = {
    opportunity: <Rocket size={16}/>,
    risk: <AlertTriangle size={16}/>,
    insight: <Lightbulb size={16}/>,
  }

  const revenueData = revenueView === 'monthly' ? revenue.monthly 
    : revenueView === 'quarterly' ? revenue.quarterly 
    : revenue.yearly

  const revenueXKey = revenueView === 'monthly' ? 'month' 
    : revenueView === 'quarterly' ? 'quarter' 
    : 'year'

  const regionPieData = hasRegionalData 
    ? regional.regions.map(r => ({
        name: r.name,
        value: r.mentions || (r.revenue / 1e6) || r.market_share || 1,
        color: r.color,
        growth: r.growth || 0,
        mentions: r.mentions || 0,
      }))
    : []

  const reportCount = overview.metrics?.reports_analyzed?.value || 0

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>
          {reportCount > 0
            ? `Financial intelligence extracted from ${reportCount} uploaded report${reportCount > 1 ? 's' : ''}`
            : 'Upload annual report PDFs to see extracted financial insights here'}
        </p>
      </div>

      {/* Alerts */}
      {overview.alerts && overview.alerts.length > 0 && (
        <div className="alerts-bar">
          {overview.alerts.map((alert, i) => (
            <div key={i} className={`alert-item ${alert.type}`}>
              {alertIcons[alert.type]}
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => {
          const mdata = overview.metrics[m.key]
          if (!mdata) return null
          const isPositive = mdata.change > 0
          const isRisk = m.key === 'risk_index'
          const showChange = mdata.change !== 0
          return (
            <div key={m.key} className={`metric-card ${m.color}`} id={`metric-${m.key}`}>
              <div className="metric-card-header">
                <div className={`metric-card-icon ${m.color}`}>
                  <m.icon />
                </div>
                {showChange && (
                  <div className={`metric-card-change ${isRisk ? (!isPositive ? 'positive' : 'negative') : (isPositive ? 'positive' : 'negative')}`}>
                    {isPositive ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {Math.abs(mdata.change)}%
                  </div>
                )}
              </div>
              <div className="metric-card-value">{m.format(mdata.value)}</div>
              <div className="metric-card-label">{m.label}</div>
              <div className="metric-card-period">{mdata.period}</div>
            </div>
          )
        })}
      </div>

      {/* Empty state prompt */}
      {!hasData && (
        <div className="chart-card" style={{textAlign:'center', padding:'48px 24px', marginBottom: 24}}>
          <Upload size={48} style={{color:'#3B82F6', marginBottom: 16}} />
          <h3 style={{fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 8}}>
            No Reports Uploaded Yet
          </h3>
          <p style={{fontSize: 14, color: '#94A3B8', maxWidth: 480, margin: '0 auto 20px'}}>
            Upload your annual report PDFs to see real financial data, regional insights, 
            demand trends, and investment opportunities extracted from your documents.
          </p>
          <button 
            className="chat-toggle-btn" 
            onClick={() => onNavigate && onNavigate('reports')}
            style={{margin: '0 auto'}}
          >
            <Upload size={16}/>
            <span>Go to Reports & Upload</span>
          </button>
        </div>
      )}

      {/* Charts — only show when data exists */}
      {(hasRevenueData || hasRegionalData) && (
        <div className="charts-grid">
          {/* Revenue Chart */}
          {hasRevenueData && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Revenue & Profit by Report</div>
                  <div className="chart-card-subtitle">Financial data extracted from uploaded PDFs</div>
                </div>
                {(revenue.quarterly?.length > 0 || revenue.yearly?.length > 0) && (
                  <div className="chart-tabs">
                    {['monthly', 'quarterly', 'yearly'].map(v => (
                      <button key={v} className={`chart-tab ${revenueView === v ? 'active' : ''}`} onClick={() => setRevenueView(v)}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{top:5,right:30,left:10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                    <XAxis dataKey={revenueXKey} tick={{fill:'#94A3B8',fontSize:10}} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($M)" radius={[4,4,0,0]} />
                    <Bar dataKey="profit" fill="#10B981" name="Profit ($M)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Regional Distribution */}
          {hasRegionalData && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Regions Detected</div>
                  <div className="chart-card-subtitle">Regions mentioned in uploaded reports</div>
                </div>
              </div>
              <div className="chart-body" style={{display:'flex', alignItems: 'center'}}>
                <div style={{width: '50%', height: '100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionPieData}
                        cx="50%" cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        dataKey="value"
                        stroke="rgba(10,15,28,0.5)"
                        strokeWidth={2}
                      >
                        {regionPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        const d = payload[0].payload
                        return (
                          <div className="custom-tooltip">
                            <div className="label">{d.name}</div>
                            <div className="item"><span>{d.mentions ? `${d.mentions} mentions` : `$${d.value.toFixed(1)}M`}</span></div>
                          </div>
                        )
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{width: '50%', padding: '0 16px'}}>
                  {regionPieData.slice(0,6).map((r, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{width:10,height:10,borderRadius:'50%',background:r.color,flexShrink:0}} />
                      <span style={{flex:1,fontSize:13,color:'#94A3B8'}}>{r.name}</span>
                      <span style={{fontSize:13,fontWeight:600,color:'#F1F5F9'}}>
                        {r.mentions ? `${r.mentions}×` : `$${r.value.toFixed(0)}M`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports Table */}
          {overview.recent_reports && overview.recent_reports.length > 0 && (
            <div className="chart-card full-width">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Uploaded Reports</div>
                  <div className="chart-card-subtitle">Reports analyzed by the system</div>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Report</th>
                      <th>Company</th>
                      <th>Date</th>
                      <th>Pages</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recent_reports.map((report, i) => (
                      <tr key={report.id || i}>
                        <td style={{fontWeight:700,color:'#8B5CF6'}}>#{i+1}</td>
                        <td className="value">{report.name || report.filename}</td>
                        <td>{report.company || '—'}</td>
                        <td style={{color:'#94A3B8'}}>{report.date}</td>
                        <td style={{fontWeight:600}}>{report.pages}</td>
                        <td>
                          <span className="tag green">{report.status || 'analyzed'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
