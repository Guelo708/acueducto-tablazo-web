import api from './api.js'

export async function consultarEstadoCuentaPublico({ identificador, ultimos4Celular }) {
  const { data } = await api.post('/api/public/estado-cuenta', {
    identificador: identificador?.trim(),
    ultimos4Celular: ultimos4Celular?.trim() || '',
  })
  return data
}