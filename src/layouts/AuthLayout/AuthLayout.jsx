import { Outlet } from 'react-router-dom'
import imagenPrincipal from '../../assets/imagen1.png'
import logoAcueducto from '../../assets/logo-acueducto.png'
import './AuthLayout.css'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <section className="auth-layout__branding">
        <img
          className="auth-layout__image"
          src={imagenPrincipal}
          alt=""
          aria-hidden="true"
        />

        <div className="auth-layout__overlay" />

        <div className="auth-layout__branding-content">
          <div className="auth-layout__identity">
            <img
              className="auth-layout__logo"
              src={logoAcueducto}
              alt="Logo Acueducto Vereda El Tablazo"
            />
            <span className="auth-layout__badge">
              Acueducto comunitario {'\u00b7'} NIT 811.022.038-6
            </span>
          </div>

          <h1>Acueducto Vereda El Tablazo</h1>

          <p className="auth-layout__description">
            {'Tecnolog\u00eda y gesti\u00f3n al servicio de nuestra comunidad.'}
          </p>

          <div className="auth-layout__features">
            <span>{'Gesti\u00f3n de predios'}</span>
            <span>{'Facturaci\u00f3n transparente'}</span>
            <span>Control seguro de pagos</span>
          </div>
        </div>

        <footer className="auth-layout__footer">
          Agua que conecta comunidad y bienestar {'\u00b7'} NIT 811.022.038-6
        </footer>
      </section>

      <main className="auth-layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout