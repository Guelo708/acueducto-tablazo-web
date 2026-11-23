import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  obtenerSesionAdmin,
  verificarSesionActiva,
} from '../../services/authService.js'

function ProtectedRoute({ children }) {
  const sesionLocal = obtenerSesionAdmin()
  const [estado, setEstado] = useState(sesionLocal ? 'checking' : 'denied')

  useEffect(() => {
    let active = true

    async function validar() {
      if (!sesionLocal) {
        if (active) setEstado('denied')
        return
      }
      const valida = await verificarSesionActiva()
      if (active) {
        setEstado(valida ? 'allowed' : 'denied')
      }
    }

    validar()
    return () => {
      active = false
    }
  }, [])

  if (estado === 'denied') {
    return <Navigate to="/login" replace />
  }

  if (estado === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          color: '#0033A0',
        }}
      >
        Verificando credenciales de la Junta Directiva...
      </div>
    )
  }

  return children
}

export default ProtectedRoute