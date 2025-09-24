import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { loading } = useAuth()
  const [formData, setFormData] = useState({
    email: 'demo@westingenieria.cl',
    password: 'demo123',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Para MVP, aceptamos cualquier combinación
      // En producción, esto se validaría con Firebase Authentication
      if (formData.email && formData.password) {
        // Simulamos login exitoso
        localStorage.setItem('isAuthenticated', 'true')
        navigate('/')
      } else {
        setError('Por favor ingresa email y contraseña')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    }
  }

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@westingenieria.cl',
      password: 'demo123',
    })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              🚛 West Reportes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Reportes de Conducción
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              sx={{ mb: 2 }}
            >
              Usar Credenciales de Demo
            </Button>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="caption" color="text.secondary">
              Demo: demo@westingenieria.cl / demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
