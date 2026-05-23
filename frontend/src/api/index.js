import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  logout:         ()     => api.post('/auth/logout'),
  checkSession:   ()     => api.get('/auth/check-session'),
}

export const vacantesAPI = {
  listar:    (params) => api.get('/vacantes', { params }),
  detalle:   (id)     => api.get(`/vacantes/${id}`),
  postular:  (id, data) => api.post(`/vacantes/${id}/postular`, data),
}

export const candidatoAPI = {
  perfil:        ()     => api.get('/candidato/perfil'),
  actualizar:    (data) => api.put('/candidato/perfil', data),
  postulaciones: ()     => api.get('/candidato/postulaciones'),
  alertas:       ()     => api.get('/candidato/alertas'),
  crearAlerta:   (data) => api.post('/candidato/alertas', data),
  eliminarAlerta:(id)   => api.delete(`/candidato/alertas/${id}`),
}

export const empresaAPI = {
  perfil:         ()     => api.get('/empresa/perfil'),
  actualizar:     (data) => api.put('/empresa/perfil', data),
  vacantes:       ()     => api.get('/empresa/vacantes'),
  crearVacante:   (data) => api.post('/empresa/vacantes', data),
  actualizarVacante: (id, data) => api.put(`/empresa/vacantes/${id}`, data),
  eliminarVacante:(id)   => api.delete(`/empresa/vacantes/${id}`),
  postulaciones:  (id)   => api.get(`/empresa/vacantes/${id}/postulaciones`),
}

export const forosAPI = {
  listar:     (params) => api.get('/foros', { params }),
  detalle:    (id)     => api.get(`/foros/${id}`),
  crear:      (data)   => api.post('/foros', data),
  responder:  (id, data) => api.post(`/foros/${id}/respuestas`, data),
}

export const recursosAPI = {
  listar:  (params) => api.get('/recursos', { params }),
  detalle: (id)     => api.get(`/recursos/${id}`),
}

export const adminAPI = {
  usuarios:           ()     => api.get('/admin/usuarios'),
  toggleUsuario:      (id)   => api.put(`/admin/usuarios/${id}/toggle`),
  empresasPendientes: ()     => api.get('/admin/empresas/pendientes'),
  aprobarEmpresa:     (id)   => api.put(`/admin/empresas/${id}/aprobar`),
  rechazarEmpresa:    (id)   => api.put(`/admin/empresas/${id}/rechazar`),
  estadisticas:       ()     => api.get('/admin/estadisticas'),
}

export default api
