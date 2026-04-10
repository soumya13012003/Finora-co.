import { ShieldAlert, AlertTriangle, CheckCircle, ArrowUpRight, TrendingDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

import { EmptyDataState } from '../components/EmptyDataState'

export default function RiskAnalysis({ data, onNavigate }) {
  if (!data || !data.risk_factors || data.risk_factors.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Risk Analysis</h2>
          <p>Comprehensive risk assessment with mitigation strategies and trend monitoring</p>
        </div>
        <EmptyDataState title="No Risk Data Analyzed" message="Upload annual reports that cover potential market risks, supply chain issues, or competitive threats to view risk metrics." onNavigate={onNavigate} />
      </div>
    )
  }
  const { risk_factors, risk_trend, mitigation_suggestions } = data

  const getRiskLevel = (score) => {
    if (score >= 65) return { level: 'high', label: 'High', color: '#EF4444' }
    if (score >= 45) return { level: 'medium', label: 'Medium', color: '#F59E0B' }
    return { level: 'low', label: 'Low', color: '#10B981' }
  }

  const overallRisk = risk_trend[risk_trend.length - 1]?.overall || 32

  return (
    <div>
      <div className="page-header">
        <h2>Risk Analysis</h2>
        <p>Comprehensive risk assessment with mitigation strategies and trend monitoring</p>
      </div>

      {/* Risk Summary Cards */}
      <div className="metrics-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))'}}>
        <div className="metric-card green">
          <div className="metric-card-header">
            <div className="metric-card-icon green"><ShieldAlert /></div>
            <div className="metric-card-change positive">
              <TrendingDown size={12}/> -4.1%
            </div>
          </div>
          <div className="metric-card-value">{overallRisk}/100</div>
          <div className="metric-card-label">Overall Risk Score</div>
          <div className="metric-card-period">Low-Medium Risk</div>
        </div>
        <div className="metric-card red">
          <div className="metric-card-header">
            <div className="metric-card-icon red"><AlertTriangle /></div>
          </div>
          <div className="metric-card-value">{risk_factors.filter(r => r.score >= 65).length}</div>
          <div className="metric-card-label">High Risk Factors</div>
          <div className="metric-card-period">Requires attention</div>
        </div>
        <div className="metric-card amber">
          <div className="metric-card-header">
            <div className="metric-card-icon amber"><AlertTriangle /></div>
          </div>
          <div className="metric-card-value">{risk_factors.filter(r => r.trend === 'rising').length}</div>
          <div className="metric-card-label">Rising Risks</div>
          <div className="metric-card-period">Trending upward</div>
        </div>
        <div className="metric-card green">
          <div className="metric-card-header">
            <div className="metric-card-icon green"><CheckCircle /></div>
          </div>
          <div className="metric-card-value">{risk_factors.filter(r => r.trend === 'declining').length}</div>
          <div className="metric-card-label">Improving Risks</div>
          <div className="metric-card-period">Trending downward</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Risk Trend Over Time */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Risk Trend Analysis</div>
              <div className="chart-card-subtitle">6-month risk factor trajectory</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={risk_trend} margin={{top:5,right:30,left:10,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="month" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={({active,payload,label})=>{
                  if(!active||!payload)return null
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{label}</div>
                      {payload.map((e,i)=>(
                        <div key={i} className="item">
                          <span className="dot" style={{background:e.color}} />
                          <span>{e.name}: {e.value}</span>
                        </div>
                      ))}
                    </div>
                  )
                }} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Line type="monotone" dataKey="overall" stroke="#10B981" strokeWidth={3} name="Overall" dot={false} />
                <Line type="monotone" dataKey="supply_chain" stroke="#EF4444" strokeWidth={2} name="Supply Chain" dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="market" stroke="#F59E0B" strokeWidth={2} name="Market" dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="regulatory" stroke="#3B82F6" strokeWidth={2} name="Regulatory" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Factors List */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Risk Factor Breakdown</div>
              <div className="chart-card-subtitle">Individual risk assessment</div>
            </div>
          </div>
          <div style={{padding:'0 4px'}}>
            {risk_factors.map((risk, i) => {
              const info = getRiskLevel(risk.score)
              return (
                <div key={i} className="risk-item">
                  <div className={`risk-score-circle ${info.level}`}>
                    {risk.score}
                  </div>
                  <div className="risk-info">
                    <div className="risk-name">{risk.name}</div>
                    <div className="risk-desc">{risk.description}</div>
                  </div>
                  <span className={`risk-trend-badge ${risk.trend}`}>
                    {risk.trend === 'rising' ? '↗' : risk.trend === 'declining' ? '↘' : '→'} {risk.trend}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Risk Score Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Risk Score Comparison</div>
              <div className="chart-card-subtitle">Factor-by-factor analysis</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk_factors} layout="vertical" margin={{top:5,right:30,left:100,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{d.name}</div>
                      <div className="item">Score: {d.score}/100</div>
                      <div className="item">Trend: {d.trend}</div>
                      <div className="item">Impact: {d.impact}</div>
                    </div>
                  )
                }} />
                <Bar dataKey="score" radius={[0,6,6,0]} barSize={20}>
                  {risk_factors.map((d, i) => {
                    const info = getRiskLevel(d.score)
                    return <rect key={i} fill={info.color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="section">
        <div className="section-title"><CheckCircle size={20}/> Mitigation Strategies</div>
        <div className="chart-card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Risk Factor</th>
                  <th>Recommended Action</th>
                  <th>Priority</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {mitigation_suggestions.map((m, i) => (
                  <tr key={i}>
                    <td className="value">{m.risk}</td>
                    <td style={{maxWidth:400}}>{m.action}</td>
                    <td>
                      <span className={`tag ${m.priority === 'high' ? 'red' : 'amber'}`}>
                        {m.priority.charAt(0).toUpperCase() + m.priority.slice(1)}
                      </span>
                    </td>
                    <td style={{color:'#94A3B8',fontWeight:500}}>{m.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
