import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, uploadFoodPhoto } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MealsPage() {
  const { profile, refreshProfile } = useAuth()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [form, setForm] = useState({
    meal_type: 'breakfast', name: '', calories: '', protein: '', carbs: '', fat: '', notes: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { if (profile) fetchMeals() }, [profile])

  const fetchMeals = async () => {
    const { data } = await supabase.from('meals').select('*').eq('user_id', profile.id).eq('date', today).order('created_at', { ascending: false })
    setMeals(data || [])
    setLoading(false)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) { toast.error('Please upload a food photo'); return }
    if (!form.name || !form.calories) { toast.error('Name and calories required'); return }

    const mealExists = meals.find(m => m.meal_type === form.meal_type)
    if (mealExists) { toast.error(`${form.meal_type} already logged today`); return }

    setSubmitting(true)
    try {
      const photoUrl = await uploadFoodPhoto(selectedFile, profile.id)
      await supabase.from('meals').insert({
        user_id: profile.id,
        date: today,
        meal_type: form.meal_type,
        name: form.name,
        calories: parseInt(form.calories),
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
        notes: form.notes,
        photo_url: photoUrl,
        judge_result: null,
        created_at: new Date().toISOString()
      })

      // Check streak: if all 3 meals done, update streak
      const updatedMeals = [...meals, { meal_type: form.meal_type }]
      const types = updatedMeals.map(m => m.meal_type)
      if (['breakfast','lunch','dinner'].every(t => types.includes(t))) {
        await supabase.from('profiles').update({ streak: (profile.streak || 0) + 1, total_points: (profile.total_points || 0) + 10 }).eq('id', profile.id)
        refreshProfile()
        toast.success('🔥 Streak extended! +10 points for logging all meals!')
      } else {
        toast.success('Meal logged! +3 points')
        await supabase.from('profiles').update({ total_points: (profile.total_points || 0) + 3 }).eq('id', profile.id)
        refreshProfile()
      }

      setForm({ meal_type: 'breakfast', name: '', calories: '', protein: '', carbs: '', fat: '', notes: '' })
      setPreview(null); setSelectedFile(null)
      setShowForm(false)
      fetchMeals()
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    }
    setSubmitting(false)
  }

  const loggedTypes = meals.map(m => m.meal_type)

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h2>MY MEALS</h2>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Log Meal</button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>LOG A MEAL</h3>
            <button onClick={() => { setShowForm(false); setPreview(null) }} style={{ background: 'none', color: 'var(--gray-400)', fontSize: 20 }}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Meal Type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['breakfast','lunch','dinner'].map(t => (
                  <button key={t} type="button"
                    onClick={() => set('meal_type', t)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${form.meal_type === t ? 'var(--lime)' : 'var(--gray-600)'}`,
                      background: form.meal_type === t ? 'rgba(200,241,53,0.1)' : 'transparent',
                      color: form.meal_type === t ? 'var(--lime)' : 'var(--gray-400)', fontWeight: 600, fontSize: 14, textTransform: 'capitalize',
                      opacity: loggedTypes.includes(t) ? 0.4 : 1 }}>
                    {t === 'breakfast' ? '🌅' : t === 'lunch' ? '☀️' : '🌙'} {t}
                    {loggedTypes.includes(t) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Food Photo (Required)</label>
              <div className="photo-upload-zone" onClick={() => fileRef.current.click()}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                    <div style={{ fontWeight: 600 }}>Tap to upload food photo</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 4 }}>Your community will judge if it's on track</div>
                  </div>
                )}
              </div>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Food Name</label>
                <input placeholder="e.g. Grilled Chicken Rice" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Calories</label>
                <input type="number" placeholder="500" value={form.calories} onChange={e => set('calories', e.target.value)} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="label">Protein (g)</label>
                <input type="number" placeholder="0" value={form.protein} onChange={e => set('protein', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Carbs (g)</label>
                <input type="number" placeholder="0" value={form.carbs} onChange={e => set('carbs', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Fat (g)</label>
                <input type="number" placeholder="0" value={form.fat} onChange={e => set('fat', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Notes (optional)</label>
              <textarea rows={2} placeholder="Any notes..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Uploading...' : 'Submit Meal for Judging'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="spinner" /></div>
      ) : meals.length === 0 && !showForm ? (
        <div className="empty-state">
          <div style={{ fontSize: 60, marginBottom: 16 }}>🍽️</div>
          <h3>No meals logged today</h3>
          <div>Log all 3 meals to keep your streak alive!</div>
        </div>
      ) : (
        <div>
          {meals.map(meal => (
            <div key={meal.id} className="food-card">
              {meal.photo_url && <img src={meal.photo_url} alt={meal.name} className="food-card-img" />}
              <div className="food-card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ textTransform: 'capitalize', fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>
                      {meal.meal_type === 'breakfast' ? '🌅' : meal.meal_type === 'lunch' ? '☀️' : '🌙'} {meal.meal_type}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{meal.name}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <span style={{ color: 'var(--lime)', fontWeight: 600 }}>{meal.calories} cal</span>
                      {meal.protein > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>P: {meal.protein}g</span>}
                      {meal.carbs > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>C: {meal.carbs}g</span>}
                      {meal.fat > 0 && <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>F: {meal.fat}g</span>}
                    </div>
                  </div>
                  <div>
                    {meal.judge_result === 'approved' && <span className="badge badge-green">✓ On Track</span>}
                    {meal.judge_result === 'rejected' && <span className="badge badge-red">✗ Penalty +₹50</span>}
                    {!meal.judge_result && <span className="badge badge-gray">Awaiting Judgment</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
