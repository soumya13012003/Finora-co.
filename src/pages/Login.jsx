import { useState } from 'react'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Simulated RBAC login
    onLogin({ name: 'Sarah Anderson', role: 'Senior Analyst', permissions: ['read', 'write', 'upload'] })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh', 
      alignItems: 'center', justifyContent: 'center', background: '#0A0F1C', color: '#F1F5F9'
    }}>
      <div className='ambient-bg' />
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
        padding: 48, width: '100%', maxWidth: 440, zIndex: 10,
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
      }}>
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <img src='/logo.png' className='finora-logo' style={{
            width: 120, height: 'auto', margin: '0 auto 24px', display: 'block'
          }} onError={(e) => {
             e.target.style.display = 'none'
             e.target.nextSibling.style.display = 'block'
          }} />
          <div style={{display: 'none', color: '#D4AF37', fontSize: 24, fontWeight: 700, marginBottom: 12}}>FINORA-CO.</div>
          <h1 style={{fontSize: 28, fontWeight: 800, marginBottom: 8}}>Welcome to Finora</h1>
          <p style={{color: '#94A3B8'}}>Sign in to the AI Analytics Platform</p>
        </div>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          <div>
            <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8}}>Email Address</label>
            <div style={{position: 'relative'}}>
              <Mail size={18} style={{position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B'}} />
              <input type='email' placeholder='Enter your corporate email' value={email} onChange={e => setEmail(e.target.value)} required
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px 12px 42px', borderRadius: 12, color: 'white', outline: 'none'
                }} />
            </div>
          </div>
          <div>
            <label style={{display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8}}>Password</label>
            <div style={{position: 'relative'}}>
              <Lock size={18} style={{position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B'}} />
              <input type='password' placeholder='••••••••' value={password} onChange={e => setPassword(e.target.value)} required
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px 12px 42px', borderRadius: 12, color: 'white', outline: 'none'
                }} />
            </div>
          </div>
          <button type='submit' style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', marginTop: 8, transition: 'transform 0.2s'
          }}>
            Sign In Securely <ArrowRight size={18} />
          </button>
        </form>

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32, color: '#64748B', fontSize: 12}}>
          <ShieldCheck size={14} style={{color: '#10B981'}} />
          <span>Enterprise-grade security enforced</span>
        </div>
      </div>
    </div>
  )
}
