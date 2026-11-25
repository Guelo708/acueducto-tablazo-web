/**
 * Utilidades avanzadas para la gestión, automatización y despacho
 * de cobros y estados de cuenta por WhatsApp
 * Acueducto Vereda El Tablazo · NIT 811.022.038-6
 */

export const NEQUI_OFICIAL = '310 530 1220'
export const BANCOLOMBIA_OFICIAL = '10172699002'
export const NIT_OFICIAL = '811.022.038-6'
export const RAZON_SOCIAL_OFICIAL = 'Acueducto Vereda El Tablazo'

export const HISTORIAL_STORAGE_KEY = 'tablazo_whatsapp_historial_v1'
export const PLANTILLA_STORAGE_KEY = 'tablazo_whatsapp_plantilla_activa_v1'
export const CONFIG_API_STORAGE_KEY = 'tablazo_whatsapp_api_config_v1'

export const moneyFormat = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export function formatPeriodo(mes, anio) {
  return `${String(mes ?? '').padStart(2, '0')}/${anio ?? ''}`
}

/**
 * Normaliza cualquier número de teléfono celular colombiano a formato E.164 y WhatsApp
 */
export function normalizarTelefonoColombia(celular) {
  const digitos = String(celular ?? '').replace(/\D/g, '')
  if (!digitos) {
    return { valido: false, waNumber: '', display: 'Sin celular', e164: '' }
  }

  let local10 = digitos
  if (digitos.length === 12 && digitos.startsWith('57')) {
    local10 = digitos.slice(2)
  }

  if (local10.length === 10 && local10.startsWith('3')) {
    return {
      valido: true,
      waNumber: `57${local10}`,
      display: `${local10.slice(0, 3)} ${local10.slice(3, 6)} ${local10.slice(6)}`,
      e164: `+57${local10}`,
    }
  }

  return {
    valido: digitos.length >= 10,
    waNumber: digitos.startsWith('57') ? digitos : `57${digitos}`,
    display: digitos,
    e164: digitos.startsWith('57') ? `+${digitos}` : `+57${digitos}`,
  }
}

/**
 * Plantillas predefinidas institucionales para cobro por WhatsApp
 */
export const PLANTILLAS_PREDEFINIDAS = {
  ESTANDAR: {
    id: 'ESTANDAR',
    nombre: 'Cobro Oficial Estándar',
    descripcion: 'Mensaje completo institucional con detalle de facturas, portal y cuentas bancarias.',
    texto:
      `Hola *{nombre}*, cordial saludo de la Junta Administradora del *Acueducto Vereda El Tablazo* (NIT ${NIT_OFICIAL}).\n\n` +
      `Le informamos que a la fecha presenta {detalle_facturas} por un saldo total acumulado de *{saldo}*.\n` +
      `{detalle_predios}` +
      `\nPuede consultar su historial completo y descargar su factura oficial en PDF ingresando con su cédula aquí:\n` +
      `{enlace_portal}\n\n` +
      `*Canales oficiales de pago:*\n` +
      `• Nequi Tesorería: *{nequi}*\n` +
      `• Ahorros Bancolombia: *{bancolombia}*\n\n` +
      `Si ya realizó su pago, por favor envíenos el soporte por este medio. ¡Muchas gracias por apoyar nuestro acueducto comunitario!`,
  },
  RECORDATORIO: {
    id: 'RECORDATORIO',
    nombre: 'Recordatorio Amistoso / Preventivo',
    descripcion: 'Tono cercano para recordar el pago oportuno antes de entrar en mora o corte.',
    texto:
      `Estimado(a) suscriptor(a) *{nombre}*, un saludo especial de la Junta del *Acueducto Vereda El Tablazo*.\n\n` +
      `Le recordamos amablemente que presenta {detalle_facturas} por valor de *{saldo}*.\n` +
      `{detalle_predios}` +
      `\nSu aporte puntual garantiza el suministro de agua y el mantenimiento continuo de nuestras redes.\n\n` +
      `Descargue su factura aquí: {enlace_portal}\n` +
      `• Nequi: *{nequi}* | Bancolombia: *{bancolombia}*\n\n` +
      `¡Agradecemos su compromiso con nuestra comunidad!`,
  },
  MORA_CORTE: {
    id: 'MORA_CORTE',
    nombre: 'Aviso Prioritario / Cartera Vencida',
    descripcion: 'Mensaje formal para suscriptores con mora o riesgo inminente de suspensión.',
    texto:
      `AVISO PRIORITARIO: Señor(a) *{nombre}*, Junta Administradora del *Acueducto Vereda El Tablazo* (NIT ${NIT_OFICIAL}).\n\n` +
      `Le informamos que a la fecha presenta {detalle_facturas} en mora por un saldo vencido de *{saldo}*.\n` +
      `{detalle_predios}` +
      `\nPara evitar la suspensión temporal del servicio y costos de reconexión, le solicitamos ponerse al día a la mayor brevedad posible.\n\n` +
      `Consulte su estado de cuenta aquí: {enlace_portal}\n` +
      `• Nequi: *{nequi}* | Bancolombia: *{bancolombia}*\n\n` +
      `Por favor remitir el comprobante de transferencia a este número para su aplicación inmediata.`,
  },
  CORTO: {
    id: 'CORTO',
    nombre: 'Mensaje Compacto y Directo',
    descripcion: 'Texto breve ideal para lecturas rápidas en el celular.',
    texto:
      `*Acueducto Vereda El Tablazo*: Hola *{nombre}*, le informamos que presenta saldo pendiente de *{saldo}* ({detalle_facturas}).\n` +
      `{detalle_predios}` +
      `Descargue su factura en: {enlace_portal}\nPague por Nequi: *{nequi}* o Bancolombia: *{bancolombia}*. ¡Gracias!`,
  },
}

