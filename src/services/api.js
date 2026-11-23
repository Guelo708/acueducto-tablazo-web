import axios from 'axios'

const STORAGE_KEY = 'tablazo_admin_session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 90000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const sesion = JSON.parse(raw)
      if (sesion?.token) {
        config.headers.Authorization = `Bearer ${sesion.token}`
      }
    }
  } catch {
    // Ignorar error de lectura de almacenamiento
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      sessionStorage.removeItem(STORAGE_KEY)
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    const message =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.message ||
      'No fue posible completar la solicitud.'

    return Promise.reject(new Error(message))
  },
)

export default api