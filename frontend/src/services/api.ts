import axios from 'axios'

// Tipos para las variables de entorno personalizadas
interface CustomImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_API_URL?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
}

// Extender el tipo ImportMetaEnv existente
declare global {
  interface ImportMetaEnv extends CustomImportMetaEnv {}
}

// Configuración de API según el entorno
const getApiConfig = () => {
  // En desarrollo, usar el proxy de Vite para evitar problemas de CORS
  if (import.meta.env.DEV) {
    console.log('🔧 Usando configuración de desarrollo (proxy Vite)')
    return {
      baseURL: '/api/',
      timeout: 30000,
    }
  }
  
  // En producción, usar la URL del backend desplegado
  // La variable VITE_API_URL debe estar configurada en .env.production
  const productionApiUrl = import.meta.env.VITE_API_URL
  
  if (!productionApiUrl) {
    console.error('❌ Error: VITE_API_URL no está configurada para producción')
    // URL de respaldo por si acaso
    const fallbackUrl = 'https://reportes-conduccion-backend-v2-51038157662.us-central1.run.app/api'
    console.log('🔄 Usando URL de respaldo:', fallbackUrl)
    
    return {
      baseURL: fallbackUrl,
      timeout: 30000,
    }
  }
  
  console.log('🚀 Usando configuración de producción:', productionApiUrl)
  
  const config = {
    baseURL: productionApiUrl,
    timeout: 30000,
  }
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
