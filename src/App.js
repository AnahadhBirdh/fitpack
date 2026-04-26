import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import MealsPage from './pages/MealsPage'
import WeightPage from './pages/WeightPage'
import CommunityPage from './pages/CommunityPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import Nav from './components/Nav'
import './index.css'

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'sans-serif', fontSize: '3rem', color: '#c8f135' }}>FITPACK</div>
        <div style={{ marginTop: 20, width: 24, height: 24, border: '2px solid #333', borderTopColor: '#c8f135', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '20px auto' }} />
      </div>
    </div>
  )

  if (!user) return <AuthPage />

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'meals': return <MealsPage />
      case 'weight': return <WeightPage />
      case 'community': return <CommunityPage />
      case 'leaderboard': return <LeaderboardPage />
      case 'profile': return <ProfilePage />
      default: return <Dashboard />
    }
  }

  return (
    <>
      <Nav page={page} setPage={setPage} />
      {renderPage()}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } }} />
      <AppInner />
    </AuthProvider>
  )
}
