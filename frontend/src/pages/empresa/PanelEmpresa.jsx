import { useState, useEffect } from 'react'
import { empresaAPI, valoracionesAPI } from '../../api'

const ESTADO_LABELS = {
  enviada:     'Enviada',
  en_revision: 'En revisión',
  entrevista:  'Entrevista',
  contratado:  'Contratado',
  rechazada:   'Rechazada',
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'bi-grid-1x2-fill',        label: 'Dashboard'      },
  { id: 'vacantes',  icon: 'bi-briefcase-fill',        label: 'Mis Vacantes'   },
  { id: 'perfil',    icon: 'bi-building-fill',         label: 'Perfil Empresa' },
]

export default function PanelEmpresa() {
  const [empresa,    setEmpresa]   = useState(null)
  const [stats,      setStats]     = useState(null)
  const [vacantes,   setVacantes]  = useState([])
  const [loading,    setLoading]   = useState(true)
  const [mensaje,    setMensaje]   = useState(null)
  const [activeNav,  setActiveNav] = useState('dashboard')

  const [nueva, setNueva] = useState({
    titulo: '', descripcion: '', ubicacion: '',
    tipo_contrato: 'tiempo_completo', nivel_experiencia: 'junior',
    salario_min: '', salario_max: '', fecha_cierre: '',
  })
  const [guardandoVacante, setGuardandoVacante] = useState(false)

  const [editEmpresa,      setEditEmpresa]      = useState({})
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false)

  const [vacanteModal,      setVacanteModal]      = useState(null)
  const [aplicantes,        setAplicantes]        = useState([])
  const [loadingAplicantes, setLoadingAplicantes] = useState(false)

  const [valoraciones, setValoraciones] = useState([])
  const [promedio, setPromedio] = useState(null)

  function cargarPanel() {
    return empresaAPI.panel().then(({ data }) => {
      setEmpresa(data.empresa)
      setStats(data.stats)
      setVacantes(data.vacantes || [])
      setEditEmpresa({
        nombre_empresa: data.empresa?.nombre_empresa || '',
        sector:         data.empresa?.sector         || '',
        ubicacion:      data.empresa?.ubicacion      || '',
        telefono:       data.empresa?.telefono       || '',
        sitio_web:      data.empresa?.sitio_web      || '',
        descripcion:    data.empresa?.descripcion    || '',
      })

      if (data.empresa?.id_empresa) {
        return valoracionesAPI.obtener(data.empresa.id_empresa).then(({ data: ratingsData }) => {
          setValoraciones(ratingsData.valoraciones || [])
          setPromedio(ratingsData.promedio?.promedio || null)
        }).catch(() => {})
      }
    })
  }

  useEffect(() => {
    cargarPanel()
      .catch(() => setMensaje({ tipo: 'danger', texto: 'Error al cargar el panel' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleCrearVacante(e) {
    e.preventDefault()
    setGuardandoVacante(true)
    try {
      await empresaAPI.crearVacante(nueva)
      await cargarPanel()
      setNueva({ titulo: '', descripcion: '', ubicacion: '', tipo_contrato: 'tiempo_completo', nivel_experiencia: 'junior', salario_min: '', salario_max: '', fecha_cierre: '' })
      setMensaje({ tipo: 'success', texto: 'Vacante publicada exitosamente' })
      document.getElementById('btnCerrarModalVacante')?.click()
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.response?.data?.message || 'Error al publicar vacante' })
    } finally {
      setGuardandoVacante(false)
    }
  }

  async function handleGuardarEmpresa(e) {
    e.preventDefault()
    setGuardandoEmpresa(true)
    try {
      await empresaAPI.actualizar(editEmpresa)
      setEmpresa(prev => ({ ...prev, ...editEmpresa }))
      setMensaje({ tipo: 'success', texto: 'Datos de empresa actualizados' })
      document.getElementById('btnCerrarModalEmpresa')?.click()
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar empresa' })
    } finally {
      setGuardandoEmpresa(false)
    }
  }

  async function handleVerPostulaciones(vacante) {
    setVacanteModal(vacante)
    setAplicantes([])
    setLoadingAplicantes(true)
    try {
      const { data } = await empresaAPI.postulaciones(vacante.id_vacante)
      setAplicantes(data.postulaciones || [])
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar postulaciones' })
    } finally {
      setLoadingAplicantes(false)
    }
  }

  async function handleActualizarPostulacion(idPost, estado) {
    try {
      await empresaAPI.actualizarPostulacion(idPost, estado)
      setAplicantes(prev => prev.map(p => p.id_postulacion === idPost ? { ...p, estado } : p))

      // Si se contrata a alguien, cerrar la vacante
      if (estado === 'contratado' && vacanteModal) {
        setVacantes(prev => prev.map(v =>
          v.id_vacante === vacanteModal.id_vacante ? { ...v, estado: 'cerrada' } : v
        ))
        setMensaje({ tipo: 'success', texto: 'Candidato contratado y vacante cerrada' })
      }
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar estado' })
    }
  }

  async function handleCambiarEstado(id, estado) {
    try {
      await empresaAPI.actualizarVacante(id, { estado })
      setVacantes(prev => prev.map(v => v.id_vacante === id ? { ...v, estado } : v))
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado' })
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm('¿Seguro que deseas eliminar esta vacante? Esta acción no se puede deshacer.')) return
    try {
      await empresaAPI.eliminarVacante(id)
      setVacantes(prev => prev.filter(v => v.id_vacante !== id))
      setMensaje({ tipo: 'success', texto: 'Vacante eliminada' })
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar la vacante' })
    }
  }

  const sidebarLink = (item) => ({
    color:      activeNav === item.id ? '#fff' : 'rgba(255,255,255,0.7)',
    background: activeNav === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderLeft: `4px solid ${activeNav === item.id ? '#d4b991' : 'transparent'}`,
    padding: '12px 20px',
    fontSize: '0.9rem',
    display: 'block',
    textDecoration: 'none',
    transition: 'all .2s',
    cursor: 'pointer',
  })

  return (
    <div className="d-flex" style={{ height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      <div className="d-flex flex-column py-4" style={{ width: 240, background: '#2c3e60', flexShrink: 0 }}>
        <div className="text-white fw-bold fs-5 px-4 mb-4 d-flex align-items-center gap-2">
          <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: '#d4b991' }}>
            <i className="bi bi-buildings text-white" style={{ fontSize: '0.9rem' }}></i>
          </div>
          Trabajo<span style={{ color: 'goldenrod' }}>SV</span>
        </div>

        <nav>
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={sidebarLink(item)}
              onClick={() => setActiveNav(item.id)}
            >
              <i className={`bi ${item.icon} me-3`}></i>{item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-grow-1" style={{ overflowY: 'auto', background: '#f3f3f1' }}>

        <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 10 }}>
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#2c3e60' }}>Panel Corporativo</h5>
            <small className="text-muted">{empresa?.nombre_empresa || 'Gestionando Reclutamiento'}</small>
          </div>
          <button
            className="btn fw-semibold px-4 rounded-pill shadow-sm"
            style={{ background: 'rgb(215,160,20)', color: '#fff', border: 'none' }}
            data-bs-toggle="modal"
            data-bs-target="#modalVacante"
          >
            <i className="bi bi-plus-lg me-1"></i>Publicar Vacante
          </button>
        </div>

        <div className="p-4">

          {mensaje && (
            <div className={`alert alert-${mensaje.tipo} py-2 small mb-3`} style={{ cursor: 'pointer' }} onClick={() => setMensaje(null)}>
              {mensaje.texto}
            </div>
          )}

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-secondary"></div>
            </div>
          )}

          {!loading && (
            <>
              <section id="dashboard" className="mb-4">
                <div className="row g-3">
                  {[
                    { label: 'Postulaciones',   value: stats?.candidatos_activos ?? '—', icon: 'bi-people',     color: '#2c3e60'  },
                    { label: 'Vacantes Activas', value: stats?.vacantes_abiertas  ?? '—', icon: 'bi-briefcase',  color: '#2c3e60'  },
                    { label: 'Reputación ★',    value: stats?.reputacion          ?? '—', icon: 'bi-star-fill',  color: '#facc15'  },
                  ].map(s => (
                    <div className="col-md-4" key={s.label}>
                      <div className="card border-0 shadow-sm p-4" style={{ background: '#ebe8de', borderRadius: 4 }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="text-muted small fw-bold text-uppercase mb-1">{s.label}</p>
                            <h2 className="fw-bold mb-0" style={{ color: '#2c3e60' }}>{s.value}</h2>
                          </div>
                          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 45, height: 45, flexShrink: 0 }}>
                            <i className={`bi ${s.icon} fs-4`} style={{ color: s.color }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="vacantes" className="bg-white p-4 mb-4 shadow-sm" style={{ borderRadius: 4 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-list-task me-2" style={{ color: '#d4b991' }}></i>Gestión de Vacantes
                  </h5>
                  <span className="text-muted small">{vacantes.length} vacantes</span>
                </div>

                {vacantes.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-briefcase-x fs-1 d-block mb-2"></i>
                    No tienes vacantes publicadas. Usa el botón <strong>Publicar Vacante</strong> para comenzar.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="text-muted small" style={{ background: '#f3f3f1' }}>
                          <th className="border-0" style={{ background: '#f3f3f1' }}>CARGO</th>
                          <th className="border-0" style={{ background: '#f3f3f1' }}>FECHA</th>
                          <th className="border-0" style={{ background: '#f3f3f1' }}>ESTADO</th>
                          <th className="border-0" style={{ background: '#f3f3f1' }}>CANDIDATOS</th>
                          <th className="border-0 text-end" style={{ background: '#f3f3f1' }}>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacantes.map(v => (
                          <tr key={v.id_vacante}>
                            <td className="fw-bold" style={{ color: '#2c3e60' }}>{v.titulo}</td>
                            <td className="text-muted small">
                              {new Date(v.fecha_publicacion).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td>
                              <span
                                className="badge rounded-pill"
                                style={{
                                  fontSize: '0.72rem', padding: '4px 12px',
                                  background: v.estado === 'activa' ? '#d1fae5' : '#f1f5f9',
                                  color:      v.estado === 'activa' ? '#065f46' : '#64748b',
                                }}
                              >
                                {v.estado === 'activa' ? 'Activa' : 'Cerrada'}
                              </span>
                            </td>
                            <td><span className="fw-bold">{v.total_postulaciones || 0}</span></td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-light me-1"
                                title="Ver postulaciones"
                                data-bs-toggle="modal"
                                data-bs-target="#modalPostulaciones"
                                onClick={() => handleVerPostulaciones(v)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {v.estado === 'activa'
                                ? <button className="btn btn-sm btn-light me-1" title="Cerrar vacante" onClick={() => handleCambiarEstado(v.id_vacante, 'cerrada')}>
                                    <i className="bi bi-pause-circle"></i>
                                  </button>
                                : <button className="btn btn-sm btn-light me-1" title="Reactivar" onClick={() => handleCambiarEstado(v.id_vacante, 'activa')}>
                                    <i className="bi bi-play-circle"></i>
                                  </button>
                              }
                              <button className="btn btn-sm btn-light text-danger" title="Eliminar" onClick={() => handleEliminar(v.id_vacante)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section id="perfil" className="bg-white p-4 mb-4 shadow-sm" style={{ borderRadius: 4 }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#2c3e60' }}>Perfil de la Empresa</h5>
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEditarEmpresa"
                  >
                    <i className="bi bi-pencil-square me-1"></i>Actualizar Datos
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Nombre Comercial</label>
                    <span className="fw-semibold">{empresa?.nombre_empresa || '—'}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Sector</label>
                    <span className="fw-semibold">{empresa?.sector || '—'}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Ubicación</label>
                    <span className="fw-semibold">{empresa?.ubicacion || '—'}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Teléfono</label>
                    <span className="fw-semibold">{empresa?.telefono || '—'}</span>
                  </div>
                  {empresa?.sitio_web && (
                    <div className="col-md-6">
                      <label className="text-muted small d-block">Sitio Web</label>
                      <a href={empresa.sitio_web} target="_blank" rel="noreferrer" className="fw-semibold text-decoration-none" style={{ color: '#2c3e60' }}>
                        {empresa.sitio_web}
                      </a>
                    </div>
                  )}
                  {empresa?.descripcion && (
                    <div className="col-12">
                      <label className="text-muted small d-block">Descripción</label>
                      <span className="small">{empresa.descripcion}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white p-4 mb-4 shadow-sm" style={{ borderRadius: 4 }}>
                <h5 className="fw-bold mb-4" style={{ color: '#2c3e60' }}>
                  <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>Valoraciones
                </h5>

                {promedio !== null && (
                  <div className="mb-4 p-3 rounded-3" style={{ background: '#fffbf0' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-center">
                        <h3 className="fw-bold mb-1" style={{ color: '#2c3e60', fontSize: '2rem' }}>
                          {typeof promedio === 'number' ? promedio.toFixed(1) : '—'}
                        </h3>
                        <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                          {'★'.repeat(Math.round(promedio || 0))}
                          {'☆'.repeat(5 - Math.round(promedio || 0))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted mb-0">
                          <strong>{valoraciones.length}</strong> valoración{valoraciones.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {valoraciones.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>
                    Aún no hay valoraciones de candidatos.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {valoraciones.map(v => (
                      <div key={v.id_valoracion} className="border rounded-2 p-3" style={{ background: '#fafaf8' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <p className="fw-semibold mb-1" style={{ color: '#2c3e60' }}>
                              {v.nombre} {v.apellido}
                            </p>
                            <div style={{ color: '#ffc107', fontSize: '0.9rem' }}>
                              {'★'.repeat(v.puntuacion)}
                              {'☆'.repeat(5 - v.puntuacion)}
                            </div>
                          </div>
                          <small className="text-muted">
                            {new Date(v.fecha).toLocaleDateString('es-SV')}
                          </small>
                        </div>
                        {v.comentario && (
                          <p className="text-secondary small mb-0" style={{ fontSize: '0.9rem' }}>
                            "{v.comentario}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <div className="modal fade" id="modalVacante" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 4 }}>
            <div className="modal-header border-0 text-white" style={{ background: '#2c3e60' }}>
              <h5 className="modal-title fw-bold">Nueva Vacante</h5>
              <button id="btnCerrarModalVacante" type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4 bg-light">
              <form onSubmit={handleCrearVacante}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Título del puesto *</label>
                    <input
                      type="text" className="form-control border-0 shadow-sm" required
                      placeholder="Ej. Desarrollador Senior Java"
                      value={nueva.titulo}
                      onChange={e => setNueva(p => ({ ...p, titulo: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Ubicación</label>
                    <input
                      type="text" className="form-control border-0 shadow-sm"
                      placeholder="Ej. San Salvador"
                      value={nueva.ubicacion}
                      onChange={e => setNueva(p => ({ ...p, ubicacion: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Tipo de Contrato</label>
                    <select className="form-select border-0 shadow-sm" value={nueva.tipo_contrato} onChange={e => setNueva(p => ({ ...p, tipo_contrato: e.target.value }))}>
                      <option value="tiempo_completo">Tiempo Completo</option>
                      <option value="medio_tiempo">Tiempo Parcial</option>
                      <option value="freelance">Freelance</option>
                      <option value="practicas">Prácticas</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Nivel de Experiencia</label>
                    <select className="form-select border-0 shadow-sm" value={nueva.nivel_experiencia} onChange={e => setNueva(p => ({ ...p, nivel_experiencia: e.target.value }))}>
                      <option value="sin_experiencia">Sin experiencia</option>
                      <option value="junior">Junior</option>
                      <option value="semi_senior">Semi-Senior</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Fecha de Cierre</label>
                    <input
                      type="date" className="form-control border-0 shadow-sm"
                      value={nueva.fecha_cierre}
                      onChange={e => setNueva(p => ({ ...p, fecha_cierre: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Salario Mínimo</label>
                    <input
                      type="number" className="form-control border-0 shadow-sm"
                      placeholder="Ej. 800"
                      value={nueva.salario_min}
                      onChange={e => setNueva(p => ({ ...p, salario_min: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Salario Máximo</label>
                    <input
                      type="number" className="form-control border-0 shadow-sm"
                      placeholder="Ej. 1500"
                      value={nueva.salario_max}
                      onChange={e => setNueva(p => ({ ...p, salario_max: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Descripción</label>
                    <textarea
                      className="form-control border-0 shadow-sm" rows={4}
                      placeholder="Describe los requisitos y responsabilidades del puesto..."
                      value={nueva.descripcion}
                      onChange={e => setNueva(p => ({ ...p, descripcion: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn w-100 mt-4 py-2 fw-bold shadow-sm"
                  style={{ background: '#d4b991', color: '#fff', border: 'none' }}
                  disabled={guardandoVacante}
                >
                  {guardandoVacante ? 'Publicando...' : 'PUBLICAR AHORA'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modalEditarEmpresa" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 4 }}>
            <div className="modal-header border-0 text-white" style={{ background: '#2c3e60' }}>
              <h5 className="modal-title fw-bold">Actualizar Datos de Empresa</h5>
              <button id="btnCerrarModalEmpresa" type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4 bg-light">
              <form onSubmit={handleGuardarEmpresa}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Nombre Comercial</label>
                    <input
                      type="text" className="form-control border-0 shadow-sm"
                      value={editEmpresa.nombre_empresa || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, nombre_empresa: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Sector</label>
                    <input
                      type="text" className="form-control border-0 shadow-sm"
                      placeholder="Ej. Tecnología e Información"
                      value={editEmpresa.sector || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, sector: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Ubicación</label>
                    <input
                      type="text" className="form-control border-0 shadow-sm"
                      placeholder="Ej. San Salvador"
                      value={editEmpresa.ubicacion || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, ubicacion: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Teléfono</label>
                    <input
                      type="tel" className="form-control border-0 shadow-sm"
                      placeholder="+503 7777-7777"
                      value={editEmpresa.telefono || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, telefono: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Sitio Web</label>
                    <input
                      type="url" className="form-control border-0 shadow-sm"
                      placeholder="https://ejemplo.com"
                      value={editEmpresa.sitio_web || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, sitio_web: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Descripción</label>
                    <textarea
                      className="form-control border-0 shadow-sm" rows={4}
                      placeholder="Describe tu empresa..."
                      value={editEmpresa.descripcion || ''}
                      onChange={e => setEditEmpresa(p => ({ ...p, descripcion: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn w-100 mt-4 py-2 fw-bold shadow-sm"
                  style={{ background: '#d4b991', color: '#fff', border: 'none' }}
                  disabled={guardandoEmpresa}
                >
                  {guardandoEmpresa ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modalPostulaciones" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 4 }}>
            <div className="modal-header border-0 text-white" style={{ background: '#2c3e60' }}>
              <h5 className="modal-title fw-bold">
                Postulaciones — {vacanteModal?.titulo}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              {loadingAplicantes && (
                <div className="text-center py-4">
                  <div className="spinner-border text-secondary"></div>
                </div>
              )}
              {!loadingAplicantes && aplicantes.length === 0 && (
                <p className="text-muted text-center py-3">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No hay postulaciones para esta vacante aún.
                </p>
              )}
              {aplicantes.map(p => (
                <div key={p.id_postulacion} className="border rounded-3 p-3 mb-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div className="fw-bold">{p.nombre} {p.apellido}</div>
                      <div className="text-muted small">{p.email}</div>
                      {p.titulo_profesional && <div className="text-muted small">{p.titulo_profesional}</div>}
                      {p.carta_presentacion && (
                        <p className="mt-2 mb-0 small fst-italic text-secondary">"{p.carta_presentacion}"</p>
                      )}
                    </div>
                    <div className="text-end">
                      <div className="text-muted small mb-1">
                        {new Date(p.fecha_postulacion).toLocaleDateString('es-SV')}
                      </div>
                      <span className={`badge rounded-pill ${
                        p.estado === 'contratado'  ? 'bg-success'            :
                        p.estado === 'rechazada'   ? 'bg-danger'             :
                        p.estado === 'entrevista'  ? 'bg-warning text-dark'  :
                        p.estado === 'en_revision' ? 'bg-info text-dark'     : 'bg-secondary'
                      }`}>
                        {ESTADO_LABELS[p.estado] || p.estado}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button
                      className="btn btn-sm btn-success"
                      disabled={p.estado === 'contratado'}
                      onClick={() => handleActualizarPostulacion(p.id_postulacion, 'contratado')}
                    >Contratar</button>
                    <button
                      className="btn btn-sm btn-warning"
                      disabled={p.estado === 'entrevista'}
                      onClick={() => handleActualizarPostulacion(p.id_postulacion, 'entrevista')}
                    >Entrevista</button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={p.estado === 'rechazada'}
                      onClick={() => handleActualizarPostulacion(p.id_postulacion, 'rechazada')}
                    >Rechazar</button>
                    {p.cv_url && (
                      <a href={p.cv_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary ms-auto">
                        <i className="bi bi-file-earmark-person me-1"></i>Ver CV
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
