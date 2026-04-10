import { Globe, MapPin, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts'

const formatCurrency = (val) => {
  if (val >= 1e6) return `$${(val/1e6).toFixed(1)}M`
  return `$${val.toLocaleString()}`
}

import { EmptyDataState } from '../components/EmptyDataState'

export default function RegionalAnalysis({ data, onNavigate }) {
  if (!data || !data.regions || data.regions.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Regional Analysis</h2>
          <p>Location-based performance metrics and strategic insights across global markets</p>
        </div>
        <EmptyDataState title="No Regional Data Available" message="Upload annual reports containing regional sales data or locations to unlock this dashboard." onNavigate={onNavigate} />
      </div>
    )
  }
  const { regions, top_cities, country_performance } = data

  const radarData = regions.map(r => ({
    name: r.name.split(' ')[0],
    revenue: Math.round(r.revenue / 1e6),
    growth: r.growth,
    market_share: r.market_share,
    risk: 100 - r.risk_score,
  }))

  const scatterData = regions.map(r => ({
    name: r.name,
    x: r.growth,
    y: r.revenue / 1e6,
    z: r.market_share,
    risk: r.risk_score,
    color: r.color,
  }))

  return (
    <div>
      <div className="page-header">
        <h2>Regional Analysis</h2>
        <p>Location-based performance metrics and strategic insights across global markets</p>
      </div>

      {/* Region Cards */}
      <div className="section">
        <div className="section-title"><Globe size={20}/> Regional Performance</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          {regions.map((r, i) => (
            <div key={i} className="metric-card" style={{borderTop:`3px solid ${r.color}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:700,color:'#F1F5F9'}}>{r.name}</div>
                <span className={`tag ${r.risk_score < 30 ? 'green' : r.risk_score < 50 ? 'amber' : 'red'}`}>
                  Risk: {r.risk_score}
                </span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <div style={{fontSize:11,color:'#64748B'}}>Revenue</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#F1F5F9'}}>{formatCurrency(r.revenue)}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#64748B'}}>Growth</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#10B981'}}>+{r.growth}%</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#64748B'}}>Market Share</div>
                  <div style={{fontSize:14,fontWeight:600,color:'#94A3B8'}}>{r.market_share}%</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#64748B'}}>Share Bar</div>
                  <div className="score-bar" style={{marginTop:6}}>
                    <div className="score-bar-fill blue" style={{width:`${r.market_share * 3}%`}} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {/* Growth vs Revenue Scatter */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Growth vs Revenue Matrix</div>
              <div className="chart-card-subtitle">Bubble size = market share</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{top:20,right:30,bottom:20,left:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="x" type="number" name="Growth %" tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} label={{value:'Growth %',position:'bottom',fill:'#64748B',fontSize:11}} />
                <YAxis dataKey="y" type="number" name="Revenue" tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} label={{value:'Revenue ($M)',angle:-90,position:'insideLeft',fill:'#64748B',fontSize:11}} />
                <ZAxis dataKey="z" range={[200, 1200]} />
                <Tooltip content={({active, payload}) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{d.name}</div>
                      <div className="item">Revenue: ${d.y.toFixed(1)}M</div>
                      <div className="item">Growth: +{d.x}%</div>
                      <div className="item">Market Share: {d.z}%</div>
                    </div>
                  )
                }} />
                <Scatter data={scatterData}>
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Multi-Dimensional Analysis</div>
              <div className="chart-card-subtitle">Top 4 regions comparison</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData.slice(0, 4)}>
                <PolarGrid stroke="rgba(99,130,191,0.15)" />
                <PolarAngleAxis dataKey="name" tick={{fill:'#94A3B8',fontSize:11}} />
                <PolarRadiusAxis tick={{fill:'#64748B',fontSize:10}} />
                <Radar name="Revenue" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Growth" dataKey="growth" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="Stability" dataKey="risk" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Performance Bar */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Country Performance</div>
              <div className="chart-card-subtitle">Revenue and investment score by country</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={country_performance} margin={{top:5,right:30,left:20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="country" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip content={({active,payload,label}) => {
                  if (!active || !payload) return null
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{label}</div>
                      {payload.map((e,i) => (
                        <div key={i} className="item">
                          <span className="dot" style={{background:e.color}} />
                          <span>{e.name}: {e.name === 'Revenue' ? `$${(e.value/1e6).toFixed(1)}M` : e.value}</span>
                        </div>
                      ))}
                    </div>
                  )
                }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4,4,0,0]} />
                <Bar dataKey="investment_score" name="Invest Score" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Cities Table */}
      <div className="section">
        <div className="section-title"><MapPin size={20}/> Top Performing Cities</div>
        <div className="chart-card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                  <th>Demand Index</th>
                </tr>
              </thead>
              <tbody>
                {top_cities.map((city, i) => (
                  <tr key={i}>
                    <td style={{fontWeight:700,color: i < 3 ? '#F59E0B' : '#64748B'}}>{i < 3 ? '🏆' : ''} #{i+1}</td>
                    <td className="value">{city.city}</td>
                    <td>{city.country}</td>
                    <td className="value">{formatCurrency(city.revenue)}</td>
                    <td className="positive" style={{fontWeight:600}}>+{city.growth}%</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="score-bar" style={{width:80}}>
                          <div className={`score-bar-fill ${city.demand_index >= 90 ? 'blue' : 'green'}`} 
                               style={{width: `${city.demand_index}%`}} />
                        </div>
                        <span style={{fontSize:12,fontWeight:600}}>{city.demand_index}/100</span>
                      </div>
                    </td>
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
