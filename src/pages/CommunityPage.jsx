import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const PENALTY_AMOUNT = 50

export default function CommunityPage() {
  const { profile, refreshProfile } = useAuth()
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('judge')
  const [judging, setJudging] = useState({})

  useEffect(() => { if (profile) fetchFeed() }, [profile, tab])

  const fetchFeed = async () => {
    setLoading(true)
    let query = supabase.from('meals').select(`*, profiles(username, streak, total_points)`).not('photo_url', 'is', null).order('created_at', { ascending: false }).limit(30)
    if (tab === 'judge') query = query.neq('user_id', profile.id).is('judge_result', null)
    else query = query.not('judge_result', 'is', null)
    const { data } = await query
    setFeed(data || [])
    setLoading(false)
  }

  const judge = async (meal, result) => {
    if (judging[meal.id]) return
    setJudging(j => ({ ...j, [meal.id]: true }))
    try {
      await supabase.from('meals').update({ judge_result: result, judged_by: profile.id, judged_at: new Date().toISOString() }).eq('id', meal.id)
      if (result === 'rejected') {
        await supabase.from('profiles').update({ penalty_balance: (meal.profiles?.penalty_balance || 0) + PENALTY_AMOUNT }).eq('id', meal.user_id)
        await supabase.from('profiles').update({ total_points: (profile.total_points || 0) + 5 }).eq('id', profile.id)
        refreshProfile()
        toast.success(`Meal rejected! ${meal.profiles?.username} owes ₹${PENALTY_AMOUNT}. You earned +5 pts for judging!`)
      } else {
        await supabase.from('profiles').update({ total_points: (profile.total_points || 0) + 5 }).eq('id', profile.id)
        refreshProfile()
        toast.success(`Meal approved! +5 pts for judging!`)
      }
      setFeed(f => f.filter(m => m.id !== meal.id))
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setJudging(j => ({ ...j, [meal.id]: false }))
  }

  const getInitials = (name) => (name || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="page fade-in">
      <h2 style={{ marginBottom: 8 }}>COMMUNITY FEED</h2>
      <div style={{ color: 'var(--gray-400)', marginBottom: 24, fontSize: 14 }}>
        Judge your friends' meals. Keep each other accountable.
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'judge' ? 'active' : ''}`} onClick={() => setTab('judge')}>Judge Meals</button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Meals</button>
      </div>

      {tab === 'judge' && (
        <div className="penalty-banner" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20 }}>⚖️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>You're the judge</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Is this meal on track for their fitness goal? Approve or reject. Rejected meals = ₹{PENALTY_AMOUNT} penalty. You get +5 pts per judgment.</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="spinner" /></div>
      ) : feed.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 60, marginBottom: 16 }}>{tab === 'judge' ? '🎉' : '🍽️'}</div>
          <h3>{tab === 'judge' ? 'All caught up!' : 'No meals yet'}</h3>
          <div>{tab === 'judge' ? 'No meals waiting to be judged. Check back later.' : 'Your community hasn\'t logged meals yet.'}</div>
        </div>
      ) : (
        <div>
          {feed.map(meal => (
            <div key={meal.id} className="food-card fade-in">
              {meal.photo_url && <img src={meal.photo_url} alt={meal.name} className="food-card-img" />}
              <div className="food-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="avatar">{getInitials(meal.profiles?.username)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{meal.profiles?.username || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {formatDistanceToNow(new Date(meal.created_at), { addSuffix: true })} · {meal.meal_type}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {meal.profiles?.streak > 0 && <span className="badge badge-lime">🔥 {meal.profiles.streak}d</span>}
                    {meal.judge_result === 'approved' && <span className="badge badge-green">✓ Approved</span>}
                    {meal.judge_result === 'rejected' && <span className="badge badge-red">✗ Rejected</span>}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{meal.name}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--lime)', fontWeight: 600 }}>{meal.calories} cal</span>
                  {meal.protein > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Protein: {meal.protein}g</span>}
                  {meal.carbs > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Carbs: {meal.carbs}g</span>}
                  {meal.fat > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Fat: {meal.fat}g</span>}
                </div>
                {meal.notes && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>"{meal.notes}"</div>}

                {tab === 'judge' && (
                  <div className="judge-btns">
                    <button className="judge-btn judge-btn-approve" onClick={() => judge(meal, 'approved')} disabled={judging[meal.id]}>
                      ✓ On Track — Approve
                    </button>
                    <button className="judge-btn judge-btn-reject" onClick={() => judge(meal, 'rejected')} disabled={judging[meal.id]}>
                      ✗ Off Track — ₹{PENALTY_AMOUNT} Penalty
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
