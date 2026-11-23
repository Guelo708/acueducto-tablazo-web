import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import logoAcueducto from '../../assets/logo-acueducto.png'
import './ReciboModal.css'

const money = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v || 0)

function ReciboModal({ pago, onClose }) {
  if (!pago) return null

  const firma = pago.codigoVerificacion || 'SIN-FIRMA'
  const urlVerificacion = `${window.location.origin}/verificar-recibo?id=${pago.id}&firma=${encodeURIComponent(firma)}`
  const periodo = `${String(pago.mesFactura || '').padStart(2, '0')}/${pago.anioFactura || ''}`

  const mensajeWhatsApp = encodeURIComponent(
    `Comprobante Oficial de Pago *#${pago.id}* - *Acueducto Vereda El Tablazo* (NIT 811.022.038-6)\n\n` +
      `Suscriptor: *${pago.nombrePropietario}*\n` +
      `Predio: *${pago.codigoPredio}*\n` +
      `Periodo: *${periodo}*\n` +
      `Valor pagado: *${money(pago.valorPagado)}*\n` +
      `Fecha: *${pago.fechaPago}*\n` +
      `Sello digital: *${firma}*\n\n` +
      `Verifica la autenticidad de este recibo aqu\u00ed:\n${urlVerificacion}`
  )

  return (
    <div className="recibo-overlay" onClick={onClose}>
      <div
        id="recibo-imprimible"
        className="recibo-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recibo-sheet">
          <header className="recibo-sheet__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src={logoAcueducto}
                alt="Logo Acueducto Vereda El Tablazo"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                  backgroundColor: '#ffffff',
                  padding: '3px',
                  flexShrink: 0,
                }}
              />
              <div>
                <span className="recibo-sheet__badge">Comprobante Oficial</span>
                <h2 className="recibo-sheet__title">Acueducto Vereda El Tablazo</h2>
                <small style={{ color: '#e0f2fe', display: 'block' }}>
                  NIT 811.022.038-6 {'\u00b7'} Junta Administradora Comunitaria
                </small>
              </div>
            </div>
            <div className="recibo-sheet__num">
              <span>Recibo N.{'\u00b0'}</span>
              <strong>#{String(pago.id).padStart(5, '0')}</strong>
            </div>
          </header>

          <div className="recibo-sheet__body">
            <div className="recibo-sheet__amount-box">
              <span>Valor Recibido</span>
              <strong>{money(pago.valorPagado)}</strong>
            </div>

            <dl className="recibo-sheet__grid">
              <div className="recibo-sheet__field">
                <dt>Suscriptor Titular</dt>
                <dd>{pago.nombrePropietario}</dd>
              </div>
              <div className="recibo-sheet__field">
                <dt>{'Documento / C\u00e9dula'}</dt>
                <dd>{pago.cedulaPropietario}</dd>
              </div>
              <div className="recibo-sheet__field">
                <dt>{'C\u00f3digo de Predio'}</dt>
                <dd>{pago.codigoPredio}</dd>
              </div>
              <div className="recibo-sheet__field">
                <dt>Periodo Facturado</dt>
                <dd>{periodo}</dd>
              </div>
              <div className="recibo-sheet__field">
                <dt>Fecha de Pago</dt>
                <dd>{pago.fechaPago}</dd>
              </div>
              <div className="recibo-sheet__field">
                <dt>{'M\u00e9todo / Estado'}</dt>
                <dd>
                  {pago.metodoPago?.replaceAll('_', ' ')} {'\u00b7'} {pago.estadoFactura}
                </dd>
              </div>
              {pago.observacion && (
                <div className="recibo-sheet__field" style={{ gridColumn: '1 / -1' }}>
                  <dt>{'Observaci\u00f3n'}</dt>
                  <dd>{pago.observacion}</dd>
                </div>
              )}
            </dl>

            <div className="recibo-sheet__qr-section">
              <div className="recibo-sheet__qr-box">
                <QRCodeSVG
                  value={urlVerificacion}
                  size={104}
                  fgColor="#0033A0"
                  bgColor="#FFFFFF"
                  level="M"
                />
              </div>
              <div className="recibo-sheet__security-info">
                <strong style={{ color: '#0033A0', display: 'block', marginBottom: '0.2rem' }}>
                  {'Recibo protegido contra falsificaci\u00f3n'}
                </strong>
                {'Escanea el c\u00f3digo QR con la c\u00e1mara de tu celular para validar este pago en tiempo real contra los registros oficiales del acueducto.'}
                <div>
                  <span className="recibo-sheet__hash">HMAC: {firma}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="recibo-actions">
          <button
            type="button"
            className="recibo-btn recibo-btn--close"
            onClick={onClose}
          >
            Cerrar
          </button>
          <Link
            to={`/verificar-recibo?id=${pago.id}&firma=${encodeURIComponent(firma)}`}
            target="_blank"
            className="recibo-btn"
            style={{ background: '#00AEC7', color: '#00226B' }}
          >
            {'Probar verificaci\u00f3n'}
          </Link>
          <a
            href={`https://wa.me/?text=${mensajeWhatsApp}`}
            target="_blank"
            rel="noreferrer"
            className="recibo-btn recibo-btn--whatsapp"
          >
            Enviar por WhatsApp
          </a>
          <button
            type="button"
            className="recibo-btn recibo-btn--print"
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ReciboModal