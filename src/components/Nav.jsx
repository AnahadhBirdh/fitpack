import { useAuth } from '../hooks/useAuth'

export default function Nav({ page, setPage }) {
  const { profile } = useAuth()
  const links = [
    { id: 'dashboard', label: 'Home' },
    { id: 'meals', label: 'Meals' },
    { id: 'weight', label: 'Weight' },
    { id: 'community', label: 'Community' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profile', label: profile?.username || 'Profile' },
  ]
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo">FITPACK</div>
        <div className="nav-links" style={{ flexWrap: 'wrap', gap: 2 }}>
          {links.map(l => (
            <button key={l.id} className={`nav-link ${page === l.id ? 'active' : ''}`} onClick={() => setPage(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
