import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, signOut, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ goal_calories: profile?.goal_calories || 2000 })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ goal_calories: parseInt(form.goal_calories) }).eq('id', profile.id)
    refreshProfile()
    setEditing(false)
    setSaving(false)
    toast.success('Profile updated!')
  }

  const initials = (profile?.username || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="page fade-in">
      <h2 style={{ marginBottom: 28 }}>PROFILE</h2>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 26 }}>{initials}</div>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', letterSpacing: '0.05em' }}>{profile?.username}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>{profile?.email}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
            <span className="badge badge-lime">🔥 {profile?.streak || 0} day streak</span>
            <span className="badge badge-gray">⭐ {profile?.total_points || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card-sm">
          <div className="label">Daily Calorie Goal</div>
          {editing ? (
            <input type="number" value={form.goal_calories} onChange={e => setForm(f => ({ ...f, goal_calories: e.target.value }))} style={{ marginTop: 8 }} />
          ) : (
            <div className="stat-big">{profile?.goal_calories || 2000}</div>
          )}
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>calories / day</div>
        </div>
        <div className="card-sm">
          <div className="label">Penalty Balance</div>
          <div className="stat-big" style={{ color: (profile?.penalty_balance || 0) > 0 ? 'var(--red)' : 'var(--green)' }}>
            ₹{profile?.penalty_balance || 0}
          </div>
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>owed for rejected meals</div>
        </div>
      </div>

      {/* Rules card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>THE RULES</h3>
        {[
          { icon: '📸', rule: 'Upload a photo of every meal (breakfast, lunch, dinner)', type: 'neutral' },
          { icon: '⚖️', rule: 'Your community judges if your meal is on track', type: 'neutral' },
          { icon: '✓', rule: 'Approved meal = you\'re doing great!', type: 'good' },
          { icon: '✗', rule: 'Rejected meal = ₹50 penalty added to your balance', type: 'bad' },
          { icon: '🔥', rule: 'Log all 3 meals daily to keep your streak alive', type: 'good' },
          { icon: '💀', rule: 'Miss a day = streak resets to 0', type: 'bad' },
          { icon: '⭐', rule: 'Earn points to climb the leaderboard', type: 'good' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gray-800)' }}>
            <div style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{item.icon}</div>
            <div style={{ fontSize: 14, color: item.type === 'good' ? 'var(--green)' : item.type === 'bad' ? 'var(--red)' : 'var(--gray-200)' }}>
              {item.rule}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Save buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {editing ? (
          <>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      <div className="divider" />
      <button className="btn-danger" onClick={signOut}>Sign Out</button>
    </div>
  )
}
