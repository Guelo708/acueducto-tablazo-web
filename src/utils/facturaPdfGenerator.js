import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import logoAcueducto from '../assets/logo-acueducto.png'
import barlow600Url from '../assets/fonts/Barlow-600.ttf'
import barlow700Url from '../assets/fonts/Barlow-700.ttf'
import barlow800Url from '../assets/fonts/Barlow-800.ttf'
import roboto400Url from '../assets/fonts/Roboto-400.ttf'
import roboto500Url from '../assets/fonts/Roboto-500.ttf'
import roboto700Url from '../assets/fonts/Roboto-700.ttf'

const NIT_ACUEDUCTO = 'NIT 811.022.038-6'
const NEQUI_OFICIAL = '310 530 1220'
const CUENTA_BANCOLOMBIA = '10172699002'

// Paleta institucional sobria y ejecutiva
const COLORS = {
  primary: [0, 51, 160],         // #0033A0
  primaryDark: [0, 34, 107],     // #00226B
  secondary: [0, 174, 199],      // #00AEC7
  surfaceSoft: [238, 244, 252],  // #EEF4FC
  surfaceTint: [248, 250, 252],  // #F8FAFC
  text: [15, 23, 42],            // #0F172A
  textSecondary: [51, 65, 85],   // #334155
  textMuted: [100, 116, 139],    // #64748B
  border: [203, 213, 225],       // #CBD5E1
  borderLight: [226, 232, 240],  // #E2E8F0
  white: [255, 255, 255],
  success: [21, 128, 61],        // #15803D
  successBg: [240, 253, 244],
  successBorder: [187, 247, 208],
  warning: [180, 83, 9],         // #B45309
  warningBg: [255, 251, 235],
  warningBorder: [253, 230, 138],
  danger: [185, 28, 28],         // #B91C1C
  dangerBg: [254, 242, 242],
  dangerBorder: [254, 202, 202],
}

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatPeriodo = (mes, anio) =>
  `${String(mes || '').padStart(2, '0')}/${anio || ''}`

