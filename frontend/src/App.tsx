import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Dashboard from './pages/Dashboard.tsx'
import Login from './pages/Login.tsx'
import Reports from './pages/Reports.tsx'
import Admin from './pages/Admin.tsx'
import Navbar from './components/common/Navbar.tsx'
import { useAuth } from './hooks/useAuth.ts'

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
    <Router>
      {user && <Navbar />}
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default App
