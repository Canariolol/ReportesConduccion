import { useSelector } from 'react-redux'
import { RootState } from '../store/store.ts'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export const useAuth = () => {
  // Para MVP, usamos un usuario demo
  // En producción, esto se conectaría con Firebase Authentication
  const user: User | null = {
    id: 'demo_user',
    email: 'demo@westingenieria.cl',
    name: 'Usuario Demo',
    role: 'user'
  }

  const loading = false

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
