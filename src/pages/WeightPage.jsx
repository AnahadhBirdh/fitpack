import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

export default function WeightPage() {
  const { profile, refreshProfile } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => { if (profile) fetchLogs() }, [profile])

  const fetchLogs = async () => {
    const { data } = await supabase.from('weight_logs').select('*').eq('user_id', profile.id).order('date', { ascending: false }).limit(30)
    setLogs(data || [])
    setLoading(false)
  }

  const todayLogged = logs.find(l => l.date === today)

  const handleLog = async (e) => {
    e.preventDefault()
    if (!weight || isNaN(weight)) { toast.error('Enter a valid weight'); return }
    setSubmitting(true)
    try {
      if (todayLogged) {
        await supabase.from('weight_logs').update({ weight_kg: parseFloat(weight), notes }).eq('id', todayLogged.id)
      } else {
        await supabase.from('weight_logs').insert({ user_id: profile.id, date: today, weight_kg: parseFloat(weight), notes, created_at: new Date().toISOString() })
        await supabase.from('profiles').update({ total_points: (profile.total_points || 0) + 2 }).eq('id', profile.id)
        refreshProfile()
      }
      toast.success('Weight logged! +2 points')
      setWeight(''); setNotes('')
      fetchLogs()
    } catch (err) {
      toast.error(err.message)
    }
    setSubmitting(false)
  }

  const chartLogs = [...logs].reverse().slice(-14)
  const weights = chartLogs.map(l => l.weight_kg)
  const minW = weights.length ? Math.min(...weights) - 2 : 60
  const maxW = weights.length ? Math.max(...weights) + 2 : 90

  const weightChange = logs.length >= 2 ? (logs[0].weight_kg - logs[logs.length - 1].weight_kg).toFixed(1) : null

  return (
    <div className="page fade-in">
      <h2 style={{ marginBottom: 28 }}>WEIGHT TRACKER</h2>

      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card-sm">
            <div className="label">Current</div>
            <div className="stat-big">{logs[0]?.weight_kg}</div>
            <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>kg</div>
          </div>
          <div className="card-sm">
            <div className="label">Starting</div>
            <div className="stat-big" style={{ color: 'var(--white)' }}>{logs[logs.length - 1]?.weight_kg}</div>
            <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>kg</div>
          </div>
          <div className="card-sm">
            <div className="label">Total Change</div>
            <div className="stat-big" style={{ color: weightChange < 0 ? 'var(--green)' : weightChange > 0 ? 'var(--red)' : 'var(--white)' }}>
              {weightChange !== null ? (weightChange > 0 ? '+' : '') + weightChange : '--'}
            </div>
            <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>kg</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartLogs.length > 1 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>PROGRESS (14 DAYS)</h3>
          <div style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {chartLogs.map((log, i) => {
              const pct = ((log.weight_kg - minW) / (maxW - minW)) * 100
              const isLatest = i === chartLogs.length - 1
              return (
                <div key={log.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {isLatest && <div style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700 }}>{log.weight_kg}</div>}
                  <div style={{ width: '100%', height: `${Math.max(10, pct)}%`, background: isLatest ? 'var(--lime)' : 'var(--gray-600)', borderRadius: '4px 4px 0 0', minHeight: 8, transition: 'height 0.3s' }} />
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', writingMode: 'vertical-lr', transform: 'rotate(180deg)', marginTop: 2 }}>
                    {format(new Date(log.date), 'MM/dd')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Log weight form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>{todayLogged ? 'UPDATE TODAY\'S WEIGHT' : 'LOG TODAY\'S WEIGHT'}</h3>
        {todayLogged && (
          <div className="badge badge-green" style={{ marginBottom: 12 }}>Already logged: {todayLogged.weight_kg} kg</div>
        )}
        <form onSubmit={handleLog}>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Weight (kg)</label>
              <input type="number" step="0.1" placeholder="e.g. 72.5" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Notes (optional)</label>
              <input placeholder="Feeling lighter!" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : todayLogged ? 'Update Weight' : 'Log Weight (+2 pts)'}
          </button>
        </form>
      </div>

      {/* Log history */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>HISTORY</h3>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📏</div>
            <h3>No logs yet</h3>
          </div>
        ) : (
          logs.map((log, i) => {
            const prev = logs[i + 1]
            const diff = prev ? (log.weight_kg - prev.weight_kg).toFixed(1) : null
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--gray-800)' }}>
                <div style={{ color: 'var(--gray-400)', fontSize: 13, minWidth: 80 }}>{format(new Date(log.date), 'MMM d, yyyy')}</div>
                <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Bebas Neue', color: 'var(--lime)' }}>{log.weight_kg} kg</div>
                {diff !== null && (
                  <div style={{ fontSize: 13, color: parseFloat(diff) < 0 ? 'var(--green)' : 'var(--red)' }}>
                    {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                  </div>
                )}
                {log.notes && <div style={{ flex: 1, fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>"{log.notes}"</div>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
