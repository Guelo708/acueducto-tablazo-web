import { useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarEstadoCuentaPublico } from '../../services/consultaPublicaService.js'
import './ConsultaSuscriptorPage.css'

const TELEFONO_TESORERIA = '573000000000' // TODO: Reemplazar con el número oficial de WhatsApp de la Junta

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
    <div className="portal-publico">
      <div className="portal-publico__container">
        <header className="portal-publico__topbar">
          <div className="portal-publico__brand">
            <span className="portal-publico__badge">Portal Comunitario</span>
            <h1 className="portal-publico__title">Acueducto Vereda El Tablazo</h1>
          </div>
          <Link to="/login" className="portal-publico__admin-link">
            Acceso Junta
          </Link>
        </header>

        <section className="portal-card">
          <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem' }}>
            Consulta tu estado de cuenta
          </h2>
          <p className="portal-card__subtitle">
            Ingresa tu <strong>número de cédula</strong> (o el nombre de tu finca/predio si es un registro antiguo) y los <strong>últimos 4 dígitos de tu celular</strong>.
          </p>

          <form className="portal-search-form" onSubmit={handleConsultar}>
            <label className="portal-field">
              Cédula o nombre del predio
              <input
                type="text"
                required
                minLength={4}
                placeholder="Ej: 71234567 o Finca El Mirador"
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
                placeholder="Ej: 7890"
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
              {loading ? 'Consultando...' : 'Consultar'}
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
                <strong>Aviso importante:</strong> Tu ficha aún no tiene número de celular o cédula completos registrados. Por favor acércate o escribe a la Junta para actualizar tus datos y proteger tu cuenta.
              </div>
            )}

            <section className="portal-card">
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Suscriptor titular
                </span>
                <h3 style={{ margin: '0.15rem 0', fontSize: '1.2rem' }}>
                  {resultado.titular}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
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
                  <strong>
                    {resultado.alDia
                      ? '¡Estás al día con tu servicio de acueducto!'
                      : `Tienes ${resultado.cantidadFacturasPendientes} factura(s) pendiente(s)`}
                  </strong>
                  <p className="portal-status-banner__amount">
                    {money(resultado.totalAdeudado)}
                  </p>
                </div>
                <div style={{ fontSize: '0.88rem', maxWidth: '260px' }}>
                  {resultado.alDia
                    ? 'Gracias por tu pago oportuno, ayuda al mantenimiento de nuestra red veredal.'
                    : 'Realiza tu pago a tiempo para evitar recargos o suspensión del servicio.'}
                </div>
              </div>

              {resultado.facturasPendientes?.length > 0 && (
                <>
                  <h4 style={{ margin: '1.25rem 0 0.65rem' }}>
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
                              <strong>{money(f.saldoPendiente)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="portal-payment-box">
                    <h4>¿Cómo pagar tu factura?</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                      Puedes pagar en efectivo en los puntos de recaudo de la vereda o transferir a las cuentas oficiales de la Junta Administradora:
                    </p>
                    <div className="portal-payment-grid">
                      <div className="portal-payment-item">
                        <strong>Nequi / Daviplata Oficial</strong>
                        <div>Consulta el número autorizado con Tesorería</div>
                      </div>
                      <div className="portal-payment-item">
                        <strong>Cuenta Bancaria Junta</strong>
                        <div>Acueducto Vereda El Tablazo</div>
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
                <h4 style={{ margin: '0 0 0.75rem' }}>Últimos pagos registrados</h4>
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Fecha pago</th>
                        <th>Periodo factura</th>
                        <th>Medio</th>
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
                          <td>{money(p.valorPagado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ConsultaSuscriptorPage