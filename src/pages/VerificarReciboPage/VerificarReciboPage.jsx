import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verificarReciboPublico } from '../../services/consultaPublicaService.js'
import '../ConsultaSuscriptorPage/ConsultaSuscriptorPage.css'

const money = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v || 0)

function VerificarReciboPage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const firma = searchParams.get('firma')

  const [estado, setEstado] = useState({ loading: true, data: null, error: '' })

  useEffect(() => {
    let active = true

    async function validar() {
      if (!id || !firma) {
        if (active) {
          setEstado({
            loading: false,
            data: null,
            error: 'El enlace del código QR está incompleto. Faltan parámetros de verificación.',
          })
        }
        return
      }

      try {
        const res = await verificarReciboPublico({ id, firma })
        if (active) {
          setEstado({ loading: false, data: res, error: '' })
        }
      } catch (err) {
        if (active) {
          setEstado({ loading: false, data: null, error: err.message })
        }
      }
    }

    validar()
    return () => {
      active = false
    }
  }, [id, firma])

  const res = estado.data

  return (
    <div className="portal-inst">
      <nav className="portal-inst__navbar">
        <div className="portal-inst__nav-inner">
          <div className="portal-inst__brand">
            <div className="portal-inst__logo-drop">AT</div>
            <div>
              <span className="portal-inst__eyebrow">Verificación Oficial</span>
              <h1 className="portal-inst__brand-title">Acueducto Vereda El Tablazo</h1>
            </div>
          </div>
          <Link to="/consulta" className="portal-inst__admin-btn">
            Consultar Cartera
          </Link>
        </div>
      </nav>

      <main className="portal-inst__main" style={{ marginTop: '2rem' }}>
        <section className="portal-card portal-card--search">
          <div className="portal-card__header">
            <h2 className="portal-card__title">Validación de Autenticidad de Comprobante</h2>
            <p className="portal-card__subtitle">
              Verificación criptográfica en tiempo real contra los registros oficiales de recaudo de la Junta Administradora.
            </p>
          </div>

          {estado.loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#0033A0', fontWeight: 700 }}>
              Verificando firma digital del recibo...
            </div>
          )}

          {estado.error && (
            <div className="portal-alert portal-alert--error">{estado.error}</div>
          )}

          {!estado.loading && res && (
            <>
              <div
                className={`portal-status-banner ${
                  res.valido ? 'portal-status-banner--ok' : 'portal-status-banner--debt'
                }`}
              >
                <div>
                  <span className="portal-status-banner__label">
                    {res.valido
                      ? '✓ RECIBO AUTÉNTICO Y VERIFICADO'
                      : '✕ COMPROBANTE NO VÁLIDO O ALTERADO'}
                  </span>
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.95rem' }}>
                    {res.mensaje}
                  </p>
                </div>
              </div>

              {res.valido && (
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <tbody>
                      <tr>
                        <th>Número de Recibo</th>
                        <td>
                          <strong>#{String(res.numeroRecibo).padStart(5, '0')}</strong>
                        </td>
                      </tr>
                      <tr>
                        <th>Sello Digital HMAC</th>
                        <td>
                          <code>{res.codigoVerificacion}</code>
                        </td>
                      </tr>
                      <tr>
                        <th>Suscriptor Titular</th>
                        <td>
                          <strong>{res.titular}</strong> ({res.cedulaEnmascarada})
                        </td>
                      </tr>
                      <tr>
                        <th>Predio</th>
                        <td>
                          {res.codigoPredio} · {res.nombrePredio}
                        </td>
                      </tr>
                      <tr>
                        <th>Periodo Pagado</th>
                        <td>
                          {String(res.mesFactura).padStart(2, '0')}/{res.anioFactura}
                        </td>
                      </tr>
                      <tr>
                        <th>Valor Pagado</th>
                        <td>
                          <strong style={{ color: '#0033A0', fontSize: '1.1rem' }}>
                            {money(res.valorPagado)}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <th>Fecha y Medio de Pago</th>
                        <td>
                          {res.fechaPago} · {res.metodoPago?.replaceAll('_', ' ')}
                        </td>
                      </tr>
                      <tr>
                        <th>Estado Actual Factura</th>
                        <td>
                          <strong>{res.estadoFactura}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="portal-inst__footer">
        <strong>Acueducto Vereda El Tablazo</strong> · Sistema de Verificación Digital
      </footer>
    </div>
  )
}

export default VerificarReciboPage