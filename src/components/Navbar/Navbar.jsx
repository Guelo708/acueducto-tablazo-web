import { cerrarSesionAdmin } from '../../services/authService.js'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'
import logoAcueducto from '../../assets/logo-acueducto.png'
import './Navbar.css'
import './AdminNavigation.css'

function Navbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  function getLinkClass({ isActive }) {
    return isActive
      ? 'navbar__link navbar__link--active'
      : 'navbar__link'
  }

  function handleLogout() {
    cerrarSesionAdmin()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar__container">
        <NavLink
          className="navbar__brand"
          to="/inicio"
        >
          <img
            src={logoAcueducto}
            alt="Logo Acueducto Vereda El Tablazo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              padding: '2px',
              flexShrink: 0,
            }}
          />

          <span className="navbar__brand-text">
            <strong>Acueducto El Tablazo</strong>
            <small>NIT 811.022.038-6</small>
          </span>
        </NavLink>

        <nav
          className="navbar__navigation"
          aria-label={'Navegaci\u00f3n principal'}
        >
          <NavLink className={getLinkClass} to="/inicio">
            Inicio
          </NavLink>
          <NavLink className={getLinkClass} to="/estadisticas">
            {'Estad\u00edsticas'}
          </NavLink>
          <NavLink className={getLinkClass} to="/gestion/suscriptores">
            Suscriptores
          </NavLink>
          <NavLink className={getLinkClass} to="/predios">
            Predios
          </NavLink>
          <NavLink className={getLinkClass} to="/facturas">
            Facturas
          </NavLink>
          <NavLink className={getLinkClass} to="/pagos">
            Pagos
          </NavLink>
          <details className="navbar__catalogs">
            <summary>{'Cat\u00e1logos'}</summary>
            <div className="navbar__catalog-menu">
              <NavLink className={getLinkClass} to="/catalogos/sectores">Sectores</NavLink>
              <NavLink className={getLinkClass} to="/catalogos/tipos-predio">Tipos de predio</NavLink>
              <NavLink className={getLinkClass} to="/catalogos/tarifas">Tarifas</NavLink>
            </div>
          </details>
          <a
            className="navbar__link"
            href="/consulta"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir la consulta pública de facturas de suscriptores en una nueva pestaña"
          >
            Portal público ↗
          </a>
        </nav>

        <div className="navbar__actions">
          <button
            className="navbar__theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? 'Activar tema oscuro'
                : 'Activar tema claro'
            }
          >
            <span className="navbar__theme-icon" aria-hidden="true">
              {theme === 'light' ? '\u263e' : '\u2600'}
            </span>
            <span>
              {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </span>
          </button>

          <button
            className="navbar__logout-button"
            type="button"
            onClick={handleLogout}
          >
            {'Cerrar sesi\u00f3n'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar