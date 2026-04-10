import { Target, TrendingUp, Shield, Clock } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts'

import { EmptyDataState } from '../components/EmptyDataState'

export default function InvestmentZones({ data, onNavigate }) {
  if (!data || !data.opportunities || data.opportunities.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Investment Opportunity Zones</h2>
          <p>AI-identified high-potential investment regions with risk-adjusted ROI projections</p>
        </div>
        <EmptyDataState title="No Investment Opportunities Found" message="Upload annual reports that mention regional expansion, projected ROIs, or new market entries to generate investment insights." onNavigate={onNavigate} />
      </div>
    )
  }
  const { opportunities, risk_matrix, roi_projections } = data

  const getScoreColor = (score) => {
    if (score >= 85) return '#3B82F6'
    if (score >= 75) return '#10B981'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getRiskColor = (level) => {
    if (level === 'Low') return 'green'
    if (level === 'Medium') return 'amber'
    if (level === 'Medium-High') return 'amber'
    return 'red'
  }

  return (
    <div>
      <div className="page-header">
        <h2>Investment Opportunity Zones</h2>
        <p>AI-identified high-potential investment regions with risk-adjusted ROI projections</p>
      </div>

      {/* Opportunity Cards */}
      <div className="section">
        <div className="section-title"><Target size={20}/> Top Opportunities</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16}}>
          {opportunities.map((opp, i) => (
            <div key={i} className="investment-card">
              <div className="investment-header">
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:'#F1F5F9',marginBottom:4}}>{opp.region}</div>
                  <span className={`tag ${getRiskColor(opp.risk_level)}`}>
                    <Shield size={10}/> {opp.risk_level} Risk
                  </span>
                </div>
                <div className="investment-score" style={{background: getScoreColor(opp.score)}}>
                  {opp.score}
                </div>
              </div>

              <div className="investment-details">
                <div className="investment-detail">
                  <span className="investment-detail-label">Growth Potential</span>
                  <span className="investment-detail-value" style={{color:'#10B981'}}>+{opp.growth_potential}%</span>
                </div>
                <div className="investment-detail">
                  <span className="investment-detail-label">Est. ROI</span>
                  <span className="investment-detail-value" style={{color:'#3B82F6'}}>{opp.roi_estimate}%</span>
                </div>
                <div className="investment-detail">
                  <span className="investment-detail-label">Market Penetration</span>
                  <span className="investment-detail-value">{opp.market_penetration}%</span>
                </div>
                <div className="investment-detail">
                  <span className="investment-detail-label">Timeline</span>
                  <span className="investment-detail-value">{opp.timeline}</span>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{fontSize:11,color:'#64748B',marginBottom:6}}>Market Penetration</div>
                <div className="score-bar">
                  <div className="score-bar-fill blue" style={{width:`${opp.market_penetration}%`}} />
                </div>
              </div>

              <div className="investment-factors">
                {opp.key_factors.map((f, j) => (
                  <span key={j} className="tag blue" style={{fontSize:10}}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {/* ROI Projections */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">ROI Projections</div>
              <div className="chart-card-subtitle">Conservative / Moderate / Aggressive scenarios</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roi_projections} margin={{top:5,right:30,left:10,bottom:5}}>
                <defs>
                  <linearGradient id="aggGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="quarter" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip content={({active,payload,label})=>{
                  if(!active||!payload)return null
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{label}</div>
                      {payload.map((e,i)=>(
                        <div key={i} className="item">
                          <span className="dot" style={{background:e.color}} />
                          <span>{e.name}: {e.value}%</span>
                        </div>
                      ))}
                    </div>
                  )
                }} />
                <Legend wrapperStyle={{fontSize:12}} />
                <Area type="monotone" dataKey="aggressive" stroke="#EF4444" fill="url(#aggGrad)" strokeWidth={2} name="Aggressive" />
                <Area type="monotone" dataKey="moderate" stroke="#3B82F6" fill="url(#modGrad)" strokeWidth={2} name="Moderate" />
                <Area type="monotone" dataKey="conservative" stroke="#10B981" fill="url(#conGrad)" strokeWidth={2} name="Conservative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Risk Matrix</div>
              <div className="chart-card-subtitle">Probability vs Impact analysis</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{top:20,right:30,bottom:20,left:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="probability" type="number" domain={[0,1]} tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false}
                  label={{value:'Probability',position:'bottom',fill:'#64748B',fontSize:11}} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
                <YAxis dataKey="impact" type="number" domain={[0,1]} tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false}
                  label={{value:'Impact',angle:-90,position:'insideLeft',fill:'#64748B',fontSize:11}} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
                <ZAxis dataKey="score" range={[200, 600]} />
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{d.factor}</div>
                      <div className="item">Score: {d.score}/100</div>
                      <div className="item">Probability: {(d.probability*100).toFixed(0)}%</div>
                      <div className="item">Impact: {(d.impact*100).toFixed(0)}%</div>
                      <div className="item">Trend: {d.trend}</div>
                    </div>
                  )
                }} />
                <Scatter data={risk_matrix}>
                  {risk_matrix.map((d, i) => (
                    <Cell key={i} fill={d.score >= 65 ? '#EF4444' : d.score >= 45 ? '#F59E0B' : '#10B981'} fillOpacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Opportunity Comparison Table */}
      <div className="section">
        <div className="section-title"><TrendingUp size={20}/> Opportunity Comparison</div>
        <div className="chart-card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Score</th>
                  <th>Growth</th>
                  <th>ROI Est.</th>
                  <th>Penetration</th>
                  <th>Risk</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o, i) => (
                  <tr key={i}>
                    <td className="value">{o.region}</td>
                    <td>
                      <span style={{
                        display:'inline-flex',alignItems:'center',justifyContent:'center',
                        width:36,height:36,borderRadius:'50%',fontWeight:700,fontSize:13,
                        color:'white',background:getScoreColor(o.score)
                      }}>{o.score}</span>
                    </td>
                    <td className="positive" style={{fontWeight:600}}>+{o.growth_potential}%</td>
                    <td style={{fontWeight:600,color:'#3B82F6'}}>{o.roi_estimate}%</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="score-bar" style={{width:60}}>
                          <div className="score-bar-fill blue" style={{width:`${o.market_penetration}%`}} />
                        </div>
                        <span style={{fontSize:12}}>{o.market_penetration}%</span>
                      </div>
                    </td>
                    <td><span className={`tag ${getRiskColor(o.risk_level)}`}>{o.risk_level}</span></td>
                    <td style={{color:'#94A3B8'}}><Clock size={12} style={{marginRight:4}}/>{o.timeline}</td>
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