async function cargarLogoDataUrl() {
  try {
    const response = await fetch(logoAcueducto)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function fetchFontBase64(url) {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function registrarTipografiaInstitucional(doc) {
  try {
    const [b600, b700, b800, r400, r500, r700] = await Promise.all([
      fetchFontBase64(barlow600Url),
      fetchFontBase64(barlow700Url),
      fetchFontBase64(barlow800Url),
      fetchFontBase64(roboto400Url),
      fetchFontBase64(roboto500Url),
      fetchFontBase64(roboto700Url),
    ])

    doc.addFileToVFS('Barlow-SemiBold.ttf', b600)
    doc.addFont('Barlow-SemiBold.ttf', 'Barlow', 'normal')

    doc.addFileToVFS('Barlow-Bold.ttf', b700)
    doc.addFont('Barlow-Bold.ttf', 'Barlow', 'bold')

    doc.addFileToVFS('Barlow-ExtraBold.ttf', b800)
    doc.addFont('Barlow-ExtraBold.ttf', 'BarlowHeavy', 'bold')

    doc.addFileToVFS('Roboto-Regular.ttf', r400)
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')

    doc.addFileToVFS('Roboto-Medium.ttf', r500)
    doc.addFont('Roboto-Medium.ttf', 'RobotoMedium', 'normal')

    doc.addFileToVFS('Roboto-Bold.ttf', r700)
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')

    return {
      heading: 'Barlow',
      headingHeavy: 'BarlowHeavy',
      body: 'Roboto',
      bodyMedium: 'RobotoMedium',
    }
  } catch {
    return {
      heading: 'helvetica',
      headingHeavy: 'helvetica',
      body: 'helvetica',
      bodyMedium: 'helvetica',
    }
  }
}

export async function descargarFacturaPdf(factura, contexto = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const fonts = await registrarTipografiaInstitucional(doc)
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const logoDataUrl = await cargarLogoDataUrl()

  const titular = factura.nombrePropietario || contexto.titular || 'Suscriptor Titular'
  const cedula = factura.cedulaPropietario || contexto.cedula || 'No registrada'
  const predioLabel = factura.codigoPredio
    ? `${factura.codigoPredio}${factura.nombrePredio ? ` - ${factura.nombrePredio}` : ''}`
    : factura.nombrePredio || 'Predio registrado'
  const sectorLabel = factura.sector || factura.tipoPredio || 'Vereda El Tablazo'
  const periodo = formatPeriodo(factura.mes, factura.anio)
  const valorFactura = Number(factura.valorFactura ?? 0)
  const totalAbonado = Number(factura.totalAbonado ?? 0)
  const saldoPendiente =
    factura.saldoPendiente !== undefined && factura.saldoPendiente !== null
      ? Number(factura.saldoPendiente)
      : factura.estado === 'PAGADA'
        ? 0
        : valorFactura
  const estado = factura.estado || 'PENDIENTE'
  const portalUrl = `${window.location.origin}/consulta`

  // 1. ENCABEZADO INSTITUCIONAL SOBRIO
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 36, 'F')

  doc.setFillColor(...COLORS.secondary)
  doc.rect(0, 36, pageWidth, 1.4, 'F')

  let textStartX = margin
  if (logoDataUrl) {
    doc.setFillColor(...COLORS.white)
    doc.roundedRect(margin, 5.5, 25, 25, 2.5, 2.5, 'F')
    doc.addImage(logoDataUrl, 'PNG', margin + 1.5, 7, 22, 22)
    textStartX = margin + 30
  }

  doc.setTextColor(186, 230, 253)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.6)
  doc.text('JUNTA ADMINISTRADORA COMUNITARIA', textStartX, 11)

  doc.setTextColor(...COLORS.white)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(16.5)
  doc.text('Acueducto Vereda El Tablazo', textStartX, 18.5)

  doc.setTextColor(224, 242, 254)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(9.2)
  doc.text(NIT_ACUEDUCTO, textStartX, 24.5)

  doc.setTextColor(203, 213, 225)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(8.2)
  doc.text('Documento de Cobro y Estado Individual de Facturaci\u00f3n', textStartX, 30.5)

  // Cuadro número de factura sobrio
  doc.setFillColor(...COLORS.primaryDark)
  doc.setDrawColor(96, 165, 250)
  doc.setLineWidth(0.3)
  doc.roundedRect(pageWidth - margin - 40, 8, 40, 20, 2, 2, 'FD')

  doc.setTextColor(186, 230, 253)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('FACTURA N.\u00b0', pageWidth - margin - 20, 14, { align: 'center' })

  doc.setTextColor(...COLORS.white)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(12)
  doc.text(`#${String(factura.id || 0).padStart(5, '0')}`, pageWidth - margin - 20, 23, {
    align: 'center',
  })

  // 2. FICHA EJECUTIVA DEL SUSCRIPTOR Y PREDIO
  let y = 44
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'FD')

  // Franja de título interna sutil
  doc.setFillColor(...COLORS.surfaceTint)
  doc.roundedRect(margin + 0.3, y + 0.3, contentWidth - 0.6, 9, 1.8, 1.8, 'F')
  doc.rect(margin + 0.3, y + 5, contentWidth - 0.6, 4.3, 'F')

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.8)
  doc.text('DATOS DEL SUSCRIPTOR Y DEL PREDIO', margin + 5, y + 6.3)

  doc.setDrawColor(...COLORS.borderLight)
  doc.setLineWidth(0.3)
  doc.line(margin, y + 9.5, pageWidth - margin, y + 9.5)

  // Divisor vertical sutil entre columnas de datos
  const colSplitX = margin + 104
  doc.line(colSplitX, y + 12.5, colSplitX, y + 36.5)

  // Fila 1
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.setTextColor(...COLORS.textMuted)
  doc.text('SUSCRIPTOR TITULAR', margin + 5, y + 15.5)
  doc.text('DOCUMENTO / C\u00c9DULA', colSplitX + 5, y + 15.5)

  doc.setTextColor(...COLORS.text)
  doc.setFont(fonts.body, 'bold')
  doc.setFontSize(10)
  doc.text(String(titular).slice(0, 42), margin + 5, y + 21)
  doc.text(String(cedula), colSplitX + 5, y + 21)

  // Fila 2
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.setTextColor(...COLORS.textMuted)
  doc.text('PREDIO / FINCA', margin + 5, y + 28.5)
  doc.text('SECTOR / CATEGOR\u00cdA', colSplitX + 5, y + 28.5)

  doc.setTextColor(...COLORS.text)
  doc.setFont(fonts.body, 'bold')
  doc.setFontSize(10)
  doc.text(String(predioLabel).slice(0, 42), margin + 5, y + 34)
  doc.text(String(sectorLabel).slice(0, 32), colSplitX + 5, y + 34)

  // 3. TRES TARJETAS DE RESUMEN SOBRIAS Y EQUILIBRADAS
  y += 46
  const colW = (contentWidth - 8) / 3

  // Tarjeta 1: Periodo Facturado
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, colW, 21, 2, 2, 'FD')

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('PERIODO FACTURADO', margin + colW / 2, y + 6.8, { align: 'center' })

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(13)
  doc.text(periodo, margin + colW / 2, y + 15.6, { align: 'center' })

  // Tarjeta 2: Fecha Límite de Pago
  const box2X = margin + colW + 4
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(box2X, y, colW, 21, 2, 2, 'FD')

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('FECHA L\u00cdMITE DE PAGO', box2X + colW / 2, y + 6.8, { align: 'center' })

  doc.setTextColor(...COLORS.text)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(12.2)
  doc.text(String(factura.fechaVencimiento || 'No definida'), box2X + colW / 2, y + 15.6, {
    align: 'center',
  })

  // Tarjeta 3: Estado Actual con píldora refinada
  const box3X = margin + (colW + 4) * 2
  const isPaid = estado === 'PAGADA'
  const isOverdue = estado === 'VENCIDA'
  const stAccent = isPaid ? COLORS.success : isOverdue ? COLORS.danger : COLORS.warning
  const stBg = isPaid ? COLORS.successBg : isOverdue ? COLORS.dangerBg : COLORS.warningBg
  const stBorder = isPaid
    ? COLORS.successBorder
    : isOverdue
      ? COLORS.dangerBorder
      : COLORS.warningBorder

  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(box3X, y, colW, 21, 2, 2, 'FD')

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('ESTADO ACTUAL', box3X + colW / 2, y + 6.8, { align: 'center' })

  const pillW = colW - 16
  doc.setFillColor(...stBg)
  doc.setDrawColor(...stBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(box3X + 8, y + 9.6, pillW, 7.8, 1.8, 1.8, 'FD')

  doc.setTextColor(...stAccent)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(10.8)
  doc.text(estado, box3X + colW / 2, y + 15.1, { align: 'center' })

  // 4. DETALLE DE LIQUIDACIÓN CON ESTRUCTURA FINANCIERA LIMPIA
  y += 27
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD')

  // Encabezado de tabla redondeado arriba
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(margin, y, contentWidth, 8.8, 2, 2, 'F')
  doc.rect(margin, y + 4.5, contentWidth, 4.3, 'F')

  doc.setTextColor(...COLORS.white)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.8)
  doc.text('CONCEPTO DEL SERVICIO', margin + 5, y + 5.9)
  doc.text('VALOR', pageWidth - margin - 5, y + 5.9, { align: 'right' })

  // Fila 1
  const bodyY = y + 8.8
  doc.setTextColor(...COLORS.text)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(9.5)
  doc.text(`Cargo fijo servicio de acueducto comunitario \u00b7 Periodo ${periodo}`, margin + 5, bodyY + 7.2)
  doc.setFont(fonts.bodyMedium, 'normal')
  doc.text(formatMoney(valorFactura), pageWidth - margin - 5, bodyY + 7.2, { align: 'right' })

  doc.setDrawColor(...COLORS.borderLight)
  doc.setLineWidth(0.25)
  doc.line(margin + 5, bodyY + 10.6, pageWidth - margin - 5, bodyY + 10.6)

  // Fila 2
  doc.setTextColor(...COLORS.textSecondary)
  doc.setFont(fonts.body, 'normal')
  doc.text('Abonos registrados a la fecha', margin + 5, bodyY + 16.2)
  doc.text(`- ${formatMoney(totalAbonado)}`, pageWidth - margin - 5, bodyY + 16.2, { align: 'right' })

  // Fila Total: cierre limpio con línea superior institucional
  const totalY = bodyY + 20.2
  doc.setFillColor(...COLORS.surfaceSoft)
  doc.roundedRect(margin + 0.3, totalY, contentWidth - 0.6, 12.7, 1.8, 1.8, 'F')
  doc.rect(margin + 0.3, totalY, contentWidth - 0.6, 4, 'F')

  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.45)
  doc.line(margin, totalY, pageWidth - margin, totalY)

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(10.2)
  doc.text('TOTAL SALDO A PAGAR', margin + 5, totalY + 8.2)

  doc.setTextColor(...COLORS.primary)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(13.8)
  doc.text(formatMoney(saldoPendiente), pageWidth - margin - 5, totalY + 8.5, { align: 'right' })

  // 5. BLOQUE CANALES OFICIALES DE PAGO + QR (Alineación en 2 columnas)
  y += 48
  doc.setFillColor(...COLORS.surfaceTint)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, contentWidth, 49, 2, 2, 'FD')

  // Marco blanco limpio para el QR
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.borderLight)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin + 5.5, y + 7.5, 34, 34, 2, 2, 'FD')

  const qrDataUrl = await QRCode.toDataURL(portalUrl, {
    width: 240,
    margin: 1,
    color: { dark: '#00226B', light: '#FFFFFF' },
  })
  doc.addImage(qrDataUrl, 'PNG', margin + 7, y + 9, 31, 31)

  const infoX = margin + 45
  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(9.2)
  doc.text('TE INVITAMOS A REALIZAR TU PAGO OPORTUNO EN ESTOS CANALES', infoX, y + 8.5)

  doc.setDrawColor(...COLORS.borderLight)
  doc.setLineWidth(0.3)
  doc.line(infoX, y + 10.8, pageWidth - margin - 5, y + 10.8)

  // Dos columnas limpias para Nequi y Bancolombia (sin espacios muertos)
  const ch2X = infoX + 64
  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('NEQUI OFICIAL TESORER\u00cdA', infoX, y + 16.2)
  doc.text('CUENTA DE AHORROS BANCOLOMBIA', ch2X, y + 16.2)

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(11)
  doc.text(NEQUI_OFICIAL, infoX, y + 21.5)
  doc.text(CUENTA_BANCOLOMBIA, ch2X, y + 21.5)

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(7.8)
  doc.text('Cuenta habilitada por la Junta para el recaudo del servicio de agua.', infoX, y + 27.2)

  doc.setDrawColor(...COLORS.borderLight)
  doc.line(infoX, y + 29.8, pageWidth - margin - 5, y + 29.8)

  doc.setTextColor(...COLORS.textSecondary)
  doc.setFont(fonts.bodyMedium, 'normal')
  doc.setFontSize(8.2)
  doc.text(`Env\u00eda tu comprobante al WhatsApp ${NEQUI_OFICIAL} o consulta en:`, infoX, y + 35)

  doc.setTextColor(...COLORS.primary)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.5)
  doc.text(portalUrl, infoX, y + 39.8)

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(7.6)
  doc.text(`Documento de consulta: ${cedula} (ingresa los \u00faltimos 4 d\u00edgitos de tu celular)`, infoX, y + 44.6)

  // 6. PIE DE PÁGINA SOBRIO
  const footerY = doc.internal.pageSize.getHeight() - 12
  doc.setDrawColor(...COLORS.borderLight)
  doc.setLineWidth(0.35)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.2)
  doc.text(
    `Acueducto Vereda El Tablazo \u00b7 ${NIT_ACUEDUCTO} \u00b7 Junta Administradora Comunitaria`,
    pageWidth / 2,
    footerY,
    { align: 'center' },
  )

  const safePeriodo = periodo.replace('/', '-')
  const safeId = String(factura.id || '0').padStart(4, '0')
  doc.save(`Factura_Acueducto_El_Tablazo_${safePeriodo}_N${safeId}.pdf`)
}

