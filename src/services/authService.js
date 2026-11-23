import api from './api.js'

const STORAGE_KEY = 'tablazo_admin_session'

export async function iniciarSesionAdmin({ correo, contrasena }) {
  const { data } = await api.post('/auth/login', {
    correo: correo?.trim(),
    contrasena,
  })
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

export async function verificarSesionActiva() {
  const sesion = obtenerSesionAdmin()
  if (!sesion?.token) {
    return null
  }
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch {
    cerrarSesionAdmin()
    return null
  }
}

export function obtenerSesionAdmin() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token ? parsed : null
  } catch {
    return null
  }
}

export function cerrarSesionAdmin() {
  sessionStorage.removeItem(STORAGE_KEY)
}