/**
 * Obtiene la plantilla activa almacenada o la estándar por defecto
 */
export function obtenerPlantillaActiva() {
  try {
    const guardada = localStorage.getItem(PLANTILLA_STORAGE_KEY)
    if (guardada) {
      return guardada
    }
  } catch {
    // Si hay error en localStorage se usa la estándar
  }
  return PLANTILLAS_PREDEFINIDAS.ESTANDAR.texto
}

/**
 * Guarda una plantilla de mensaje personalizada en localStorage
 */
export function guardarPlantillaActiva(textoPlantilla) {
  try {
    localStorage.setItem(PLANTILLA_STORAGE_KEY, textoPlantilla)
  } catch (e) {
    console.error('Error guardando plantilla en localStorage:', e)
  }
}

/**
 * Restablece la plantilla a una de las predefinidas
 */
export function restablecerPlantilla(tipo = 'ESTANDAR') {
  const seleccionada = PLANTILLAS_PREDEFINIDAS[tipo] || PLANTILLAS_PREDEFINIDAS.ESTANDAR
  guardarPlantillaActiva(seleccionada.texto)
  return seleccionada.texto
}

/**
 * Renderiza una plantilla sustituyendo variables dinámicas por los datos del suscriptor
 */
export function renderizarMensajeConPlantilla(plantillaTexto, grupo) {
  if (!plantillaTexto || !grupo) return ''

  const urlPortal = `${window.location.origin}/consulta`
  const esMultiple = (grupo.cantidadFacturas || 1) > 1
  const detalleFacturas = esMultiple
    ? `*${grupo.cantidadFacturas} facturas pendientes* (periodos *${grupo.periodoDesde}* a *${grupo.periodoHasta}*)`
    : `*1 factura pendiente* correspondiente al periodo *${grupo.periodoDesde}*`

  const lineaPredios =
    Array.isArray(grupo.predios) && grupo.predios.length > 0
      ? `Predio(s): *${grupo.predios.join(', ')}*\n`
      : ''

  return plantillaTexto
    .replace(/{nombre}/g, grupo.titular || 'Suscriptor')
    .replace(/{cedula}/g, grupo.cedula || '')
    .replace(/{saldo}/g, moneyFormat(grupo.totalAdeudado))
    .replace(/{cantidad_facturas}/g, String(grupo.cantidadFacturas || 1))
    .replace(/{detalle_facturas}/g, detalleFacturas)
    .replace(/{periodo}/g, esMultiple ? `${grupo.periodoDesde} - ${grupo.periodoHasta}` : grupo.periodoDesde)
    .replace(/{periodo_desde}/g, grupo.periodoDesde || '')
    .replace(/{periodo_hasta}/g, grupo.periodoHasta || '')
    .replace(/{detalle_predios}/g, lineaPredios)
    .replace(/{predios}/g, Array.isArray(grupo.predios) ? grupo.predios.join(', ') : '')
    .replace(/{enlace_portal}/g, urlPortal)
    .replace(/{nequi}/g, NEQUI_OFICIAL)
    .replace(/{bancolombia}/g, BANCOLOMBIA_OFICIAL)
    .replace(/{nit}/g, NIT_OFICIAL)
}