export async function descargarEstadoCuentaPdf(resultado) {
  if (!resultado) return
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const fonts = await registrarTipografiaInstitucional(doc)
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const portalUrl = `${window.location.origin}/consulta`
  const logoDataUrl = await cargarLogoDataUrl()

  // 1. ENCABEZADO INSTITUCIONAL SOBRIO
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 36, 'F')
  doc.setFillColor(...COLORS.secondary)
  doc.rect(0, 36, pageWidth, 1.4, 'F')

  let textStartX = margin
  if (logoDataUrl) {
    doc.setFillColor(...COLORS.white)
    doc.roundedRect(margin, 5.5, 25, 25, 2.5, 2.5, 'F')
    doc.addImage(logoDataUrl, 'PNG', margin + 1.5, 7, 22, 22)
    textStartX = margin + 30
  }

  doc.setTextColor(186, 230, 253)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.6)
  doc.text('ESTADO DE CUENTA CONSOLIDADO \u00b7 SERVICIO DE ACUEDUCTO', textStartX, 11)

  doc.setTextColor(...COLORS.white)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(16.5)
  doc.text('Acueducto Vereda El Tablazo', textStartX, 18.5)

  doc.setTextColor(224, 242, 254)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(9.2)
  doc.text(NIT_ACUEDUCTO, textStartX, 24.5)

  doc.setTextColor(203, 213, 225)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(8.2)
  doc.text(`Fecha de emisi\u00f3n: ${new Date().toLocaleDateString('es-CO')}`, textStartX, 30.5)

  // 2. RESUMEN DEL TITULAR EQUILIBRADO
  let y = 44
  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, contentWidth, 23, 2, 2, 'FD')

  doc.setFillColor(...COLORS.surfaceSoft)
  doc.roundedRect(pageWidth - margin - 54, y + 0.3, 53.7, 22.4, 1.8, 1.8, 'F')
  doc.rect(pageWidth - margin - 54, y + 0.3, 4, 22.4, 'F')
  doc.setDrawColor(...COLORS.border)
  doc.line(pageWidth - margin - 54, y, pageWidth - margin - 54, y + 23)

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('SUSCRIPTOR TITULAR', margin + 5, y + 6.8)
  doc.text('DOCUMENTO', margin + 92, y + 6.8)

  doc.setTextColor(...COLORS.text)
  doc.setFont(fonts.body, 'bold')
  doc.setFontSize(10.2)
  doc.text(String(resultado.titular || '').slice(0, 38), margin + 5, y + 15.5)
  doc.text(String(resultado.cedula || ''), margin + 92, y + 15.5)

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('TOTAL ADEUDADO', pageWidth - margin - 5, y + 6.8, { align: 'right' })

  doc.setTextColor(...COLORS.primary)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(13.2)
  doc.text(formatMoney(resultado.totalAdeudado), pageWidth - margin - 5, y + 16.2, { align: 'right' })

  // 3. TABLA DE FACTURAS PENDIENTES
  y += 29
  doc.setFillColor(...COLORS.primary)
  doc.roundedRect(margin, y, contentWidth, 8.5, 2, 2, 'F')
  doc.rect(margin, y + 4.5, contentWidth, 4, 'F')

  doc.setTextColor(...COLORS.white)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.5)
  doc.text('PREDIO / SECTOR', margin + 4, y + 5.7)
  doc.text('PERIODO', margin + 82, y + 5.7)
  doc.text('VENCIMIENTO', margin + 106, y + 5.7)
  doc.text('ESTADO', margin + 136, y + 5.7)
  doc.text('SALDO', pageWidth - margin - 4, y + 5.7, { align: 'right' })

  y += 8.5
  const facturas = resultado.facturasPendientes || []
  facturas.forEach((f, idx) => {
    if (y > 218) {
      doc.addPage()
      y = 20
    }
    doc.setFillColor(...(idx % 2 === 1 ? COLORS.surfaceTint : COLORS.white))
    doc.rect(margin, y, contentWidth, 8.6, 'F')
    doc.setDrawColor(...COLORS.borderLight)
    doc.setLineWidth(0.25)
    doc.line(margin, y + 8.6, pageWidth - margin, y + 8.6)

    doc.setTextColor(...COLORS.text)
    doc.setFont(fonts.body, 'normal')
    doc.setFontSize(8.5)
    doc.text(`${f.nombrePredio || ''} (${f.sector || ''})`.slice(0, 40), margin + 4, y + 5.7)
    doc.setFont(fonts.bodyMedium, 'normal')
    doc.text(formatPeriodo(f.mes, f.anio), margin + 82, y + 5.7)
    doc.setFont(fonts.body, 'normal')
    doc.text(String(f.fechaVencimiento || ''), margin + 106, y + 5.7)

    const isVenc = f.estado === 'VENCIDA'
    doc.setTextColor(...(isVenc ? COLORS.danger : COLORS.warning))
    doc.setFont(fonts.heading, 'bold')
    doc.text(String(f.estado || ''), margin + 136, y + 5.7)

    doc.setTextColor(...COLORS.text)
    doc.setFont(fonts.headingHeavy, 'bold')
    doc.text(formatMoney(f.saldoPendiente), pageWidth - margin - 4, y + 5.7, { align: 'right' })
    y += 8.6
  })

  // 4. BLOQUE INVITACIÓN AL PAGO + CANALES OFICIALES + QR
  if (y > 200) {
    doc.addPage()
    y = 20
  }
  y += 8
  doc.setFillColor(...COLORS.surfaceTint)
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.35)
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'FD')

  doc.setFillColor(...COLORS.white)
  doc.setDrawColor(...COLORS.borderLight)
  doc.roundedRect(margin + 5.5, y + 7, 33, 33, 2, 2, 'FD')

  const qrDataUrl = await QRCode.toDataURL(portalUrl, {
    width: 200,
    margin: 1,
    color: { dark: '#00226B', light: '#FFFFFF' },
  })
  doc.addImage(qrDataUrl, 'PNG', margin + 7, y + 8.5, 30, 30)

  const infoX = margin + 44
  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(9.2)
  doc.text('TE INVITAMOS A PONERTE AL D\u00cdA CON TU SERVICIO DE AGUA', infoX, y + 8.5)

  doc.setDrawColor(...COLORS.borderLight)
  doc.line(infoX, y + 10.8, pageWidth - margin - 5, y + 10.8)

  const ch2X = infoX + 64
  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(7.4)
  doc.text('NEQUI OFICIAL TESORER\u00cdA', infoX, y + 16.2)
  doc.text('CUENTA DE AHORROS BANCOLOMBIA', ch2X, y + 16.2)

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.headingHeavy, 'bold')
  doc.setFontSize(11)
  doc.text(NEQUI_OFICIAL, infoX, y + 21.5)
  doc.text(CUENTA_BANCOLOMBIA, ch2X, y + 21.5)

  doc.setTextColor(...COLORS.textMuted)
  doc.setFont(fonts.body, 'normal')
  doc.setFontSize(7.8)
  doc.text('Cuenta habilitada por la Junta para el recaudo del servicio de agua.', infoX, y + 27.2)

  doc.setDrawColor(...COLORS.borderLight)
  doc.line(infoX, y + 29.8, pageWidth - margin - 5, y + 29.8)

  doc.setTextColor(...COLORS.textSecondary)
  doc.setFont(fonts.bodyMedium, 'normal')
  doc.setFontSize(8.2)
  doc.text(`Env\u00eda tu comprobante por WhatsApp al ${NEQUI_OFICIAL} o consulta en ${portalUrl}`, infoX, y + 35)

  doc.setTextColor(...COLORS.primaryDark)
  doc.setFont(fonts.heading, 'bold')
  doc.setFontSize(8.3)
  doc.text(`Acueducto Vereda El Tablazo \u00b7 ${NIT_ACUEDUCTO}`, infoX, y + 40.5)

  doc.save(`Estado_Cuenta_Acueducto_El_Tablazo_${resultado.cedula}.pdf`)
}