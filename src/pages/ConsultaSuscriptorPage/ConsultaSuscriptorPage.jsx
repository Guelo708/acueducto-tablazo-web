import { useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarEstadoCuentaPublico } from '../../services/consultaPublicaService.js'
import {
  descargarEstadoCuentaPdf,
  descargarFacturaPdf,
} from '../../utils/facturaPdfGenerator.js'
import logoAcueducto from '../../assets/logo-acueducto.png'
import heroImg from '../../assets/hero.png'
import img1 from '../../assets/imagen1.png'
import img2 from '../../assets/Imagen2.png'
import img3 from '../../assets/Imagen3.png'
import './ConsultaSuscriptorPage.css'

const TELEFONO_TESORERIA = '573105301220'

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
  const [downloadingId, setDownloadingId] = useState(null)

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

  async function handleDescargarFactura(factura) {
    try {
      setDownloadingId(factura.id)
      await descargarFacturaPdf(factura, resultado)
    } catch (err) {
      setError(`No se pudo generar el PDF de la factura: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleDescargarEstadoCuenta() {
    try {
      setDownloadingId('consolidado')
      await descargarEstadoCuentaPdf(resultado)
    } catch (err) {
      setError(`No se pudo generar el estado de cuenta en PDF: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const mensajeReportePago = resultado
    ? encodeURIComponent(
        `Hola, Junta del Acueducto Vereda El Tablazo (NIT 811.022.038-6). Soy ${resultado.titular} (${resultado.cedula}). Adjunto el comprobante de pago de mi factura por valor de ${money(resultado.totalAdeudado)}.`
      )
    : ''

  return (
    <div className="portal-inst">
      {/* Navbar Institucional con Logo y NIT */}
      <nav className="portal-inst__navbar">
        <div className="portal-inst__nav-inner">
          <div className="portal-inst__brand">
            <img
              src={logoAcueducto}
              alt="Logo Acueducto Vereda El Tablazo"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                padding: '3px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                flexShrink: 0,
              }}
            />
            <div>
              <span className="portal-inst__eyebrow">
                {'Gesti\u00f3n Comunitaria del Agua \u00b7 NIT 811.022.038-6'}
              </span>
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
            <span className="portal-inst__hero-tag">
              {'Oficina Virtual del Suscriptor \u00b7 NIT 811.022.038-6'}
            </span>
            <h2 className="portal-inst__hero-title">
              {'Consulta tu factura y mant\u00e9n al d\u00eda el agua de nuestra vereda'}
            </h2>
            <p className="portal-inst__hero-desc">
              {'Verifica tu estado de cuenta en segundos sin necesidad de contrase\u00f1as, descarga tus facturas en PDF y reporta tus transferencias directamente a Tesorer\u00eda.'}
            </p>
          </div>

          <aside className="portal-inst__hero-highlights">
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>{'Consulta r\u00e1pida con tu c\u00e9dula o nombre del predio registrado.'}</span>
            </div>
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>{'Descarga inmediata de facturas individuales y estado de cuenta en PDF.'}</span>
            </div>
            <div className="portal-inst__highlight-item">
              <span className="portal-inst__highlight-dot" />
              <span>{'Pagos por Nequi (310 530 1220) o Cuenta de Ahorros Bancolombia.'}</span>
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
              Digita tu <strong>{'n\u00famero de c\u00e9dula'}</strong> (o el nombre de tu predio/finca si es un registro antiguo) junto con los <strong>{'\u00faltimos 4 d\u00edgitos de tu celular'}</strong>.
            </p>
          </div>

          <form className="portal-search-form" onSubmit={handleConsultar}>
            <label className="portal-field">
              {'C\u00e9dula o nombre del predio'}
              <input
                type="text"
                required
                minLength={4}
                placeholder="Ej: 12345678 o Finca La Esperanza"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
              />
            </label>

            <label className="portal-field">
              {'\u00daltimos 4 d\u00edgitos celular'}
              <input
                type="text"
                maxLength={4}
                inputMode="numeric"
                placeholder="Ej: 4567"
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
            {(resultado.requiereActualizarDatos || resultado.requiereActualizarCelular) && (
              <div className="portal-alert portal-alert--warning">
                <strong>{'Actualizaci\u00f3n de censo recomendada:'}</strong>{' '}
                {'Tu ficha a\u00fan no tiene n\u00famero de celular o c\u00e9dula completos registrados. Por favor ac\u00e9rcate o escribe a la Junta para actualizar tus datos.'}
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
                      ? '\u00a1Est\u00e1s al d\u00eda con tu servicio de acueducto!'
                      : `Tienes ${resultado.cantidadFacturasPendientes} factura(s) pendiente(s)`}
                  </span>
                  <p className="portal-status-banner__amount">
                    {money(resultado.totalAdeudado)}
                  </p>
                </div>
                <div className="portal-status-banner__note">
                  {resultado.alDia
                    ? 'Gracias por tu pago oportuno; tu aporte sostiene la operaci\u00f3n y calidad del agua en nuestra comunidad.'
                    : 'Te invitamos a ponerte al d\u00eda con tu servicio de agua a trav\u00e9s de nuestros canales oficiales de recaudo.'}
                </div>
              </div>

              {resultado.facturasPendientes?.length > 0 && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      margin: '1.35rem 0 0.85rem',
                    }}
                  >
                    <h4 className="portal-section-heading" style={{ margin: 0 }}>
                      Detalle de facturas pendientes
                    </h4>

                    <button
                      type="button"
                      onClick={handleDescargarEstadoCuenta}
                      disabled={downloadingId === 'consolidado'}
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#0033A0',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '0.5rem 0.9rem',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {downloadingId === 'consolidado'
                        ? 'Generando PDF...'
                        : 'Descargar Estado de Cuenta (PDF)'}
                    </button>
                  </div>

                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Predio / Sector</th>
                          <th>Periodo</th>
                          <th>Vencimiento</th>
                          <th>Estado</th>
                          <th>Saldo a pagar</th>
                          <th>Factura PDF</th>
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
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDescargarFactura(f)}
                                disabled={downloadingId === f.id}
                                style={{
                                  backgroundColor: '#0033A0',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.42rem 0.78rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Descargar esta factura en formato PDF"
                              >
                                {downloadingId === f.id ? 'Generando...' : 'Descargar PDF'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Invitacion al pago y canales oficiales habilitados */}
              <div className="portal-payment-box">
                <h4>{'Te invitamos a realizar tu pago \u00b7 Canales oficiales de recaudo'}</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155' }}>
                  {'Tu aporte oportuno garantiza el mantenimiento de bocatomas, redes y agua limpia para toda la vereda. Puedes cancelar en efectivo en los puntos autorizados o mediante transferencia electr\u00f3nica:'}
                </p>
                <div className="portal-payment-grid">
                  <div className="portal-payment-item">
                    <strong style={{ color: '#0033A0', fontSize: '0.95rem' }}>
                      {'Nequi Oficial Tesorer\u00eda'}
                    </strong>
                    <div
                      style={{
                        marginTop: '0.3rem',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: '0.02em',
                      }}
                    >
                      310 530 1220
                    </div>
                    <div style={{ marginTop: '0.15rem', fontSize: '0.8rem', color: '#475569' }}>
                      {'Transferencia inmediata sin costo'}
                    </div>
                  </div>
                  <div className="portal-payment-item">
                    <strong style={{ color: '#0033A0', fontSize: '0.95rem' }}>
                      Cuenta de Ahorros Bancolombia
                    </strong>
                    <div
                      style={{
                        marginTop: '0.3rem',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: '0.02em',
                      }}
                    >
                      10172699002
                    </div>
                    <div style={{ marginTop: '0.15rem', fontSize: '0.8rem', color: '#475569' }}>
                      {'Cuenta habilitada para el recaudo del Acueducto Vereda El Tablazo'}
                    </div>
                  </div>
                </div>
                <a
                  className="portal-whatsapp-btn"
                  href={`https://wa.me/${TELEFONO_TESORERIA}?text=${mensajeReportePago}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Reportar comprobante de pago por WhatsApp (310 530 1220)
                </a>
              </div>
            </section>

            {resultado.ultimosPagos?.length > 0 && (
              <section className="portal-card">
                <h4 className="portal-section-heading" style={{ marginTop: 0 }}>
                  {'Historial de \u00faltimos pagos aplicados'}
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

        {/* Secci\u00f3n Informativa Institucional con las im\u00e1genes del repositorio */}
        <section className="portal-gallery">
          <div className="portal-gallery__header">
            <h3 className="portal-gallery__title">Compromiso con nuestra comunidad</h3>
            <span style={{ fontSize: '0.88rem', color: '#475569' }}>
              {'Transparencia, conservaci\u00f3n h\u00eddrica y servicio continuo'}
            </span>
          </div>

          <div className="portal-gallery__grid">
            <article className="portal-info-card">
              <img
                src={img1}
                alt={'Protecci\u00f3n de fuentes h\u00eddricas Vereda El Tablazo'}
                className="portal-info-card__img"
              />
              <div className="portal-info-card__body">
                <span className="portal-info-card__tag">Cuidado del Agua</span>
                <h4 className="portal-info-card__title">{'Protecci\u00f3n de nacimientos'}</h4>
                <p className="portal-info-card__text">
                  {'Cada recaudo se invierte directamente en la conservaci\u00f3n de nuestras microcuencas y el mantenimiento preventivo de bocatomas.'}
                </p>
              </div>
            </article>

            <article className="portal-info-card">
              <img
                src={img2}
                alt={'Infraestructura y red de distribuci\u00f3n del acueducto'}
                className="portal-info-card__img"
              />
              <div className="portal-info-card__body">
                <span className="portal-info-card__tag">Infraestructura</span>
                <h4 className="portal-info-card__title">{'Red de distribuci\u00f3n veredal'}</h4>
                <p className="portal-info-card__text">
                  {'Trabajamos permanentemente en la mejora de redes, v\u00e1lvulas y tanques de almacenamiento para garantizar continuidad en cada sector.'}
                </p>
              </div>
            </article>

            <article className="portal-info-card">
              <img
                src={img3}
                alt={'Atenci\u00f3n al suscriptor y recaudo oportuno'}
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
        <strong>Acueducto Vereda El Tablazo</strong> {'\u00b7'} NIT 811.022.038-6 {'\u00b7'} Junta Administradora Comunitaria
      </footer>
    </div>
  )
}

export default ConsultaSuscriptorPage