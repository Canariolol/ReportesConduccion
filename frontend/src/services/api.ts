import axios from 'axios'

// Agrega la definición de tipos para ImportMetaEnv
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_API_URL?: string
  // agrega otras variables de entorno aquí si es necesario
}

// Augment the global ImportMeta type so TypeScript recognizes import.meta.env
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Configuración de API según el entorno
const getApiConfig = () => {
  // En desarrollo, usar el proxy de Vite
  if (import.meta.env.DEV) {
    return {
      baseURL: '/api',
      timeout: 30000,
    }
  }
  
  // En producción, usar la URL del backend desplegado
  const productionApiUrl = import.meta.env.VITE_API_URL || 'https://reportes-conduccion-backend-v2-51038157662.us-central1.run.app/api'
  
  const config = {
    baseURL: productionApiUrl,
    timeout: 30000,
  }
  console.log('API Config:', config) // Log para depuración
  return config
}

// Crear instancia de axios con configuración
const api = axios.create(getApiConfig())

// Interceptores para manejo de errores y autenticación
api.interceptors.request.use(
  (config) => {
    // Aquí podríamos agregar el token de autenticación en el futuro
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de API:', error.response.data)
      
      // Si es un error de autenticación, redirigir al login
      if (error.response.status === 401) {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.request)
    } else {
      // Error al configurar la solicitud
      console.error('Error de configuración:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api
