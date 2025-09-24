import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Dashboard from './pages/Dashboard.tsx'
import Login from './pages/Login.tsx'
import Reports from './pages/Reports.tsx'
import Admin from './pages/Admin.tsx'
import Navbar from './components/common/Navbar.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { AuroraBackground } from './components/ui/Backgrounds.tsx'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <div>Cargando...</div>
      </Box>
    )
  }

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh',
      background: 'transparent'
    }}>
      {/* Aurora Background directamente aplicado */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(34, 197, 94, 0.1) 75%, rgba(59, 130, 246, 0.1) 100%)',
        overflow: 'hidden'
      }}>
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(71, 85, 105, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71, 85, 105, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.8
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 800px 600px at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          animation: 'aurora1 8s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 600px 400px at 80% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
          animation: 'aurora2 6s ease-in-out infinite alternate-reverse'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 700px 500px at 20% 60%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
          animation: 'aurora3 10s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 900px 300px at 60% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
          animation: 'aurora4 7s ease-in-out infinite alternate-reverse'
        }} />
      </div>
      
      <Router>
        {user && <Navbar />}
        <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </Box>
      </Router>
    </div>
  )
}

export default App
