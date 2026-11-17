import { useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarEstadoCuentaPublico } from '../../services/consultaPublicaService.js'
import heroImg from '../../assets/hero.png'
import img1 from '../../assets/imagen1.png'
import img2 from '../../assets/Imagen2.png'
import img3 from '../../assets/Imagen3.png'
import './ConsultaSuscriptorPage.css'

const TELEFONO_TESORERIA = '573105301220' // TODO: Reemplazar con el número oficial de WhatsApp de la Junta

const money = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v || 0)

function ConsultaSuscriptorPage() {
  const [identificador, setIdentificador] = useState('')
  const [ultimos4Celular, setUltimos4Celular] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConsultar(e) {
    e.preventDefault()
    if (!identificador.trim()) return

    try {
      setLoading(true)
      setError('')
      const data = await consultarEstadoCuentaPublico({
        identificador,
        ultimos4Celular,
      })
      setResultado(data)
    } catch (err) {
      setResultado(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const mensajeReportePago = resultado
    ? encodeURIComponent(
        `Hola, Junta del Acueducto Vereda El Tablazo. Soy ${resultado.titular} (${resultado.cedula}). Adjunto el comprobante de pago de mi factura por valor de ${money(resultado.totalAdeudado)}.`
      )
    : ''

  return (
    <div className="portal-inst">
      {/* Navbar Institucional */}
      <nav className="portal-inst__navbar">
        <div className="portal-inst__nav-inner">
          <div className="portal-inst__brand">
            <div className="portal-inst__logo-drop" aria-hidden="true">
              AT
            </div>
            <div>
              <span className="portal-inst__eyebrow">Gestión Comunitaria del Agua</span>
              <h1 className="portal-inst__brand-title">Acueducto Vereda El Tablazo</h1>
            </div>
          </div>
          <Link to="/login" className="portal-inst__admin-btn">
            Acceso Junta Administradora
          </Link>
        </div>
      </nav>

      {/* Hero Institucional con imagen del repositorio */}
      <header
        className="portal-inst__hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="portal-inst__hero-overlay" />
        <div className="portal-inst__hero-content">
          <div>
            <span className="portal-inst__hero-tag">Oficina Virtual del Suscriptor</span>
            <h2 className="portal-inst__hero-title">
              Consulta tu factura y mantén al día el agua de nuestra vereda
            </h2>
            <p className="portal-inst__hero-desc">
              Verifica tu estado de cuenta en segundos sin necesidad de contraseñas, revisa tus pagos anteriores y reporta tus transferencias directamente a Tesorería.
            </p>
          </div>

          <aside className="portal-inst__hero-highlights">
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>Consulta rápida con tu cédula o nombre del predio registrado.</span>
            </div>
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>Transparencia total en saldos pendientes y abonos aplicados.</span>
            </div>
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>Atención directa con la Junta Administradora El Tablazo.</span>
            </div>
          </aside>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="portal-inst__main">
        <section className="portal-card portal-card--search">
          <div className="portal-card__header">
            <h3 className="portal-card__title">Consulta de Estado de Cuenta</h3>
            <p className="portal-card__subtitle">
              Digita tu <strong>número de cédula</strong> (o el nombre de tu predio/finca si es un registro antiguo) junto con los <strong>últimos 4 dígitos de tu celular</strong>.
            </p>
          </div>

          <form className="portal-search-form" onSubmit={handleConsultar}>
            <label className="portal-field">
              Cédula o nombre del predio
              <input
                type="text"
                required
                minLength={4}
                placeholder="Ej: 70141708 o Finca El Mirador"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
              />
            </label>

            <label className="portal-field">
              Últimos 4 dígitos celular
              <input
                type="text"
                maxLength={4}
                inputMode="numeric"
                placeholder="Ej: 1220"
                value={ultimos4Celular}
                onChange={(e) =>
                  setUltimos4Celular(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
              />
            </label>

            <button
              type="submit"
              className="portal-btn-primary"
              disabled={loading}
            >
              {loading ? 'Consultando...' : 'Consultar Cartera'}
            </button>
          </form>

          {error && (
            <div className="portal-alert portal-alert--error">{error}</div>
          )}
        </section>

        {resultado && (
          <>
            {resultado.requiereActualizarDatos && (
              <div className="portal-alert portal-alert--warning">
                <strong>Actualización de censo recomendada:</strong> Tu ficha aún no tiene número de celular o cédula completos registrados. Por favor acércate o escribe a la Junta para actualizar tus datos.
              </div>
            )}

            <section className="portal-card">
              <div className="portal-subscriber-top">
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    SUSCRIPTOR TITULAR
                  </span>
                  <h3 className="portal-subscriber-name">{resultado.titular}</h3>
                </div>
                <span className="portal-subscriber-doc">
                  Documento: {resultado.cedula}
                </span>
              </div>

              <div
                className={`portal-status-banner ${
                  resultado.alDia
                    ? 'portal-status-banner--ok'
                    : 'portal-status-banner--debt'
                }`}
              >
                <div>
                  <span className="portal-status-banner__label">
                    {resultado.alDia
                      ? '¡Estás al día con tu servicio de acueducto!'
                      : `Tienes ${resultado.cantidadFacturasPendientes} factura(s) pendiente(s)`}
                  </span>
                  <p className="portal-status-banner__amount">
                    {money(resultado.totalAdeudado)}
                  </p>
                </div>
                <div className="portal-status-banner__note">
                  {resultado.alDia
                    ? 'Gracias por tu pago oportuno; tu aporte sostiene la operación y calidad del agua en nuestra comunidad.'
                    : 'Realiza tu pago a tiempo para evitar recargos por mora o suspensión del suministro.'}
                </div>
              </div>

              {resultado.facturasPendientes?.length > 0 && (
                <>
                  <h4 className="portal-section-heading">
                    Detalle de facturas pendientes
                  </h4>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Predio / Sector</th>
                          <th>Periodo</th>
                          <th>Vencimiento</th>
                          <th>Estado</th>
                          <th>Saldo a pagar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.facturasPendientes.map((f) => (
                          <tr key={f.id}>
                            <td>
                              <strong>{f.nombrePredio}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {f.sector}
                              </div>
                            </td>
                            <td>
                              {String(f.mes).padStart(2, '0')}/{f.anio}
                            </td>
                            <td>{f.fechaVencimiento}</td>
                            <td>
                              <span className={`portal-pill portal-pill--${f.estado}`}>
                                {f.estado}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: '#0033A0', fontSize: '1rem' }}>
                                {money(f.saldoPendiente)}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="portal-payment-box">
                    <h4>Canales oficiales de recaudo</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                      Puedes cancelar en efectivo en los puntos autorizados de la vereda o realizar transferencia electrónica a las cuentas de la Junta:
                    </p>
                    <div className="portal-payment-grid">
                      <div className="portal-payment-item">
                        <strong style={{ color: '#0033A0' }}>Nequi / Daviplata Oficial</strong>
                        <div style={{ marginTop: '0.25rem', color: '#475569' }}>
                          Solicita el número autorizado en Tesorería
                        </div>
                      </div>
                      <div className="portal-payment-item">
                        <strong style={{ color: '#0033A0' }}>Cuenta Bancaria Junta</strong>
                        <div style={{ marginTop: '0.25rem', color: '#475569' }}>
                          Acueducto Vereda El Tablazo
                        </div>
                      </div>
                    </div>
                    <a
                      className="portal-whatsapp-btn"
                      href={`https://wa.me/${TELEFONO_TESORERIA}?text=${mensajeReportePago}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Reportar comprobante de pago por WhatsApp
                    </a>
                  </div>
                </>
              )}
            </section>

            {resultado.ultimosPagos?.length > 0 && (
              <section className="portal-card">
                <h4 className="portal-section-heading" style={{ marginTop: 0 }}>
                  Historial de últimos pagos aplicados
                </h4>
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Fecha pago</th>
                        <th>Periodo factura</th>
                        <th>Medio de pago</th>
                        <th>Valor pagado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.ultimosPagos.map((p) => (
                        <tr key={p.id}>
                          <td>{p.fechaPago}</td>
                          <td>
                            {String(p.mesFactura).padStart(2, '0')}/{p.anioFactura}
                          </td>
                          <td>{p.metodoPago?.replaceAll('_', ' ')}</td>
                          <td>
                            <strong>{money(p.valorPagado)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* Sección Informativa Institucional con las imágenes del repositorio */}
        <section className="portal-gallery">
          <div className="portal-gallery__header">
            <h3 className="portal-gallery__title">Compromiso con nuestra comunidad</h3>
            <span style={{ fontSize: '0.88rem', color: '#475569' }}>
              Transparencia, conservación hídrica y servicio continuo
            </span>
          </div>

          <div className="portal-gallery__grid">
            <article className="portal-info-card">
              <img
                src={img1}
                alt="Protección de fuentes hídricas Vereda El Tablazo"
                className="portal-info-card__img"
              />
              <div className="portal-info-card__body">
                <span className="portal-info-card__tag">Cuidado del Agua</span>
                <h4 className="portal-info-card__title">Protección de nacimientos</h4>
                <p className="portal-info-card__text">
                  Cada recaudo se invierte directamente en la conservación de nuestras microcuencas y el mantenimiento preventivo de bocatomas.
                </p>
              </div>
            </article>

            <article className="portal-info-card">
              <img
                src={img2}
                alt="Infraestructura y red de distribución del acueducto"
                className="portal-info-card__img"
              />
              <div className="portal-info-card__body">
                <span className="portal-info-card__tag">Infraestructura</span>
                <h4 className="portal-info-card__title">Red de distribución veredal</h4>
                <p className="portal-info-card__text">
                  Trabajamos permanentemente en la mejora de redes, válvulas y tanques de almacenamiento para garantizar continuidad en cada sector.
                </p>
              </div>
            </article>

            <article className="portal-info-card">
              <img
                src={img3}
                alt="Atención al suscriptor y recaudo oportuno"
                className="portal-info-card__img"
              />
              <div className="portal-info-card__body">
                <span className="portal-info-card__tag">Recaudo Oportuno</span>
                <h4 className="portal-info-card__title">Control claro para todos</h4>
                <p className="portal-info-card__text">
                  Consulta tus facturas desde cualquier celular y conserva tus soportes digitales emitidos por la Junta Administradora.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="portal-inst__footer">
        <strong>Acueducto Vereda El Tablazo</strong> · Junta Administradora Comunitaria · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default ConsultaSuscriptorPage