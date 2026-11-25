import { useEffect, useMemo, useRef, useState } from 'react'
import AdminModal from '../../components/AdminModal/AdminModal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import { listarPredios } from '../../services/predioService.js'
import { listarUsuarios } from '../../services/usuarioService.js'
import {
  actualizarFacturasVencidas,
  eliminarFactura,
  generarFactura,
  generarFacturasMensuales,
  listarFacturas,
} from '../../services/facturaService.js'
import {
  listarPagos,
  registrarPago,
  saldoFactura,
} from '../../services/pagoService.js'
import {
  descargarEstadoCuentaPdf,
  descargarFacturaPdf,
} from '../../utils/facturaPdfGenerator.js'
import {
  BANCOLOMBIA_OFICIAL,
  NEQUI_OFICIAL,
  NIT_OFICIAL,
  PLANTILLAS_PREDEFINIDAS,
  abrirWhatsAppCobroConsolidado,
  agruparCarteraPorSuscriptor,
  enviarMensajeWhatsAppApi,
  exportarCarteraParaEnvioMasivoCsv,
  exportarContactosWhatsAppVcf,
  formatPeriodo,
  guardarConfiguracionApiWhatsApp,
  guardarPlantillaActiva,
  limpiarHistorialWhatsApp,
  moneyFormat,
  normalizarTelefonoColombia,
  obtenerConfiguracionApiWhatsApp,
  obtenerHistorialWhatsApp,
  obtenerPlantillaActiva,
  registrarEnvioMasivoWhatsApp,
  registrarEnvioWhatsApp,
  renderizarMensajeConPlantilla,
  restablecerPlantilla,
} from '../../utils/whatsappCobroUtils.js'
import '../../components/EntityManager/EntityManager.css'
import './FacturasPage.css'

const Icons = {
  Send: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.217 8.217 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.13.17 1.76 2.69 4.27 3.77.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Template: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
}

const paymentMethods = [
  'EFECTIVO',
  'TRANSFERENCIA',
  'NEQUI',
  'TARJETA_DEBITO',
  'TARJETA_CREDITO',
  'DAVIPLATA',
  'RECAUDO_CONVENIO',
]

const money = moneyFormat

