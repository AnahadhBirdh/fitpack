import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', username: '', goal_calories: 2000 })
  const { signIn, signUp } = useAuth()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
        toast.success('Welcome back!')
      } else {
        if (!form.username.trim()) { toast.error('Username required'); setLoading(false); return }
        await signUp(form.email, form.password, form.username, parseInt(form.goal_calories))
        toast.success('Account created! Check email to verify.')
      }
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at top, #1a2200 0%, #0a0a0a 60%)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3.5rem', letterSpacing: '0.1em', color: 'var(--lime)', lineHeight: 1 }}>FITPACK</div>
          <div style={{ color: 'var(--gray-400)', marginTop: '8px', fontSize: '15px' }}>Burn together. Stay accountable.</div>
        </div>
        <div className="card">
          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
            <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
          </div>
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="label">Username</label>
                <input placeholder="e.g. beastmode_raj" value={form.username} onChange={e => set('username', e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="label">Daily Calorie Goal</label>
                <input type="number" placeholder="2000" value={form.goal_calories} onChange={e => set('goal_calories', e.target.value)} />
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
