import api from './api.js'

export async function consultarEstadoCuentaPublico({ identificador, ultimos4Celular }) {
  const { data } = await api.post('/public/estado-cuenta', {
    identificador: identificador?.trim(),
    ultimos4Celular: ultimos4Celular?.trim() || '',
  })
  return data
}

export async function verificarReciboPublico({ id, firma }) {
  const { data } = await api.get('/public/recibos/verificar', {
    params: { id, firma },
  })
  return data
}