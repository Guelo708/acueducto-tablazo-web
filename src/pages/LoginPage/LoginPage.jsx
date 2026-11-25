import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  iniciarSesionAdmin,
  obtenerSesionAdmin,
} from '../../services/authService.js'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (obtenerSesionAdmin()) {
      navigate('/inicio', { replace: true })
    }
  }, [navigate])

  function handleChange(event) {
    const { name, value } = event.target
    setError('')
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.correo.trim() || !formData.contrasena.trim()) {
      return
    }

    try {
      setLoading(true)
      setError('')
      await iniciarSesionAdmin(formData)
      navigate('/inicio', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-card">
      <header className="login-card__header">
        <p className="login-card__eyebrow">Acceso exclusivo Junta Directiva</p>

        <h2>{'Iniciar sesi\u00f3n'}</h2>

        <p>Ingresa tus credenciales autorizadas para administrar Acueducto Vereda El Tablazo.</p>
      </header>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form__group">
          <label htmlFor="correo">{'Correo electr\u00f3nico'}</label>

          <input
            id="correo"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            placeholder="tesoreria@acueductoeltablazo.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="login-form__group">
          <label htmlFor="contrasena">{'Contrase\u00f1a'}</label>

          <div className="login-form__password">
            <input
              id="contrasena"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              value={formData.contrasena}
              onChange={handleChange}
              placeholder={'Ingresa tu contrase\u00f1a'}
              autoComplete="current-password"
              required
            />
            <button
              className="login-form__password-toggle"
              type="button"
              onClick={() => setShowPassword((isVisible) => !isVisible)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              aria-controls="contrasena"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
        </div>

        <button className="login-form__button" type="submit" disabled={loading}>
          {loading ? 'Verificando acceso...' : 'Ingresar'}
        </button>
      </form>

      <div className="login-card__footer">
        <p>
          {'¿Eres usuario o suscriptor del acueducto?'}
        </p>
        <Link to="/consulta" className="login-card__portal-link">
          {'Si eres suscriptor, consulta tus facturas aquí →'}
        </Link>
      </div>
    </section>
  )
}

export default LoginPage