/**
 * Mantiene compatibilidad con la función previa
 */
export function construirMensajeWhatsAppConsolidado(grupo) {
  const plantilla = obtenerPlantillaActiva()
  return renderizarMensajeConPlantilla(plantilla, grupo)
}

/**
 * Abre la ventana o pestaña de WhatsApp Web con el mensaje consolidado
 */
export function abrirWhatsAppCobroConsolidado(grupo, plantillaPersonalizada = null) {
  const plantilla = plantillaPersonalizada || obtenerPlantillaActiva()
  const texto = encodeURIComponent(renderizarMensajeConPlantilla(plantilla, grupo))
  const destino =
    grupo.tieneCelularValido && grupo.waNumber
      ? `https://wa.me/${grupo.waNumber}?text=${texto}`
      : `https://wa.me/?text=${texto}`

  window.open(destino, '_blank', 'noopener,noreferrer')
}

/**
 * HISTORIAL Y PERSISTENCIA DE CONTACTO WHATSAPP
 * Guarda qué suscriptores fueron contactados, cuándo y por qué canal
 */
export function obtenerHistorialWhatsApp() {
  try {
    const raw = localStorage.getItem(HISTORIAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // Si hay error en parseo
  }
  return {}
}

export function registrarEnvioWhatsApp(cedula, { metodo = 'whatsapp_web', total = 0, titular = '' } = {}) {
  try {
    const actual = obtenerHistorialWhatsApp()
    actual[String(cedula)] = {
      contactadoAt: new Date().toISOString(),
      metodo,
      total,
      titular,
    }
    localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(actual))
    return actual
  } catch {
    return {}
  }
}

export function registrarEnvioMasivoWhatsApp(grupos = [], { metodo = 'masivo_api' } = {}) {
  try {
    const actual = obtenerHistorialWhatsApp()
    const ahora = new Date().toISOString()
    grupos.forEach((g) => {
      const ced = String(g.cedula || g)
      actual[ced] = {
        contactadoAt: ahora,
        metodo,
        total: g.totalAdeudado || 0,
        titular: g.titular || '',
      }
    })
    localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(actual))
    return actual
  } catch {
    return {}
  }
}

export function limpiarHistorialWhatsApp() {
  try {
    localStorage.removeItem(HISTORIAL_STORAGE_KEY)
  } catch {
    // Sin acción
  }
}

/**
 * Agrupa la cartera pendiente por cada suscriptor (cédula)
 */
