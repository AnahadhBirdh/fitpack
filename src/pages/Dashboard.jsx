import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { format, startOfDay, subDays } from 'date-fns'

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const [todayMeals, setTodayMeals] = useState([])
  const [todayWeight, setTodayWeight] = useState(null)
  const [weeklyWeights, setWeeklyWeights] = useState([])
  const [pendingJudge, setPendingJudge] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) { fetchData(); }
  }, [profile])

  const fetchData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const [mealsRes, weightRes, weekRes, judgeRes] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', profile.id).eq('date', today),
      supabase.from('weight_logs').select('*').eq('user_id', profile.id).eq('date', today).single(),
      supabase.from('weight_logs').select('*').eq('user_id', profile.id).gte('date', format(subDays(new Date(), 6), 'yyyy-MM-dd')).order('date'),
      supabase.from('meals').select('id', { count: 'exact' }).neq('user_id', profile.id).is('judge_result', null).not('photo_url', 'is', null)
    ])
    setTodayMeals(mealsRes.data || [])
    setTodayWeight(weightRes.data)
    setWeeklyWeights(weekRes.data || [])
    setPendingJudge(judgeRes.count || 0)
    setLoading(false)
  }

  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0)
  const mealCount = todayMeals.length
  const goalPct = Math.min(100, Math.round((totalCalories / (profile?.goal_calories || 2000)) * 100))

  const initials = (profile?.username || 'U').slice(0, 2).toUpperCase()

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 2 }}>HEY, {(profile?.username || 'CHAMP').toUpperCase()}</h2>
          <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>{format(new Date(), 'EEEE, MMMM d')}</div>
        </div>
        {pendingJudge > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <div className="badge badge-orange">{pendingJudge} to judge</div>
          </div>
        )}
      </div>

      {/* Streak Card */}
      <div className="streak-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label">Current Streak</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div className="stat-big">{profile?.streak || 0}</div>
              <div style={{ fontSize: 20 }}>🔥 DAYS</div>
            </div>
            <div style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 4 }}>
              {profile?.streak >= 7 ? 'On fire! Keep crushing it.' : 'Upload all 3 meals daily to grow your streak.'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label">Total Points</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--lime)' }}>{profile?.total_points || 0}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => {
            const active = i < Math.min(profile?.streak || 0, 7)
            return <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, background: active ? 'var(--lime)' : 'var(--gray-700)', transition: 'background 0.3s' }} />
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card-sm">
          <div className="label">Calories Today</div>
          <div className="stat-big" style={{ fontSize: '2.2rem' }}>{totalCalories}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>of {profile?.goal_calories || 2000} goal</div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
        <div className="card-sm">
          <div className="label">Meals Logged</div>
          <div className="stat-big" style={{ fontSize: '2.2rem' }}>{mealCount}<span style={{ fontSize: '1.2rem', color: 'var(--gray-400)' }}>/3</span></div>
          <div style={{ color: mealCount < 3 ? 'var(--orange)' : 'var(--green)', fontSize: 13 }}>
            {mealCount < 3 ? `${3 - mealCount} more to avoid penalty` : 'All meals logged!'}
          </div>
        </div>
        <div className="card-sm">
          <div className="label">Today's Weight</div>
          <div className="stat-big" style={{ fontSize: '2.2rem' }}>{todayWeight?.weight_kg || '--'}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>kg</div>
        </div>
      </div>

      {/* Penalty Balance */}
      {(profile?.penalty_balance || 0) > 0 && (
        <div className="penalty-banner" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24 }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--red)' }}>Penalty Balance: ₹{profile.penalty_balance}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>You missed meal uploads or got rejected. Time to pay up!</div>
          </div>
        </div>
      )}

      {/* Weekly Weight Chart */}
      {weeklyWeights.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>WEEKLY WEIGHT</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {weeklyWeights.map((w, i) => {
              const allW = weeklyWeights.map(x => x.weight_kg)
              const min = Math.min(...allW) - 1
              const max = Math.max(...allW) + 1
              const pct = ((w.weight_kg - min) / (max - min)) * 100
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{w.weight_kg}</div>
                  <div style={{ width: '100%', height: `${Math.max(10, pct)}%`, background: 'var(--lime)', borderRadius: '4px 4px 0 0', minHeight: 8 }} />
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{format(new Date(w.date), 'EEE')}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Meal Status */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>TODAY'S MEALS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
            const logged = todayMeals.find(m => m.meal_type === meal.toLowerCase())
            return (
              <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--gray-800)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: logged ? 'rgba(48,209,88,0.15)' : 'var(--gray-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {meal === 'Breakfast' ? '🌅' : meal === 'Lunch' ? '☀️' : '🌙'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{meal}</div>
                  {logged ? (
                    <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{logged.name} · {logged.calories} cal</div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--orange)' }}>Not logged yet</div>
                  )}
                </div>
                {logged ? (
                  logged.judge_result === 'approved' ? <span className="badge badge-green">✓ On track</span>
                  : logged.judge_result === 'rejected' ? <span className="badge badge-red">✗ Penalty</span>
                  : <span className="badge badge-gray">Pending</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
