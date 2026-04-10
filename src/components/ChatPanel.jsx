import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const API_BASE = 'http://127.0.0.1:8000/api'

const SUGGESTIONS = [
  "Where should we invest more?",
  "Which region has highest demand?",
  "What is the peak sales period?",
  "Show me the risk assessment",
  "Give me a financial summary",
  "Which city shows highest growth?",
]

export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `## 👋 Welcome to Finora Co. AI Assistant

I'm your intelligent financial analysis companion. I can help you with:

- 📊 **Investment Recommendations** — Where to allocate capital
- 🌍 **Regional Performance** — City & country-level insights
- 📈 **Demand Patterns** — Peak periods & trend forecasts
- ⚠️ **Risk Assessment** — Portfolio risk analysis
- 💰 **Financial Summaries** — Revenue, profit, margins

**Try asking me a question below!**`,
      sources: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const message = text || input.trim()
    if (!message || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversation_id: conversationId })
      })

      if (response.ok) {
        const data = await response.json()
        setConversationId(data.conversation_id)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          sources: data.sources || []
        }])
      } else {
        throw new Error('API error')
      }
    } catch {
      // Use local demo responses
      const demoResponse = getDemoResponse(message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: demoResponse.answer,
        sources: demoResponse.sources || []
      }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className={`chat-overlay ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-ai-avatar">
            <Sparkles />
          </div>
          <div className="chat-header-info">
            <h3>Finora AI</h3>
            <span>Online</span>
          </div>
        </div>
        <button className="chat-close" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="chat-message-avatar">
              {msg.role === 'assistant' ? <Bot size={14}/> : <User size={14}/>}
            </div>
            <div className="chat-message-content">
              <div className="chat-message-bubble">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="chat-sources">
                  {msg.sources.map((src, j) => (
                    <span key={j} className="chat-source-tag">
                      📄 {src.title} ({Math.round(src.relevance * 100)}%)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="chat-message-avatar"><Bot size={14}/></div>
            <div className="chat-message-content">
              <div className="chat-loading">
                <div className="chat-loading-dot" />
                <div className="chat-loading-dot" />
                <div className="chat-loading-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="chat-suggestion" onClick={() => handleSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about investments, trends, risks..."
            rows={1}
            id="chat-input"
          />
          <button 
            className="chat-send-btn" 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            id="chat-send"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  )
}


function getDemoResponse(message) {
  const msg = message.toLowerCase()

  if (msg.includes('invest') || msg.includes('opportunity') || msg.includes('where should')) {
    return {
      answer: `## 📊 Investment Recommendations

Based on our analysis of **47 annual reports** and regional performance data:

### 🏆 Top Investment Zones

1. **South-East Asia** (Score: 92/100)
   - Revenue growth: +23.4% YoY
   - Market penetration: Only 34%
   - Estimated ROI: 34% over 18-24 months

2. **Western India** (Score: 87/100)
   - Tier-2 cities showing 31% demand increase
   - Government manufacturing incentives active
   - ROI estimate: 28% over 12-18 months

3. **Eastern Europe** (Score: 81/100)
   - 18.7% annual growth trajectory
   - EU integration benefits
   - Strong tech talent pool

### ⚠️ Caution Zones
- **Sub-Saharan Africa**: High growth (42%) but elevated risk score (61/100)
- **Latin America**: Currency volatility concerns (risk: 52/100)

### 💡 Key Insight
*Companies investing in South-East Asia have seen an average ROI of 34% over 24 months. Q4 data suggests accelerating demand in this region.*`,
      sources: [
        { title: 'Regional Performance Report 2025', relevance: 0.94 },
        { title: 'Market Analysis Q4 2025', relevance: 0.89 },
        { title: 'Investment Risk Assessment', relevance: 0.85 }
      ]
    }
  }

  if (msg.includes('demand') || msg.includes('peak') || msg.includes('season') || msg.includes('trend')) {
    return {
      answer: `## 📈 Demand Pattern Analysis

### Peak Sales Periods:
| Period | Demand Index | Key Driver | YoY Change |
|--------|-------------|------------|------------|
| **Oct-Dec** | 142 | Festival/Holiday Season | +15.3% |
| **Mar-Apr** | 128 | Fiscal Year-End | +12.1% |
| **Jul-Aug** | 115 | Summer Campaigns | +8.7% |
| **Jan-Feb** | 89 | Post-Holiday Slowdown | +3.2% |

### Product Category Forecast (Next 90 Days):
- 🚀 **Cloud Services**: +34.2% growth — Highest demand
- 📈 **Security Products**: +27.8% growth — Strong momentum  
- 📊 **Enterprise Software**: +18.5% growth — Steady
- ➡️ **Consumer Electronics**: +12.1% — Stable
- 📉 **Hardware Solutions**: -2.3% — Declining

### 💡 Strategic Recommendation
*Current period is optimal for inventory buildup. Historical data shows 89% correlation between Q2 stocking levels and Q4 revenue performance.*`,
      sources: [
        { title: 'Demand Trend Analysis 2024-2025', relevance: 0.96 },
        { title: 'Seasonal Index Report', relevance: 0.91 },
      ]
    }
  }

  if (msg.includes('region') || msg.includes('city') || msg.includes('highest') || msg.includes('location') || msg.includes('best')) {
    return {
      answer: `## 🌍 Regional Performance Summary

### Top Regions by Revenue:
| Region | Revenue | Growth | Risk |
|--------|---------|--------|------|
| 🇺🇸 North America | $89.2M | +14.2% | Low (22) |
| 🇮🇳 South Asia | $54.8M | +22.1% | Med (38) |
| 🇪🇺 Western Europe | $48.3M | +6.8% | Low (18) |
| 🇨🇳 East Asia | $41.2M | +9.5% | Med (35) |
| 🇧🇷 Latin America | $28.7M | +17.3% | High (52) |

### Fastest Growing Cities:
1. 🥇 **Lagos** — +42.1% growth (emerging market leader)
2. 🥈 **Singapore** — +33.1% (highest demand density)
3. 🥉 **Mumbai** — +28.3% ($18.4M revenue)

### 📌 Key Finding
*Singapore and Mumbai are the fastest-growing established markets. Lagos shows explosive growth from a smaller base — watch for breakout potential.*`,
      sources: [
        { title: 'Regional Sales Report 2025', relevance: 0.95 },
        { title: 'City-Level Performance Data', relevance: 0.92 },
      ]
    }
  }

  if (msg.includes('risk') || msg.includes('danger') || msg.includes('warning')) {
    return {
      answer: `## ⚠️ Risk Assessment Summary

### Current Risk Indicators:
| Risk Factor | Score | Trend | Impact |
|-------------|-------|-------|--------|
| Market Competition | 72/100 | 📈 Rising | High |
| Supply Chain | 67/100 | 📈 Rising | High |
| Technology Disruption | 58/100 | 📈 Rising | Medium |
| Currency Volatility | 54/100 | ➡️ Stable | Medium |
| Talent Retention | 44/100 | ➡️ Stable | Medium |
| Regulatory Changes | 41/100 | 📉 Declining | Medium |

### Aggregate Risk Score: **32/100** (Low-Medium) ✅

### Top Mitigation Actions:
1. Diversify suppliers across 3+ regions *(Priority: High)*
2. Accelerate product innovation by 30% *(Priority: High)*
3. Invest 15% more in R&D and AI capabilities *(Priority: High)*
4. Implement dynamic currency hedging *(Priority: Medium)*

### 💡 Assessment
*Overall portfolio risk has improved 4.1 points. While supply chain and competition risks are elevated, strong diversification provides resilience.*`,
      sources: [
        { title: 'Risk Assessment Q1 2026', relevance: 0.97 },
        { title: 'Supply Chain Analysis', relevance: 0.88 },
      ]
    }
  }

  if (msg.includes('revenue') || msg.includes('profit') || msg.includes('financial') || msg.includes('summary')) {
    return {
      answer: `## 💰 Financial Summary — FY 2025

### Key Metrics:
| Metric | Value | YoY Change |
|--------|-------|------------|
| **Total Revenue** | $284.5M | +12.5% |
| **Net Profit** | $42.7M | +8.3% |
| **Gross Margin** | 38.2% | +1.4pp |
| **EBITDA** | $68.3M | +15.1% |
| **Free Cash Flow** | $31.2M | +22.4% |

### Revenue by Segment:
- 🔵 Enterprise Solutions: $142.3M (50%)
- 🟢 Consumer Products: $85.4M (30%)
- 🟡 Services & Support: $42.6M (15%)
- 🟠 Licensing: $14.2M (5%)

### Growth Trajectory:
Revenue has grown from $198M (2021) to $284.5M (2025) — a **43.7% increase** over 4 years with consistently improving margins.

### 💡 Key Insight
*Free cash flow growth of 22.4% significantly outpaces revenue growth, indicating improving capital efficiency and strong positioning for strategic growth.*`,
      sources: [
        { title: 'Annual Financial Report 2025', relevance: 0.98 },
        { title: 'Profitability Analysis', relevance: 0.93 },
      ]
    }
  }

  // Default response
  return {
    answer: `## 🤖 Finora Co. AI Assistant

I can help you analyze financial data from **47 annual reports** across **23 active regions**. Here's what I can do:

### Available Analysis:
- 📊 **"Where should we invest?"** — Investment recommendations
- 🌍 **"Which region has highest demand?"** — Regional insights
- 📈 **"What is the peak sales period?"** — Demand patterns
- ⚠️ **"Show me risk indicators"** — Risk assessment
- 💰 **"Financial summary"** — Revenue & profit overview

### Quick Stats:
| Metric | Value |
|--------|-------|
| Reports Analyzed | 47 |
| Active Regions | 23 |
| Total Revenue | $284.5M |
| Growth Rate | +12.5% YoY |
| Investment Score | 78/100 |

*Try asking a specific question for detailed analysis!*`,
    sources: []
  }
}