export function agruparCarteraPorSuscriptor({
  facturas = [],
  usuariosMap = {},
  prediosMap = {},
  pagos = [],
}) {
  const pagadoPorFactura = {}
  if (Array.isArray(pagos)) {
    pagos.forEach((p) => {
      const fId = p.facturaId ?? p.factura?.id
      if (fId != null) {
        pagadoPorFactura[fId] =
          (pagadoPorFactura[fId] || 0) + Number(p.valorPagado || 0)
      }
    })
  }

  const grupos = {}

  facturas.forEach((f) => {
    if (f.estado === 'PAGADA') return

    const cedula = String(f.cedulaPropietario || `SIN-DOC-${f.id}`)
    const suscriptor = usuariosMap[cedula] || {}
    const predioInfo = prediosMap[f.codigoPredio] || {}

    const valorTotal = Number(f.valorFactura || 0)
    const abonado = pagadoPorFactura[f.id] || 0
    const saldoPendiente =
      f.saldoPendiente != null
        ? Number(f.saldoPendiente)
        : Math.max(0, valorTotal - abonado)

    if (!grupos[cedula]) {
      const telInfo = normalizarTelefonoColombia(suscriptor.celular)
      grupos[cedula] = {
        cedula,
        titular:
          suscriptor.nombreCompleto ||
          f.nombrePropietario ||
          'Suscriptor sin nombre',
        celularRaw: suscriptor.celular || '',
        celularDisplay: telInfo.display,
        waNumber: telInfo.waNumber,
        e164: telInfo.e164,
        tieneCelularValido: telInfo.valido,
        prediosSet: new Set(),
        facturasPendientes: [],
        totalAdeudado: 0,
        cantidadVencidas: 0,
      }
    }

    const grupo = grupos[cedula]
    const nombrePredio = predioInfo.nombrePredio || f.codigoPredio || 'Predio'
    const sector =
      predioInfo.nombreSector ||
      predioInfo.sector?.nombre ||
      (typeof predioInfo.sector === 'string' ? predioInfo.sector : '')

    if (f.codigoPredio) {
      grupo.prediosSet.add(
        predioInfo.nombrePredio
          ? `${f.codigoPredio} (${predioInfo.nombrePredio})`
          : f.codigoPredio,
      )
    }

    if (f.estado === 'VENCIDA') {
      grupo.cantidadVencidas += 1
    }

    grupo.totalAdeudado += saldoPendiente
    grupo.facturasPendientes.push({
      ...f,
      nombrePredio,
      sector,
      saldoPendiente,
    })
  })

  return Object.values(grupos)
    .map((g) => {
      const ordenadas = [...g.facturasPendientes].sort((a, b) => {
        if (Number(a.anio) !== Number(b.anio)) {
          return Number(a.anio) - Number(b.anio)
        }
        return Number(a.mes) - Number(b.mes)
      })

      const primera = ordenadas[0]
      const ultima = ordenadas[ordenadas.length - 1]

      return {
        ...g,
        predios: Array.from(g.prediosSet),
        facturasPendientes: ordenadas,
        cantidadFacturas: ordenadas.length,
        periodoDesde: primera ? formatPeriodo(primera.mes, primera.anio) : '',
        periodoHasta: ultima ? formatPeriodo(ultima.mes, ultima.anio) : '',
      }
    })
    .sort((a, b) => {
      if (b.cantidadVencidas !== a.cantidadVencidas) {
        return b.cantidadVencidas - a.cantidadVencidas
      }
      return b.totalAdeudado - a.totalAdeudado
    })
}

/**
 * Exporta los contactos a formato .vcf para listas de difusión en teléfonos celulares
 */
export function exportarContactosWhatsAppVcf(usuarios = [], predios = []) {
  const prediosPorCedula = {}
  if (Array.isArray(predios)) {
    predios.forEach((p) => {
      const ced = String(p.cedulaPropietario || p.usuario?.cedula || '')
      if (!ced) return
      if (!prediosPorCedula[ced]) prediosPorCedula[ced] = []
      if (p.codigoPredio) prediosPorCedula[ced].push(p.codigoPredio)
    })
  }

  const tarjetas = []

  usuarios.forEach((u) => {
    const tel = normalizarTelefonoColombia(u.celular)
    if (!tel.valido) return

    const nombreLimpio = String(u.nombreCompleto || 'Suscriptor')
      .replace(/[;,\r\n]+/g, ' ')
      .trim()
    const fn = `Acueducto Tablazo - ${nombreLimpio}`
    const codigosPredios = prediosPorCedula[String(u.cedula || '')] || []
    const nota = [
      u.cedula ? `CC: ${u.cedula}` : '',
      codigosPredios.length > 0 ? `Predios: ${codigosPredios.join(' / ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ')

    const lineas = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${nombreLimpio};Acueducto Tablazo;;;`,
      `FN:${fn}`,
      'ORG:Acueducto Vereda El Tablazo',
      `TEL;TYPE=CELL,VOICE:${tel.e164}`,
    ]

    if (u.correoElectronico) {
      lineas.push(`EMAIL;TYPE=INTERNET:${String(u.correoElectronico).trim()}`)
    }
    if (nota) {
      lineas.push(`NOTE:${nota}`)
    }

    lineas.push('END:VCARD')
    tarjetas.push(lineas.join('\r\n'))
  })

  if (tarjetas.length === 0) {
    return 0
  }

  const contenidoVcf = `${tarjetas.join('\r\n')}\r\n`
  const blob = new Blob([contenidoVcf], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)
  enlace.href = url
  enlace.download = `contactos-whatsapp-acueducto-tablazo-${fecha}.vcf`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)

  return tarjetas.length
}