function FacturasPage() {
  const [activeTab, setActiveTab] = useState('cartera')
  const [items, setItems] = useState([])
  const [predios, setPredios] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pagos, setPagos] = useState([])
  const [usuariosMap, setUsuariosMap] = useState({})
  const [prediosMap, setPrediosMap] = useState({})

  // Filtros
  const [filter, setFilter] = useState('')
  const [carteraSearch, setCarteraSearch] = useState('')
  const [carteraFilter, setCarteraFilter] = useState('TODOS')
  const [selectedSuscriptor, setSelectedSuscriptor] = useState(null)

  // Selección masiva para despacho
  const [selectedCedulas, setSelectedCedulas] = useState(new Set())

  // Historial de contacto persistente
  const [historialEnvios, setHistorialEnvios] = useState(() =>
    obtenerHistorialWhatsApp(),
  )
  const [showConfirmResetHistory, setShowConfirmResetHistory] = useState(false)

  // Modal de Envío Masivo
  const [massModalOpen, setMassModalOpen] = useState(false)
  const [massMode, setMassMode] = useState('api')
  const [massRunning, setMassRunning] = useState(false)
  const [massProgress, setMassProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    currentName: '',
  })
  const [massLogs, setMassLogs] = useState([])
  const stopAutoRef = useRef(false)

  // Modal de Plantillas
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [plantillaTexto, setPlantillaTexto] = useState(() =>
    obtenerPlantillaActiva(),
  )
  const [selectedPreset, setSelectedPreset] = useState('ESTANDAR')

  // Modal de Configuración Pasarela API
  const [apiModalOpen, setApiModalOpen] = useState(false)
  const [apiConfig, setApiConfig] = useState(() =>
    obtenerConfiguracionApiWhatsApp(),
  )

  // Modales estándar
  const [modal, setModal] = useState(null)
  const [detail, setDetail] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [paying, setPaying] = useState(null)
  const [payBalance, setPayBalance] = useState(null)
  const [form, setForm] = useState({
    predioId: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  })
  const [payForm, setPayForm] = useState({
    valorPagado: '',
    fechaPago: new Date().toISOString().slice(0, 10),
    metodoPago: 'EFECTIVO',
    observacion: '',
  })
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  function hidratarCatalogos(listaPredios, listaUsuarios) {
    const uMap = {}
    if (Array.isArray(listaUsuarios)) {
      listaUsuarios.forEach((u) => {
        if (u.cedula) uMap[String(u.cedula)] = u
      })
    }
    setUsuariosMap(uMap)

    const pMap = {}
    if (Array.isArray(listaPredios)) {
      listaPredios.forEach((p) => {
        if (p.codigoPredio) pMap[p.codigoPredio] = p
      })
    }
    setPrediosMap(pMap)
  }

  async function cargarDatos(showLoading = false) {
    try {
      if (showLoading) setLoading(true)
      const [facturas, listaPredios, listaUsuarios, listaPagos] =
        await Promise.all([
          listarFacturas(),
          listarPredios(),
          listarUsuarios().catch(() => []),
          listarPagos().catch(() => []),
        ])
      const fArr = Array.isArray(facturas) ? facturas : []
      const pArr = Array.isArray(listaPredios) ? listaPredios : []
      const uArr = Array.isArray(listaUsuarios) ? listaUsuarios : []
      const pgArr = Array.isArray(listaPagos) ? listaPagos : []

      setItems(fArr)
      setPredios(pArr)
      setUsuarios(uArr)
      setPagos(pgArr)
      hidratarCatalogos(pArr, uArr)
    } catch (err) {
      setError(err.message)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos(true)
  }, [])

  // Cartera agrupada por suscriptor
  const carteraAgrupada = useMemo(() => {
    return agruparCarteraPorSuscriptor({
      facturas: items,
      usuariosMap,
      prediosMap,
      pagos,
    })
  }, [items, usuariosMap, prediosMap, pagos])

  // Filtrado de cartera
  const carteraFiltrada = useMemo(() => {
    const q = carteraSearch.trim().toLowerCase()
    return carteraAgrupada.filter((g) => {
      const yaContactado = Boolean(historialEnvios[g.cedula])

      if (carteraFilter === 'VENCIDAS' && g.cantidadVencidas === 0) return false
      if (carteraFilter === 'CON_CELULAR' && !g.tieneCelularValido) return false
      if (carteraFilter === 'SIN_CELULAR' && g.tieneCelularValido) return false
      if (carteraFilter === 'SOLO_PENDIENTES' && yaContactado) return false
      if (carteraFilter === 'YA_CONTACTADOS' && !yaContactado) return false

      if (!q) return true
      return (
        g.titular.toLowerCase().includes(q) ||
        g.cedula.toLowerCase().includes(q) ||
        g.celularRaw.toLowerCase().includes(q) ||
        g.predios.some((p) => p.toLowerCase().includes(q))
      )
    })
  }, [carteraAgrupada, carteraSearch, carteraFilter, historialEnvios])

  // Inicializar selección con los suscriptores filtrados que tienen celular válido
  useEffect(() => {
    const validos = new Set()
    carteraFiltrada.forEach((g) => {
      if (g.tieneCelularValido) {
        validos.add(g.cedula)
      }
    })
    setSelectedCedulas(validos)
  }, [carteraFiltrada])

  // KPIs
  const kpisCartera = useMemo(() => {
    const totalAdeudado = carteraAgrupada.reduce(
      (acc, g) => acc + g.totalAdeudado,
      0,
    )
    const conWhatsApp = carteraAgrupada.filter(
      (g) => g.tieneCelularValido,
    ).length
    const contactadosCount = carteraAgrupada.filter(
      (g) => Boolean(historialEnvios[g.cedula]),
    ).length
    const porcentajeContactados =
      conWhatsApp > 0 ? Math.round((contactadosCount / conWhatsApp) * 100) : 0

    return {
      suscriptoresConSaldo: carteraAgrupada.length,
      totalAdeudado,
      conWhatsApp,
      contactadosCount,
      porcentajeContactados,
    }
  }, [carteraAgrupada, historialEnvios])

  // Suscriptores actualmente seleccionados para envío masivo
  const listaParaDespachoMasivo = useMemo(() => {
    return carteraAgrupada.filter(
      (g) => g.tieneCelularValido && selectedCedulas.has(g.cedula),
    )
  }, [carteraAgrupada, selectedCedulas])

  const totalCarteraSeleccionada = useMemo(() => {
    return listaParaDespachoMasivo.reduce(
      (acc, g) => acc + g.totalAdeudado,
      0,
    )
  }, [listaParaDespachoMasivo])

  const shown = useMemo(
    () => items.filter((x) => !filter || x.estado === filter),
    [items, filter],
  )

  // Acciones de Selección Masiva
  function handleToggleSelectAll(checked) {
    if (checked) {
      const todos = new Set()
      carteraFiltrada.forEach((g) => {
        if (g.tieneCelularValido) todos.add(g.cedula)
      })
      setSelectedCedulas(todos)
    } else {
      setSelectedCedulas(new Set())
    }
  }

  function handleToggleRow(cedula) {
    setSelectedCedulas((prev) => {
      const next = new Set(prev)
      if (next.has(cedula)) {
        next.delete(cedula)
      } else {
        next.add(cedula)
      }
      return next
    })
  }

  function handleSeleccionarSoloPendientes() {
    const pendientes = new Set()
    carteraFiltrada.forEach((g) => {
      if (g.tieneCelularValido && !historialEnvios[g.cedula]) {
        pendientes.add(g.cedula)
      }
    })
    setSelectedCedulas(pendientes)
  }

  // ENVÍO MASIVO AUTOMATIZADO
  async function handleEjecutarDespachoMasivo() {
    if (listaParaDespachoMasivo.length === 0) {
      setError('Selecciona al menos un suscriptor con celular válido para despachar.')
      return
    }

    if (massMode === 'api') {
      if (!apiConfig.apiUrl?.trim()) {
        setError('Debes configurar una URL de API o pasarela de WhatsApp primero.')
        setApiModalOpen(true)
        return
      }

      setMassRunning(true)
      stopAutoRef.current = false
      setMassProgress({
        total: listaParaDespachoMasivo.length,
        sent: 0,
        failed: 0,
        currentName: '',
      })
      setMassLogs([])

      const delayMs = (Number(apiConfig.delaySegundos) || 2.5) * 1000

      for (let i = 0; i < listaParaDespachoMasivo.length; i++) {
        if (stopAutoRef.current) {
          setMassLogs((prev) => ['Envío masivo pausado por el usuario.', ...prev])
          break
        }

        const g = listaParaDespachoMasivo[i]
        setMassProgress((prev) => ({ ...prev, currentName: g.titular }))

        try {
          const mensaje = renderizarMensajeConPlantilla(plantillaTexto, g)
          await enviarMensajeWhatsAppApi({
            apiUrl: apiConfig.apiUrl,
            apiToken: apiConfig.apiToken,
            waNumber: g.waNumber,
            mensaje,
            titular: g.titular,
            cedula: g.cedula,
          })

          const actualizado = registrarEnvioWhatsApp(g.cedula, {
            metodo: 'masivo_api',
            total: g.totalAdeudado,
            titular: g.titular,
          })
          setHistorialEnvios(actualizado)

          setMassProgress((prev) => ({ ...prev, sent: prev.sent + 1 }))
          setMassLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] Despachado: ${g.titular} (${g.celularDisplay})`,
            ...prev.slice(0, 30),
          ])
        } catch (err) {
          setMassProgress((prev) => ({ ...prev, failed: prev.failed + 1 }))
          setMassLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] Error con ${g.titular}: ${err.message}`,
            ...prev.slice(0, 30),
          ])
        }

        if (i < listaParaDespachoMasivo.length - 1 && !stopAutoRef.current) {
          await new Promise((r) => setTimeout(r, delayMs))
        }
      }

      setMassRunning(false)
      setFeedback('Envío masivo por API finalizado.')
    } else if (massMode === 'auto_web') {
      // Secuencia automática Web
      setMassRunning(true)
      stopAutoRef.current = false
      setMassProgress({
        total: listaParaDespachoMasivo.length,
        sent: 0,
        failed: 0,
        currentName: '',
      })
      setMassLogs([])

      for (let i = 0; i < listaParaDespachoMasivo.length; i++) {
        if (stopAutoRef.current) break

        const g = listaParaDespachoMasivo[i]
        setMassProgress((prev) => ({ ...prev, currentName: g.titular }))

        abrirWhatsAppCobroConsolidado(g, plantillaTexto)
        const actualizado = registrarEnvioWhatsApp(g.cedula, {
          metodo: 'masivo_auto_web',
          total: g.totalAdeudado,
          titular: g.titular,
        })
        setHistorialEnvios(actualizado)

        setMassProgress((prev) => ({ ...prev, sent: prev.sent + 1 }))
        setMassLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Preparado chat WhatsApp: ${g.titular}`,
          ...prev.slice(0, 30),
        ])

        if (i < listaParaDespachoMasivo.length - 1 && !stopAutoRef.current) {
          await new Promise((r) => setTimeout(r, 3000))
        }
      }

      setMassRunning(false)
      setFeedback('Secuencia masiva completada.')
    } else {
      // CSV Masivo
      handleExportarCsvMasivo()
      registrarEnvioMasivoWhatsApp(listaParaDespachoMasivo, { metodo: 'exportacion_csv' })
      setHistorialEnvios(obtenerHistorialWhatsApp())
      setMassModalOpen(false)
    }
  }

  function handleDetenerDespachoMasivo() {
    stopAutoRef.current = true
    setMassRunning(false)
  }

  function handleCobroIndividual(grupo) {
    abrirWhatsAppCobroConsolidado(grupo, plantillaTexto)
    const actual = registrarEnvioWhatsApp(grupo.cedula, {
      metodo: 'whatsapp_web',
      total: grupo.totalAdeudado,
      titular: grupo.titular,
    })
    setHistorialEnvios(actual)
    setFeedback(`Enlace a WhatsApp generado para ${grupo.titular}.`)
  }

  function handleReiniciarHistorial() {
    limpiarHistorialWhatsApp()
    setHistorialEnvios({})
    setShowConfirmResetHistory(false)
    setFeedback('Historial reiniciado. Todos los suscriptores aparecen como pendientes.')
  }

  async function handleDescargarEstadoConsolidado(grupo) {
    try {
      await descargarEstadoCuentaPdf({
        titular: grupo.titular,
        cedula: grupo.cedula,
        totalAdeudado: grupo.totalAdeudado,
        facturasPendientes: grupo.facturasPendientes,
      })
    } catch (err) {
      setError(`No se pudo generar el estado de cuenta PDF: ${err.message}`)
    }
  }

  function handleExportarVcf() {
    setError('')
    const exportados = exportarContactosWhatsAppVcf(usuarios, predios)
    if (exportados === 0) {
      setError('No se encontraron suscriptores con celular válido.')
      return
    }
    setFeedback(`Se descargó el archivo .vcf con ${exportados} contactos listos para tu celular.`)
  }

  function handleExportarCsvMasivo() {
    setError('')
    const gruposAExportar =
      listaParaDespachoMasivo.length > 0
        ? listaParaDespachoMasivo
        : carteraFiltrada
    const total = exportarCarteraParaEnvioMasivoCsv(gruposAExportar, plantillaTexto)
    if (total === 0) {
      setError('No hay suscriptores con saldo para exportar.')
      return
    }
    setFeedback(`Se descargó el archivo CSV con ${total} suscriptores y mensajes pre-formateados.`)
  }

  function handleSeleccionarPreset(presetId) {
    setSelectedPreset(presetId)
    const texto = restablecerPlantilla(presetId)
    setPlantillaTexto(texto)
  }

  function handleGuardarPlantilla() {
    guardarPlantillaActiva(plantillaTexto)
    setTemplateModalOpen(false)
    setFeedback('Plantilla institucional guardada.')
  }

  function handleInsertarVariable(v) {
    setPlantillaTexto((prev) => `${prev} {${v}}`)
  }

  function enviarCobroWhatsAppIndividual(factura) {
    const suscriptor = usuariosMap[factura.cedulaPropietario]
    const celInfo = normalizarTelefonoColombia(suscriptor?.celular)
    const urlPortal = `${window.location.origin}/consulta`
    const periodo = `${String(factura.mes).padStart(2, '0')}/${factura.anio}`

    const texto = encodeURIComponent(
      `Hola *${factura.nombrePropietario}*, cordial saludo de la Junta Administradora del *Acueducto Vereda El Tablazo* (NIT ${NIT_OFICIAL}).\n\n` +
        `Le recordamos que su factura del periodo *${periodo}* (Predio ${factura.codigoPredio}) por valor de *${money(factura.valorFactura)}* se encuentra en estado *${factura.estado}* (vencimiento: ${factura.fechaVencimiento}).\n\n` +
        `Puede consultar su estado de cuenta y descargar su factura en PDF aquí:\n${urlPortal}\n\n` +
        `*Canales oficiales de pago:*\n• Nequi: *${NEQUI_OFICIAL}*\n• Bancolombia: *${BANCOLOMBIA_OFICIAL}*\n\n` +
        `¡Muchas gracias por su puntualidad!`,
    )

    if (celInfo.valido && celInfo.waNumber) {
      window.open(`https://wa.me/${celInfo.waNumber}?text=${texto}`, '_blank', 'noopener,noreferrer')
    } else {
      window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleDescargarPdf(factura) {
    try {
      await descargarFacturaPdf(factura)
    } catch (err) {
      setError(`No se pudo generar el PDF: ${err.message}`)
    }
  }

  async function generate(e) {
    e.preventDefault()
    try {
      setBusy(true)
      if (modal === 'monthly') {
        const data = await generarFacturasMensuales(Number(form.mes), Number(form.anio))
        setItems((c) => [...c, ...(Array.isArray(data) ? data : [])])
        setFeedback(`${data?.length ?? 0} facturas generadas.`)
      } else {
        const saved = await generarFactura({
          predioId: Number(form.predioId),
          mes: Number(form.mes),
          anio: Number(form.anio),
        })
        setItems((c) => [...c, saved])
        setFeedback('Factura generada exitosamente.')
      }
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    try {
      setBusy(true)
      await eliminarFactura(deleting.id)
      setItems((c) => c.filter((x) => x.id !== deleting.id))
      setDeleting(null)
      setFeedback('Factura eliminada.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function updateOverdue() {
    try {
      setBusy(true)
      const res = await actualizarFacturasVencidas()
      setFeedback(res?.mensaje || 'Facturas vencidas actualizadas.')
      await cargarDatos(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function openPayModal(factura) {
    try {
      setError('')
      setPaying(factura)
      setPayBalance(null)
      setPayForm({
        valorPagado: '',
        fechaPago: new Date().toISOString().slice(0, 10),
        metodoPago: 'EFECTIVO',
        observacion: '',
      })
      const data = await saldoFactura(factura.id)
      const balance = data?.saldoPendiente ?? factura.valorFactura
      setPayBalance(balance)
      setPayForm((prev) => ({ ...prev, valorPagado: String(balance) }))
    } catch (err) {
      setError(`No se pudo consultar saldo de la factura ${factura.codigoPredio}: ${err.message}`)
    }
  }

  async function handlePaySubmit(e) {
    e.preventDefault()
    if (!paying) return

    const val = Number(payForm.valorPagado)
    if (!val || val <= 0) {
      setError('El valor a pagar debe ser mayor a 0.')
      return
    }

    try {
      setBusy(true)
      setError('')
      await registrarPago({
        facturaId: paying.id,
        valorPagado: val,
        fechaPago: payForm.fechaPago,
        metodoPago: payForm.metodoPago,
        observacion: payForm.observacion || undefined,
      })

      setFeedback(`Pago por ${money(val)} registrado exitosamente para el predio ${paying.codigoPredio}.`)
      setPaying(null)
      await cargarDatos(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const allFilteredSelected =
    carteraFiltrada.length > 0 &&
    carteraFiltrada
      .filter((g) => g.tieneCelularValido)
      .every((g) => selectedCedulas.has(g.cedula))

  return (
    <section className="entity-page facturas-page">
      {/* Encabezado Corporativo Institucional */}
      <header className="entity-hero">
        <div>
          <span className="entity-hero__eyebrow">
            Junta Administradora · Acueducto Vereda El Tablazo
          </span>
          <h1>Facturación y Envío Masivo WhatsApp</h1>
          <p>
            Plataforma centralizada para la emisión de facturación mensual, conciliación de pagos
            y despacho masivo de estados de cuenta vía WhatsApp.
          </p>
        </div>
        <div className="entity-actions">
          <button
            className="admin-button admin-button--primary"
            onClick={() => setModal('single')}
            type="button"
          >
            Generar factura
          </button>
          <button
            className="admin-button admin-button--secondary"
            onClick={() => setModal('monthly')}
            type="button"
          >
            Generación mensual
          </button>
        </div>
      </header>

      {feedback && (
        <div className="entity-feedback entity-feedback--success">
          {feedback}
        </div>
      )}
      {error && (
        <div className="entity-feedback entity-feedback--error">{error}</div>
      )}

      {/* Selector de Pestañas */}
      <div className="facturas-tabs">
        <div className="facturas-tabs__list">
          <button
            type="button"
            className={`facturas-tab-btn ${
              activeTab === 'cartera' ? 'facturas-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('cartera')}
          >
            <span>Cartera y Envío Masivo</span>
            <span className="facturas-tab-badge">{carteraAgrupada.length}</span>
          </button>

          <button
            type="button"
            className={`facturas-tab-btn ${
              activeTab === 'historial' ? 'facturas-tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('historial')}
          >
            <span>Todas las Facturas Individuales</span>
            <span className="facturas-tab-badge">{items.length}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn-inst-action btn-inst-action--primary"
          onClick={() => setMassModalOpen(true)}
          disabled={listaParaDespachoMasivo.length === 0}
        >
          <Icons.Send />
          <span>Ejecutar Envío Masivo ({listaParaDespachoMasivo.length})</span>
        </button>
      </div>

      {activeTab === 'cartera' ? (
        <>
          {/* MÓDULO CORPORATIVO DE ENVÍO MASIVO */}
          <section className="wa-mass-panel">
            <div className="wa-mass-panel__header">
              <div className="wa-mass-panel__title-box">
                <span className="wa-mass-panel__eyebrow">
                  Módulo de Envío Masivo de Facturación
                </span>
                <h2 className="wa-mass-panel__title">
                  Despacho Masivo de Cartera por WhatsApp
                </h2>
                <p className="wa-mass-panel__subtitle">
                  Envía el cobro a múltiples suscriptores simultáneamente mediante pasarela API,
                  secuencia automatizada o exportación directa para software de campañas.
                </p>
              </div>

              <div className="wa-mass-actions">
                <button
                  type="button"
                  className="btn-inst-action btn-inst-action--primary"
                  onClick={() => setMassModalOpen(true)}
                  disabled={listaParaDespachoMasivo.length === 0}
                >
                  <Icons.Send />
                  <span>Ejecutar Envío Masivo ({listaParaDespachoMasivo.length})</span>
                </button>

                <button
                  type="button"
                  className="btn-inst-action btn-inst-action--blue"
                  onClick={() => setTemplateModalOpen(true)}
                >
                  <Icons.Template />
                  <span>Plantilla de Mensaje</span>
                </button>

                <button
                  type="button"
                  className="btn-inst-action btn-inst-action--outline"
                  onClick={handleExportarCsvMasivo}
                >
                  <Icons.Download />
                  <span>Exportar CSV Masivo</span>
                </button>

                <button
                  type="button"
                  className="btn-inst-action btn-inst-action--outline"
                  onClick={handleExportarVcf}
                >
                  <Icons.Download />
                  <span>Contactos (.vcf)</span>
                </button>

                <button
                  type="button"
                  className="btn-inst-action btn-inst-action--ghost"
                  onClick={() => setApiModalOpen(true)}
                  title="Configurar servidor API / Webhook de WhatsApp"
                >
                  <Icons.Settings />
                  <span>Pasarela API</span>
                </button>
              </div>
            </div>

            {/* Barra de Selección Masiva */}
            <div className="wa-selection-bar">
              <div>
                <span>Seleccionados para envío masivo: </span>
                <strong>{listaParaDespachoMasivo.length} de {carteraFiltrada.length} suscriptores</strong>
                <span style={{ marginLeft: '8px', color: 'var(--theme-text-strong)' }}>
                  ({money(totalCarteraSeleccionada)})
                </span>
              </div>

              <div className="wa-selection-helpers">
                <button
                  type="button"
                  className="wa-selection-link"
                  onClick={() => handleToggleSelectAll(true)}
                >
                  Seleccionar todos los visibles
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="wa-selection-link"
                  onClick={handleSeleccionarSoloPendientes}
                >
                  Solo pendientes de hoy
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="wa-selection-link"
                  onClick={() => handleToggleSelectAll(false)}
                >
                  Deseleccionar todos
                </button>
              </div>
            </div>
          </section>

          {/* Indicadores (KPIs) */}
          <div className="entity-kpis">
            <article className="entity-kpi" style={{ borderLeftColor: 'var(--color-primary)' }}>
              <span>Suscriptores con saldo</span>
              <strong>{kpisCartera.suscriptoresConSaldo}</strong>
            </article>

            <article className="entity-kpi" style={{ borderLeftColor: 'var(--color-secondary)' }}>
              <span>Cartera total acumulada</span>
              <strong>{money(kpisCartera.totalAdeudado)}</strong>
            </article>

            <article className="entity-kpi" style={{ borderLeftColor: 'var(--color-accent)' }}>
              <span>Contactados por WhatsApp hoy</span>
              <strong>
                {kpisCartera.contactadosCount} / {kpisCartera.conWhatsApp}
                <span style={{ fontSize: '0.9rem', fontWeight: 700, marginLeft: '8px', color: 'var(--theme-text-strong)' }}>
                  ({kpisCartera.porcentajeContactados}%)
                </span>
              </strong>
              <div className="wa-progress-bar-track" style={{ marginTop: '0.65rem' }}>
                <div
                  className="wa-progress-bar-fill"
                  style={{ width: `${kpisCartera.porcentajeContactados}%` }}
                />
              </div>
            </article>
          </div>

          {/* Filtros de Cartera */}
          <div className="entity-toolbar">
            <label className="entity-toolbar__field">
              Buscar suscriptor, cédula, celular o predio
              <input
                type="search"
                value={carteraSearch}
                onChange={(e) => setCarteraSearch(e.target.value)}
                placeholder="Ej: 12345678, Juan Pérez, 310... o PR-001"
              />
            </label>

            <label className="entity-toolbar__field" style={{ maxWidth: '280px' }}>
              Filtro de cartera
              <select
                value={carteraFilter}
                onChange={(e) => setCarteraFilter(e.target.value)}
              >
                <option value="TODOS">Todos con saldo</option>
                <option value="SOLO_PENDIENTES">Solo pendientes por contactar hoy</option>
                <option value="YA_CONTACTADOS">Ya contactados por WhatsApp hoy</option>
                <option value="VENCIDAS">Con facturas vencidas</option>
                <option value="CON_CELULAR">Con WhatsApp válido</option>
                <option value="SIN_CELULAR">Sin celular registrado</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="admin-button admin-button--secondary"
                onClick={updateOverdue}
                disabled={busy}
                type="button"
              >
                Actualizar vencidas
              </button>

              {kpisCartera.contactadosCount > 0 && (
                <button
                  type="button"
                  className="admin-button"
                  style={{ color: 'var(--color-primary-dark)', borderColor: 'var(--color-border)' }}
                  onClick={() => setShowConfirmResetHistory(true)}
                  title="Reiniciar el registro de quién ha sido contactado"
                >
                  Reiniciar marcas de hoy
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Cartera */}
          <div className="entity-panel">
            {loading ? (
              <div className="entity-state">Consolidando cartera por suscriptor...</div>
            ) : carteraFiltrada.length === 0 ? (
              <div className="entity-state">
                No hay suscriptores pendientes para los filtros seleccionados.
              </div>
            ) : (
              <div className="entity-table-wrap">
                <table className="entity-table">
                  <thead>
                    <tr>
                      <th style={{ width: '42px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          aria-label="Seleccionar todos los visibles"
                        />
                      </th>
                      <th>Suscriptor</th>
                      <th>Celular</th>
                      <th>Predio(s)</th>
                      <th>Facturas</th>
                      <th>Saldo consolidado</th>
                      <th>Estado WhatsApp</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carteraFiltrada.map((g) => {
                      const isSelected = selectedCedulas.has(g.cedula)
                      const registroEnvio = historialEnvios[g.cedula]
                      const yaContactado = Boolean(registroEnvio)
                      const horaEnvio = registroEnvio?.contactadoAt
                        ? new Date(registroEnvio.contactadoAt).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''

                      return (
                        <tr
                          key={g.cedula}
                          className={isSelected ? 'facturas-row--selected' : undefined}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!g.tieneCelularValido}
                              onChange={() => handleToggleRow(g.cedula)}
                              aria-label={`Seleccionar a ${g.titular}`}
                            />
                          </td>
                          <td>
                            <strong>{g.titular}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)' }}>
                              CC: {g.cedula}
                            </div>
                          </td>
                          <td>
                            {g.tieneCelularValido ? (
                              <span style={{ fontWeight: 700 }}>{g.celularDisplay}</span>
                            ) : (
                              <span className="badge-contact-pending">Sin celular</span>
                            )}
                          </td>
                          <td>{g.predios.join(', ') || 'No asociado'}</td>
                          <td>
                            <div>
                              <strong>
                                {g.cantidadFacturas} {g.cantidadFacturas === 1 ? 'factura' : 'facturas'}
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)' }}>
                              ({g.periodoDesde}
                              {g.cantidadFacturas > 1 ? ` → ${g.periodoHasta}` : ''})
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--theme-text-strong)' }}>
                              {money(g.totalAdeudado)}
                            </strong>
                          </td>
                          <td>
                            {yaContactado ? (
                              <span className="badge-contact-ok">
                                <Icons.Check />
                                <span>Contactado {horaEnvio}</span>
                              </span>
                            ) : (
                              <span className="badge-contact-pending">
                                <span>Pendiente</span>
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="table-action-group">
                              <button
                                type="button"
                                className="table-btn table-btn--primary"
                                onClick={() => handleCobroIndividual(g)}
                                title="Abrir chat en WhatsApp"
                              >
                                <Icons.WhatsApp />
                                <span>WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                className="table-btn table-btn--outline"
                                onClick={() => handleDescargarEstadoConsolidado(g)}
                                title="Descargar estado de cuenta en PDF"
                              >
                                <span>PDF</span>
                              </button>

                              <button
                                type="button"
                                className="table-btn table-btn--ghost"
                                onClick={() => setSelectedSuscriptor(g)}
                              >
                                <span>Detalle</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Vista Historial Individual de Facturas */}
          <div className="entity-toolbar">
            <label className="entity-toolbar__field">
              Filtrar por estado de factura
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">Todos los estados</option>
                {['PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA'].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="admin-button admin-button--secondary"
              onClick={updateOverdue}
              disabled={busy}
              type="button"
            >
              Actualizar vencidas
            </button>
          </div>

          <div className="entity-panel">
            {loading ? (
              <div className="entity-state">Consultando facturas...</div>
            ) : (
              <div className="entity-table-wrap">
                <table className="entity-table">
                  <thead>
                    <tr>
                      <th>Predio</th>
                      <th>Propietario</th>
                      <th>Periodo</th>
                      <th>Valor</th>
                      <th>Vencimiento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((x) => (
                      <tr key={x.id}>
                        <td>{x.codigoPredio}</td>
                        <td>{x.nombrePropietario}</td>
                        <td>
                          {x.mes}/{x.anio}
                        </td>
                        <td>{money(x.valorFactura)}</td>
                        <td>{x.fechaVencimiento}</td>
                        <td>
                          <span className={`status-badge status-badge--${x.estado}`}>
                            {x.estado}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-group">
                            <button
                              type="button"
                              className="table-btn table-btn--ghost"
                              onClick={() => setDetail(x)}
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              className="table-btn table-btn--outline"
                              onClick={() => handleDescargarPdf(x)}
                            >
                              PDF
                            </button>
                            {x.estado !== 'PAGADA' && (
                              <button
                                type="button"
                                className="table-btn table-btn--primary"
                                onClick={() => enviarCobroWhatsAppIndividual(x)}
                              >
                                <Icons.WhatsApp />
                                <span>WhatsApp</span>
                              </button>
                            )}
                            <button
                              className="table-btn table-btn--success"
                              type="button"
                              disabled={x.estado === 'PAGADA'}
                              onClick={() => openPayModal(x)}
                            >
                              Pagar
                            </button>
                            <button
                              className="table-btn table-btn--danger"
                              type="button"
                              onClick={() => setDeleting(x)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================
          MODAL: PANEL DE CONTROL DE ENVÍO MASIVO
          ========================================================= */}
      {massModalOpen && (
        <div className="mass-modal-overlay">
          <div className="mass-modal-card">
            <header className="mass-modal-header">
              <div>
                <span>Panel de Control de Despacho Masivo</span>
                <h3>Envío Masivo de Facturación por WhatsApp</h3>
              </div>
              <button
                type="button"
                className="mass-modal-close"
                onClick={() => !massRunning && setMassModalOpen(false)}
                disabled={massRunning}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </header>

            <div className="mass-modal-body">
              {/* Tarjetas resumen del lote */}
              <div className="mass-summary-box">
                <div>
                  <span>Destinatarios seleccionados</span>
                  <strong>{listaParaDespachoMasivo.length} personas</strong>
                </div>
                <div>
                  <span>Cartera total del lote</span>
                  <strong>{money(totalCarteraSeleccionada)}</strong>
                </div>
                <div>
                  <span>Celulares validados</span>
                  <strong style={{ color: 'var(--color-secondary)' }}>100%</strong>
                </div>
              </div>

              {!massRunning ? (
                <>
                  <label style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>
                    Selecciona el método de despacho masivo:
                  </label>

                  <div className="mass-channel-selector">
                    <label
                      className={`mass-channel-option ${
                        massMode === 'api' ? 'mass-channel-option--active' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="massMode"
                        value="api"
                        checked={massMode === 'api'}
                        onChange={() => setMassMode('api')}
                      />
                      <div className="mass-channel-content">
                        <strong>Despacho Automatizado por Pasarela / API (Sin abrir navegador)</strong>
                        <p>
                          Envía el lote directamente a través de tu servidor o pasarela (Evolution API,
                          WhatsApp Cloud API, Baileys o Webhook backend). No requiere interacción manual.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`mass-channel-option ${
                        massMode === 'auto_web' ? 'mass-channel-option--active' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="massMode"
                        value="auto_web"
                        checked={massMode === 'auto_web'}
                        onChange={() => setMassMode('auto_web')}
                      />
                      <div className="mass-channel-content">
                        <strong>Secuencia Automática Web (Temporizador 3 seg.)</strong>
                        <p>
                          Prepara y despacha automáticamente a cada suscriptor sin clics manuales repetitivos,
                          marcando a cada uno en el sistema de forma secuencial.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`mass-channel-option ${
                        massMode === 'csv' ? 'mass-channel-option--active' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="massMode"
                        value="csv"
                        checked={massMode === 'csv'}
                        onChange={() => setMassMode('csv')}
                      />
                      <div className="mass-channel-content">
                        <strong>Exportar Lote Masivo (CSV / Excel para Software de Envíos)</strong>
                        <p>
                          Descarga el archivo estructurado con teléfonos en formato internacional y el texto
                          institucional listo para disparadores masivos externos.
                        </p>
                      </div>
                    </label>
                  </div>
                </>
              ) : (
                <div className="mass-runner-active-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--theme-text-strong)', fontSize: '1rem' }}>
                      Ejecutando envío masivo a {massProgress.total} destinatarios...
                    </strong>
                    <span style={{ fontWeight: 700, color: 'var(--theme-text-strong)' }}>
                      {Math.round(((massProgress.sent + massProgress.failed) / Math.max(1, massProgress.total)) * 100)}%
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                    Despachando a: <strong>{massProgress.currentName || 'Iniciando...'}</strong>
                  </p>

                  <div className="wa-progress-bar-track">
                    <div
                      className="wa-progress-bar-fill"
                      style={{
                        width: `${((massProgress.sent + massProgress.failed) / Math.max(1, massProgress.total)) * 100}%`,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--theme-text-strong)' }}>
                      Completados: {massProgress.sent}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Pendientes: {Math.max(0, massProgress.total - (massProgress.sent + massProgress.failed))}
                    </span>
                  </div>

                  {massLogs.length > 0 && (
                    <div className="mass-runner-logs">
                      {massLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="mass-modal-footer">
              <button
                type="button"
                className="btn-inst-action btn-inst-action--ghost"
                onClick={() => setMassModalOpen(false)}
                disabled={massRunning}
              >
                Cerrar
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                {massRunning ? (
                  <button
                    type="button"
                    className="btn-inst-action btn-inst-action--outline"
                    onClick={handleDetenerDespachoMasivo}
                  >
                    Detener Despacho
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-inst-action btn-inst-action--primary"
                    onClick={handleEjecutarDespachoMasivo}
                  >
                    <Icons.Send />
                    <span>Iniciar Envío Masivo ({listaParaDespachoMasivo.length})</span>
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PLANTILLA DE MENSAJE INSTITUCIONAL
          ========================================================= */}
      {templateModalOpen && (
        <AdminModal
          title="Plantilla Institucional de Cobro por WhatsApp"
          onClose={() => setTemplateModalOpen(false)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setTemplateModalOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="admin-button admin-button--primary"
                onClick={handleGuardarPlantilla}
                type="button"
              >
                Guardar Plantilla
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--color-primary-dark)' }}>
                Plantillas predefinidas oficiales:
              </label>
              <div className="template-presets-grid">
                {Object.values(PLANTILLAS_PREDEFINIDAS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`template-preset-chip ${
                      selectedPreset === p.id ? 'template-preset-chip--active' : ''
                    }`}
                    onClick={() => handleSeleccionarPreset(p.id)}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-primary-dark)' }}>
                Variables disponibles (haz clic para insertar en el mensaje):
              </label>
              <div className="template-chips-wrap">
                {[
                  'nombre',
                  'saldo',
                  'detalle_facturas',
                  'periodo',
                  'detalle_predios',
                  'enlace_portal',
                  'nequi',
                  'bancolombia',
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="template-chip-item"
                    onClick={() => handleInsertarVariable(v)}
                    title={`Inserta {${v}}`}
                  >
                    +{`{${v}}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-primary-dark)' }}>
                Cuerpo del mensaje a despachar:
              </label>
              <textarea
                className="template-textbox"
                value={plantillaTexto}
                onChange={(e) => setPlantillaTexto(e.target.value)}
              />
            </div>
          </div>
        </AdminModal>
      )}

      {/* =========================================================
          MODAL: CONFIGURACIÓN PASARELA API WHATSAPP
          ========================================================= */}
      {apiModalOpen && (
        <AdminModal
          title="Configuración de Pasarela API / Webhook WhatsApp"
          onClose={() => setApiModalOpen(false)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setApiModalOpen(false)}
                type="button"
              >
                Cerrar
              </button>
              <button
                className="admin-button admin-button--primary"
                onClick={() => {
                  guardarConfiguracionApiWhatsApp(apiConfig)
                  setApiModalOpen(false)
                  setFeedback('Configuración de pasarela guardada.')
                }}
                type="button"
              >
                Guardar Configuración
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Ingresa el endpoint de tu servidor de WhatsApp (Evolution API, WhatsApp Business Cloud API,
              Baileys o webhook del backend) para habilitar el despacho 100% automático sin abrir pestañas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                URL del Webhook / Endpoint POST:
              </label>
              <input
                type="url"
                placeholder="https://api.tu-servidor-whatsapp.com/message/sendText"
                value={apiConfig.apiUrl}
                onChange={(e) => setApiConfig({ ...apiConfig, apiUrl: e.target.value })}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1.5px solid var(--color-border)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                Token de Autorización / API Key (Opcional):
              </label>
              <input
                type="password"
                placeholder="Bearer token o apikey"
                value={apiConfig.apiToken}
                onChange={(e) => setApiConfig({ ...apiConfig, apiToken: e.target.value })}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1.5px solid var(--color-border)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                Pausa de seguridad entre mensajes (segundos):
              </label>
              <input
                type="number"
                min="1"
                max="20"
                step="0.5"
                value={apiConfig.delaySegundos}
                onChange={(e) =>
                  setApiConfig({ ...apiConfig, delaySegundos: Number(e.target.value) })
                }
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1.5px solid var(--color-border)',
                  maxWidth: '160px',
                }}
              />
            </div>
          </div>
        </AdminModal>
      )}

      {/* Modal Detalle de Cartera */}
      {selectedSuscriptor && (
        <AdminModal
          title={`Cartera de ${selectedSuscriptor.titular}`}
          onClose={() => setSelectedSuscriptor(null)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setSelectedSuscriptor(null)}
                type="button"
              >
                Cerrar
              </button>
              <button
                className="admin-button admin-button--primary"
                onClick={() => handleDescargarEstadoConsolidado(selectedSuscriptor)}
                type="button"
              >
                Descargar Estado PDF
              </button>
              <button
                type="button"
                className="btn-inst-action btn-inst-action--primary"
                onClick={() => handleCobroIndividual(selectedSuscriptor)}
              >
                <Icons.WhatsApp />
                <span>Cobrar por WhatsApp</span>
              </button>
            </>
          }
        >
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ margin: '0 0 0.35rem' }}>
              <strong>Cédula:</strong> {selectedSuscriptor.cedula} ·{' '}
              <strong>Celular:</strong> {selectedSuscriptor.celularDisplay}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Total adeudado ({selectedSuscriptor.cantidadFacturas} facturas):</strong>{' '}
              {money(selectedSuscriptor.totalAdeudado)}
            </p>
          </div>

          <div className="entity-table-wrap">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Predio</th>
                  <th>Periodo</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Saldo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {selectedSuscriptor.facturasPendientes.map((f) => (
                  <tr key={f.id}>
                    <td>{f.codigoPredio}</td>
                    <td>{formatPeriodo(f.mes, f.anio)}</td>
                    <td>{f.fechaVencimiento}</td>
                    <td>
                      <span className={`status-badge status-badge--${f.estado}`}>
                        {f.estado}
                      </span>
                    </td>
                    <td>{money(f.saldoPendiente)}</td>
                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-btn table-btn--outline"
                          onClick={() => handleDescargarPdf(f)}
                        >
                          PDF
                        </button>
                        <button
                          className="success table-btn"
                          type="button"
                          onClick={() => openPayModal(f)}
                        >
                          Pagar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminModal>
      )}

      {/* Modal Generar Facturas */}
      {modal && (
        <AdminModal
          title={modal === 'monthly' ? 'Generar facturas mensuales' : 'Generar factura'}
          onClose={() => setModal(null)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setModal(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="admin-button admin-button--primary"
                type="submit"
                form="factura-form"
                disabled={busy}
              >
                Generar
              </button>
            </>
          }
        >
          <form id="factura-form" className="admin-form" onSubmit={generate}>
            <div className="admin-form__grid">
              {modal === 'single' && (
                <label className="admin-form__field admin-form__field--full">
                  Predio
                  <select
                    required
                    value={form.predioId}
                    onChange={(e) => setForm({ ...form, predioId: e.target.value })}
                  >
                    <option value="">Selecciona</option>
                    {predios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigoPredio} · {p.nombrePredio}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="admin-form__field">
                Mes
                <input
                  required
                  type="number"
                  min="1"
                  max="12"
                  value={form.mes}
                  onChange={(e) => setForm({ ...form, mes: e.target.value })}
                />
              </label>
              <label className="admin-form__field">
                Año
                <input
                  required
                  type="number"
                  min="2020"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                />
              </label>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Modal Registrar Pago */}
      {paying && (
        <AdminModal
          title={`Registrar pago · ${paying.codigoPredio} (${paying.mes}/${paying.anio})`}
          onClose={() => !busy && setPaying(null)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setPaying(null)}
                type="button"
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                className="admin-button admin-button--primary"
                type="submit"
                form="pago-factura-form"
                disabled={busy}
              >
                {busy ? 'Registrando...' : 'Registrar pago'}
              </button>
            </>
          }
        >
          <div
            style={{
              marginBottom: '1.2rem',
              padding: '1rem',
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ margin: '0 0 0.35rem' }}>
              <strong>Propietario:</strong> {paying.nombrePropietario} ({paying.cedulaPropietario})
            </p>
            <p style={{ margin: '0 0 0.35rem' }}>
              <strong>Valor total factura:</strong> {money(paying.valorFactura)}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Saldo pendiente:</strong>{' '}
              {payBalance === null ? 'Consultando...' : money(payBalance)}
            </p>
          </div>

          <form id="pago-factura-form" className="admin-form" onSubmit={handlePaySubmit}>
            <div className="admin-form__grid">
              <label className="admin-form__field">
                Valor a pagar
                <input
                  required
                  min="1"
                  type="number"
                  value={payForm.valorPagado}
                  onChange={(e) => setPayForm({ ...payForm, valorPagado: e.target.value })}
                />
              </label>
              <label className="admin-form__field">
                Fecha de pago
                <input
                  required
                  type="date"
                  value={payForm.fechaPago}
                  onChange={(e) => setPayForm({ ...payForm, fechaPago: e.target.value })}
                />
              </label>
              <label className="admin-form__field admin-form__field--full">
                Método de pago
                <select
                  value={payForm.metodoPago}
                  onChange={(e) => setPayForm({ ...payForm, metodoPago: e.target.value })}
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-form__field admin-form__field--full">
                Observación
                <textarea
                  placeholder="Opcional: recibo, referencia de consignación o nota"
                  value={payForm.observacion}
                  onChange={(e) => setPayForm({ ...payForm, observacion: e.target.value })}
                />
              </label>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Modal Detalle Factura */}
      {detail && (
        <AdminModal
          title={`Factura ${detail.codigoPredio} · ${detail.mes}/${detail.anio}`}
          onClose={() => setDetail(null)}
          actions={
            <>
              <button
                className="admin-button admin-button--secondary"
                onClick={() => setDetail(null)}
                type="button"
              >
                Cerrar
              </button>
              <button
                className="admin-button admin-button--primary"
                onClick={() => handleDescargarPdf(detail)}
                type="button"
              >
                Descargar Factura PDF
              </button>
            </>
          }
        >
          <dl className="detail-grid">
            {Object.entries({
              Propietario: detail.nombrePropietario,
              Cédula: detail.cedulaPropietario,
              Predio: detail.codigoPredio,
              'Tipo de predio': detail.tipoPredio,
              Valor: money(detail.valorFactura),
              'Fecha de generación': detail.fechaGeneracion,
              Vencimiento: detail.fechaVencimiento,
              Estado: detail.estado,
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </AdminModal>
      )}

      {/* Confirmación Eliminar */}
      {deleting && (
        <ConfirmDialog
          title="Eliminar factura"
          message={`Se eliminará la factura ${deleting.codigoPredio} ${deleting.mes}/${deleting.anio}.`}
          busy={busy}
          error={error}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}

      {/* Confirmación Reiniciar Marcas */}
      {showConfirmResetHistory && (
        <ConfirmDialog
          title="Reiniciar marcas de envío de WhatsApp"
          message="¿Estás seguro de reiniciar el historial de contactos de hoy? Todos los suscriptores volverán a aparecer como 'Pendientes' para un nuevo ciclo de cobro."
          busy={false}
          onCancel={() => setShowConfirmResetHistory(false)}
          onConfirm={handleReiniciarHistorial}
        />
      )}
    </section>
  )
}

export default FacturasPage
