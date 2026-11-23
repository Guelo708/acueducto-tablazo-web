import logoAcueducto from '../../assets/logo-acueducto.png'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <img
            src={logoAcueducto}
            alt="Logo Acueducto Vereda El Tablazo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              padding: '2px',
              flexShrink: 0,
            }}
          />

          <div className="footer__brand-text">
            <strong>Acueducto Vereda El Tablazo</strong>
            <span>NIT 811.022.038-6 {'\u00b7'} Junta Administradora Comunitaria</span>
          </div>
        </div>

        <div className="footer__project">
          <span>{'Gesti\u00f3n comunitaria'}</span>
          <strong>Vereda El Tablazo {'\u00b7'} {currentYear}</strong>
        </div>

        <div className="footer__status">
          <span className="footer__status-indicator" aria-hidden="true" />
          <span>Sistema activo</span>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          Agua que conecta comunidad, tecnolog{'\u00ed'}a y bienestar.
        </p>
      </div>
    </footer>
  )
}

export default Footer