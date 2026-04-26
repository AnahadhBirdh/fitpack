import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function LeaderboardPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('points')

  useEffect(() => { fetchLeaderboard() }, [tab])

  const fetchLeaderboard = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('id, username, streak, total_points, penalty_balance, goal_calories').order(tab === 'points' ? 'total_points' : 'streak', { ascending: false }).limit(20)
    setUsers(data || [])
    setLoading(false)
  }

  const medals = ['🥇', '🥈', '🥉']
  const myRank = users.findIndex(u => u.id === profile?.id) + 1

  return (
    <div className="page fade-in">
      <h2 style={{ marginBottom: 8 }}>LEADERBOARD</h2>
      <div style={{ color: 'var(--gray-400)', marginBottom: 24, fontSize: 14 }}>Who's crushing it in your squad?</div>

      {myRank > 0 && (
        <div className="streak-card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: 'var(--lime)', lineHeight: 1 }}>#{myRank}</div>
          <div>
            <div style={{ fontWeight: 700 }}>YOUR RANK</div>
            <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>
              {myRank === 1 ? "You're #1! Stay on top 👑" : `Keep grinding to reach #${myRank - 1}!`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--lime)' }}>{profile?.total_points || 0}</div>
            <div style={{ color: 'var(--gray-400)', fontSize: 12 }}>POINTS</div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'points' ? 'active' : ''}`} onClick={() => setTab('points')}>By Points</button>
        <button className={`tab ${tab === 'streak' ? 'active' : ''}`} onClick={() => setTab('streak')}>By Streak</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          {users.map((u, i) => {
            const isMe = u.id === profile?.id
            const value = tab === 'points' ? u.total_points : u.streak
            const maxVal = users[0] ? (tab === 'points' ? users[0].total_points : users[0].streak) : 1
            return (
              <div key={u.id} className="leaderboard-row" style={{ background: isMe ? 'rgba(200,241,53,0.05)' : 'transparent', margin: '0 -24px', padding: '14px 24px' }}>
                <div className={`leaderboard-rank ${i < 3 ? 'top' : ''}`}>
                  {i < 3 ? medals[i] : `#${i+1}`}
                </div>
                <div className="avatar">{(u.username || 'U').slice(0,2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.username} {isMe && <span className="badge badge-lime" style={{ fontSize: 10 }}>YOU</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${maxVal ? (value / maxVal) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--lime)' }}>{value || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {tab === 'points' ? 'pts' : 'day streak'}
                  </div>
                </div>
              </div>
            )
          })}
          {users.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
              <h3>No players yet</h3>
              <div>Invite your friends to join!</div>
            </div>
          )}
        </div>
      )}

      {/* How points work */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>HOW TO EARN POINTS</h3>
        {[
          { icon: '🍽️', action: 'Log a meal with photo', pts: '+3 pts' },
          { icon: '🔥', action: 'Log all 3 meals in a day', pts: '+10 pts' },
          { icon: '⚖️', action: 'Judge someone else\'s meal', pts: '+5 pts' },
          { icon: '📏', action: 'Log your weight', pts: '+2 pts' },
          { icon: '📅', action: '7-day streak bonus', pts: '+25 pts' },
        ].map(item => (
          <div key={item.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--gray-800)' }}>
            <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{item.icon}</div>
            <div style={{ flex: 1, fontSize: 14 }}>{item.action}</div>
            <div style={{ color: 'var(--lime)', fontWeight: 700, fontSize: 14 }}>{item.pts}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
