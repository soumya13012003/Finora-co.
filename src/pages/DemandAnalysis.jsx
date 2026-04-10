import { TrendingUp, Calendar, Package, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const formatCurrency = (val) => {
  if (val >= 1e6) return `$${(val/1e6).toFixed(1)}M`
  return `$${val.toLocaleString()}`
}

import { EmptyDataState } from '../components/EmptyDataState'

export default function DemandAnalysis({ data, onNavigate }) {
  if (!data || !data.peak_periods || data.peak_periods.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Demand Analysis</h2>
          <p>Short-term demand patterns, peak periods, and product category intelligence</p>
        </div>
        <EmptyDataState title="No Demand Data Extracts" message="Upload annual reports that discuss seasonality, product demand, and volume trends to analyze demand periods." onNavigate={onNavigate} />
      </div>
    )
  }
  const { monthly_demand, peak_periods, product_demand, seasonal_index } = data

  const forecastIcons = { up: <ArrowUpRight size={14}/>, down: <ArrowDownRight size={14}/>, stable: <Minus size={14}/> }
  const forecastColors = { up: 'green', down: 'red', stable: 'amber' }

  return (
    <div>
      <div className="page-header">
        <h2>Demand Analysis</h2>
        <p>Short-term demand patterns, peak periods, and product category intelligence</p>
      </div>

      {/* Peak Periods */}
      <div className="section">
        <div className="section-title"><Calendar size={20}/> Peak Demand Periods</div>
        <div className="metrics-grid">
          {peak_periods.map((p, i) => (
            <div key={i} className={`metric-card ${i === 0 ? 'blue' : i === 1 ? 'green' : i === 2 ? 'amber' : 'red'}`}>
              <div className="metric-card-header">
                <div className={`metric-card-icon ${i === 0 ? 'blue' : i === 1 ? 'green' : i === 2 ? 'amber' : 'red'}`}>
                  <Calendar />
                </div>
                <div className={`metric-card-change ${p.yoy_change > 10 ? 'positive' : 'positive'}`}>
                  <ArrowUpRight size={12}/>
                  {p.yoy_change}% YoY
                </div>
              </div>
              <div className="metric-card-value">{p.demand_index}</div>
              <div className="metric-card-label">{p.period}</div>
              <div className="metric-card-period">{p.driver}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        {/* Demand Trends by Category */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Demand Trends by Product Category</div>
              <div className="chart-card-subtitle">Monthly demand index across categories</div>
            </div>
          </div>
          <div className="chart-body tall">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_demand} margin={{top:5,right:30,left:10,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="month" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} />
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
                <Legend wrapperStyle={{fontSize:12,color:'#94A3B8'}} />
                <Line type="monotone" dataKey="electronics" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Electronics" />
                <Line type="monotone" dataKey="fmcg" stroke="#10B981" strokeWidth={2.5} dot={false} name="FMCG" />
                <Line type="monotone" dataKey="industrial" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Industrial" />
                <Line type="monotone" dataKey="software" stroke="#8B5CF6" strokeWidth={2.5} dot={false} name="Software" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Index */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Seasonal Demand Index</div>
              <div className="chart-card-subtitle">Monthly seasonality pattern (100 = average)</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonal_index} margin={{top:5,right:30,left:10,bottom:5}}>
                <defs>
                  <linearGradient id="seasonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" />
                <XAxis dataKey="month" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} domain={[70,150]} />
                <Tooltip content={({active,payload,label})=>{
                  if(!active||!payload?.[0])return null
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{label}</div>
                      <div className="item">Index: {payload[0].value}</div>
                      <div className="item" style={{color: payload[0].value >= 100 ? '#10B981':'#EF4444'}}>
                        {payload[0].value >= 100 ? 'Above Average' : 'Below Average'}
                      </div>
                    </div>
                  )
                }} />
                <Area type="monotone" dataKey="index" stroke="#8B5CF6" strokeWidth={2} fill="url(#seasonGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Demand Bars */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Product Category Revenue</div>
              <div className="chart-card-subtitle">Revenue distribution by product</div>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={product_demand} layout="vertical" margin={{top:5,right:30,left:80,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,191,0.08)" horizontal={false} />
                <XAxis type="number" tick={{fill:'#64748B',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1e6}M`} />
                <YAxis type="category" dataKey="product" tick={{fill:'#94A3B8',fontSize:11}} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="custom-tooltip">
                      <div className="label">{d.product}</div>
                      <div className="item">Revenue: {formatCurrency(d.revenue)}</div>
                      <div className="item">Demand Index: {d.demand}</div>
                      <div className="item" style={{color: d.growth > 0 ? '#10B981' : '#EF4444'}}>Growth: {d.growth > 0 ? '+' : ''}{d.growth}%</div>
                    </div>
                  )
                }} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0,6,6,0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Demand Table */}
      <div className="section">
        <div className="section-title"><Package size={20}/> Product Category Details</div>
        <div className="chart-card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Demand Index</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                  <th>Forecast</th>
                </tr>
              </thead>
              <tbody>
                {product_demand.map((p, i) => (
                  <tr key={i}>
                    <td className="value">{p.product}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="score-bar" style={{width:80}}>
                          <div className={`score-bar-fill ${p.demand >= 90 ? 'blue' : p.demand >= 75 ? 'green' : 'amber'}`}
                               style={{width:`${p.demand}%`}} />
                        </div>
                        <span style={{fontSize:12,fontWeight:600}}>{p.demand}</span>
                      </div>
                    </td>
                    <td className="value">{formatCurrency(p.revenue)}</td>
                    <td className={p.growth >= 0 ? 'positive' : 'negative'} style={{fontWeight:600}}>
                      {p.growth >= 0 ? '+' : ''}{p.growth}%
                    </td>
                    <td>
                      <span className={`tag ${forecastColors[p.forecast]}`} style={{display:'inline-flex',alignItems:'center',gap:4}}>
                        {forecastIcons[p.forecast]}
                        {p.forecast === 'up' ? 'Rising' : p.forecast === 'down' ? 'Declining' : 'Stable'}
                      </span>
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
