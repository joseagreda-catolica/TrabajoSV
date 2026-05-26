import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidatoAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

const ESTADOS = {
  enviada:     { label: 'Enviada',     dot: '#3b82f6' },
  en_revision: { label: 'En revisión', dot: '#facc15' },
  entrevista:  { label: 'Entrevista',  dot: '#a855f7' },
  contratado:  { label: 'Contratado',  dot: '#4ade80' },
  rechazada:   { label: 'Rechazada',   dot: '#ef4444' },
}

export default function PerfilUsuario() {
  const { user }                          = useAuth()
  const [perfil, setPerfil]               = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [loading, setLoading]             = useState(true)
  const [mensaje, setMensaje]             = useState(null)
  const [editForm, setEditForm]           = useState({})
  const [guardando, setGuardando]         = useState(false)

  useEffect(() => {
    Promise.all([candidatoAPI.perfil(), candidatoAPI.postulaciones()])
      .then(([rPerfil, rPost]) => {
        const p = rPerfil.data.candidato || rPerfil.data.perfil || rPerfil.data
        setPerfil(p)
        setEditForm({
          titulo_profesional: p?.titulo_profesional || '',
          ubicacion:          p?.ubicacion          || '',
          telefono:           p?.telefono           || '',
          resumen:            p?.resumen            || '',
          habilidades:        p?.habilidades        || '',
        })
        setPostulaciones(rPost.data.postulaciones || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleGuardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      await candidatoAPI.actualizar(editForm)
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' })
      document.getElementById('btnCerrarModal')?.click()
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar el perfil' })
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-secondary"></div>
      </div>
    )
  }

  const habilidades = perfil?.habilidades
    ? perfil.habilidades.split(',').map(h => h.trim()).filter(Boolean)
    : []

  return (
    <>
      <div className="ts-profile-hero">
        <div className="container">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div className="ts-profile-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div>
              <h4 className="text-white fw-bold mb-1">
                {user?.nombre} {user?.apellido}
              </h4>
              <p className="text-white-50 mb-1 small">
                {perfil?.titulo_profesional || ''}
                {perfil?.titulo_profesional && perfil?.ubicacion ? ' · ' : ''}
                {perfil?.ubicacion || ''}
              </p>
              <p className="text-white-50 mb-0 small">{user?.email}</p>
            </div>
            <div className="ms-auto">
              <button
                className="btn btn-light btn-sm rounded-pill px-3 shadow-sm"
                data-bs-toggle="modal"
                data-bs-target="#modalEditarPerfil"
              >
                <i className="bi bi-pencil-fill me-1"></i>Editar perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="container mt-3">
          <div className={`alert alert-${mensaje.tipo} py-2 small`} onClick={() => setMensaje(null)}>
            {mensaje.texto}
          </div>
        </div>
      )}

      <div className="container ts-profile-card-wrapper pb-5">
        <div className="row g-4">

          <div className="col-md-4 d-flex flex-column gap-3">

            <div className="ts-info-card-box">
              <div className="ts-info-card-header">
                <span className="ts-section-label">
                  <i className="bi bi-person-lines-fill me-1"></i>Sobre mí
                </span>
              </div>
              <div className="ts-info-card-body">
                <p className="small text-secondary mb-0">
                  {perfil?.resumen || '—'}
                </p>
              </div>
            </div>

            <div className="ts-info-card-box">
              <div className="ts-info-card-header">
                <span className="ts-section-label">
                  <i className="bi bi-telephone-fill me-1"></i>Contacto
                </span>
              </div>
              <div className="ts-info-card-body d-flex flex-column gap-2">
                {perfil?.telefono && (
                  <div className="small text-secondary">
                    <i className="bi bi-telephone me-1"></i>{perfil.telefono}
                  </div>
                )}
                {perfil?.ubicacion && (
                  <div className="small text-secondary">
                    <i className="bi bi-geo-alt me-1"></i>{perfil.ubicacion}
                  </div>
                )}
                {!perfil?.telefono && !perfil?.ubicacion && (
                  <p className="small text-muted mb-0">Sin información de contacto.</p>
                )}
              </div>
            </div>

            {habilidades.length > 0 && (
              <div className="ts-info-card-box">
                <div className="ts-info-card-header">
                  <span className="ts-section-label">
                    <i className="bi bi-tools me-1"></i>Habilidades
                  </span>
                </div>
                <div className="ts-info-card-body d-flex flex-wrap gap-2">
                  {habilidades.map((h, i) => (
                    <span key={i} className="badge rounded-pill" style={{ background: '#eef2ff', color: '#2e3266', border: '1px solid #c7d2fe', fontWeight: 600 }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="col-md-8">
            <div className="ts-info-card-box">
              <div className="ts-info-card-header">
                <span className="ts-section-label">
                  <i className="bi bi-send-fill me-1"></i>Mis Postulaciones
                </span>
                <Link to="/postulaciones" className="btn btn-sm btn-outline-secondary rounded-pill">
                  Ver todas
                </Link>
              </div>
              <div className="ts-info-card-body d-flex flex-column gap-2">
                {postulaciones.length === 0 && (
                  <p className="text-muted small text-center py-3">
                    Aún no te has postulado a ninguna vacante.{' '}
                    <Link to="/empleos">Buscar empleos</Link>
                  </p>
                )}
                {postulaciones.slice(0, 8).map(p => {
                  const est = ESTADOS[p.estado] || { label: p.estado, dot: '#94a3b8' }
                  return (
                    <div key={p.id_postulacion} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ border: '1px solid #f3f4f6', background: '#fff', transition: 'box-shadow 0.15s' }}>
                      <div>
                        <div className="fw-semibold small" style={{ color: '#1a1d2e' }}>
                          {p.titulo_vacante || p.titulo}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.nombre_empresa}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(p.fecha_postulacion || p.fecha).toLocaleDateString('es-SV')}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: est.dot, marginRight: 5 }}></span>
                        <span className="small text-secondary">{est.label}</span>
                        <Link to={`/vacante/${p.id_vacante}`} className="btn btn-sm btn-outline-secondary rounded-pill ms-1" style={{ fontSize: '0.72rem' }}>
                          Ver
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="modal fade" id="modalEditarPerfil" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold">Editar Perfil</h5>
              <button id="btnCerrarModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleGuardar}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Título Profesional</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. Desarrollador Full Stack"
                      value={editForm.titulo_profesional || ''}
                      onChange={e => setEditForm(p => ({ ...p, titulo_profesional: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Ubicación</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. San Salvador"
                      value={editForm.ubicacion || ''}
                      onChange={e => setEditForm(p => ({ ...p, ubicacion: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. 7000-0000"
                      value={editForm.telefono || ''}
                      onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Habilidades</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="React, Node.js, SQL..."
                      value={editForm.habilidades || ''}
                      onChange={e => setEditForm(p => ({ ...p, habilidades: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Resumen Profesional</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Cuéntanos sobre ti, tus habilidades y experiencia..."
                      value={editForm.resumen || ''}
                      onChange={e => setEditForm(p => ({ ...p, resumen: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold rounded-pill py-2 mt-4"
                  disabled={guardando}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