/**
 * EXPORTACIÓN MASIVA CSV ESPECIALIZADA PARA HERRAMIENTAS DE AUTOMATIZACIÓN
 * Compatible con WA Web Plus, W-Bulk, WPPConnect, Evolution API o Google Sheets/Excel
 */
export function exportarCarteraParaEnvioMasivoCsv(grupos = [], plantilla = null) {
  const plantillaActiva = plantilla || obtenerPlantillaActiva()
  const historial = obtenerHistorialWhatsApp()

  const escaparCsv = (valor) => {
    const texto = String(valor ?? '')
    if (texto.includes(',') || texto.includes(';') || texto.includes('"') || texto.includes('\n') || texto.includes('\r')) {
      return `"${texto.replace(/"/g, '""')}"`
    }
    return texto
  }

  const encabezados = [
    'Telefono_WhatsApp',
    'Nombre_Suscriptor',
    'Cedula',
    'Total_Adeudado_COP',
    'Total_Adeudado_Numero',
    'Cantidad_Facturas',
    'Periodos_Pendientes',
    'Predios',
    'Mensaje_Completo_WhatsApp',
    'Enlace_Directo_WhatsApp',
    'Enlace_Portal_Consulta',
    'Estado_Contacto',
    'Fecha_Ultimo_Contacto',
  ]

  const lineas = [encabezados.join(';')]

  grupos.forEach((g) => {
    const tel = g.waNumber || ''
    const nombre = g.titular || 'Suscriptor'
    const mensaje = renderizarMensajeConPlantilla(plantillaActiva, g)
    const enlaceWa = tel ? `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}` : ''
    const registro = historial[g.cedula]
    const contactado = Boolean(registro)
    const fechaContacto = registro?.contactadoAt ? new Date(registro.contactadoAt).toLocaleString('es-CO') : ''

    lineas.push(
      [
        escaparCsv(tel),
        escaparCsv(nombre),
        escaparCsv(g.cedula),
        escaparCsv(moneyFormat(g.totalAdeudado)),
        escaparCsv(g.totalAdeudado),
        escaparCsv(g.cantidadFacturas),
        escaparCsv(g.cantidadFacturas > 1 ? `${g.periodoDesde} a ${g.periodoHasta}` : g.periodoDesde),
        escaparCsv(g.predios.join(', ')),
        escaparCsv(mensaje),
        escaparCsv(enlaceWa),
        escaparCsv(`${window.location.origin}/consulta`),
        escaparCsv(contactado ? 'CONTACTADO' : 'PENDIENTE'),
        escaparCsv(fechaContacto),
      ].join(';'),
    )
  })

  // BOM UTF-8 (\uFEFF) para compatibilidad con Microsoft Excel en español
  const contenidoCsv = `\uFEFF${lineas.join('\r\n')}`
  const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)
  enlace.href = url
  enlace.download = `cartera-cobro-whatsapp-acueducto-tablazo-${fecha}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)

  return grupos.length
}

/**
 * CONFIGURACIÓN Y DESPACHO AUTOMATIZADO VÍA API / WEBHOOK
 */
export function obtenerConfiguracionApiWhatsApp() {
  try {
    const raw = localStorage.getItem(CONFIG_API_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Si no existe, se entrega el estado por defecto
  }
  return {
    apiUrl: '',
    apiToken: '',
    delaySegundos: 2.5,
    activo: false,
  }
}

export function guardarConfiguracionApiWhatsApp(config) {
  try {
    localStorage.setItem(CONFIG_API_STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Error guardando configuración de WhatsApp API:', e)
  }
}

/**
 * Despacha un mensaje a través de un Webhook / API configurado
 */
export async function enviarMensajeWhatsAppApi({ apiUrl, apiToken, waNumber, mensaje, titular, cedula }) {
  if (!apiUrl) {
    throw new Error('La URL del Webhook o API de WhatsApp no está configurada.')
  }

  const payload = {
    number: waNumber,
    phone: waNumber,
    to: waNumber,
    message: mensaje,
    text: mensaje,
    recipientName: titular,
    cedula: cedula,
    sender: 'Acueducto Vereda El Tablazo',
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (apiToken && apiToken.trim()) {
    headers['Authorization'] = `Bearer ${apiToken.trim()}`
    headers['apikey'] = apiToken.trim()
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Error en API WhatsApp (${response.status}): ${errText || response.statusText}`)
  }

  return await response.json().catch(() => ({ status: 'ok' }))
}
