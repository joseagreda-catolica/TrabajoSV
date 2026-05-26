import { useState, useEffect } from 'react'
import { adminAPI, valoracionesAPI } from '../../api'

const STATS_CONFIG = [
  { key: 'total_usuarios',      label: 'Total Usuarios',    icon: 'bi-people-fill',    bg: '#eef2ff', color: '#2e3266'  },
  { key: 'total_empresas',      label: 'Empresas',          icon: 'bi-building-fill',  bg: '#ecfdf5', color: '#059669'  },
  { key: 'total_vacantes',      label: 'Vacantes Activas',  icon: 'bi-briefcase-fill', bg: '#fff7ed', color: '#ea580c'  },
  { key: 'total_postulaciones', label: 'Postulaciones',     icon: 'bi-send-fill',      bg: '#faf5ff', color: '#7c3aed'  },
]

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'bi-speedometer2',  label: 'Dashboard'           },
  { id: 'usuarios',  icon: 'bi-people-fill',   label: 'Usuarios'            },
  { id: 'empresas',  icon: 'bi-building-fill', label: 'Empresas Pendientes' },
]

export default function PanelAdmin() {
  const [tab,          setTab]      = useState('dashboard')
  const [usuarios,     setUsuarios] = useState([])
  const [empresas,     setEmpresas] = useState([])
  const [estadisticas, setStats]    = useState(null)
  const [loading,      setLoading]  = useState(true)
  const [mensaje,      setMensaje]  = useState(null)

  useEffect(() => {
    Promise.all([adminAPI.usuarios(), adminAPI.empresasPendientes(), adminAPI.estadisticas()])
      .then(([u, e, s]) => {
        setUsuarios(u.data.usuarios || [])
        setEmpresas(e.data.empresas || [])
        setStats(s.data)
      })
      .catch(err => {
        console.error(err);
        setMensaje({ tipo: 'danger', texto: 'Error cargando información' })
      })
      .finally(() => setLoading(false))
  }, [])


  async function toggleUsuario(id) {
    try {
      await adminAPI.toggleUsuario(id)
      setUsuarios(prev => prev.map(u => u.id_usuario === id ? { ...u, activo: !u.activo } : u))
    } catch {
      setMensaje({ tipo: 'danger', texto: 'No se pudo actualizar el usuario' })
    }
  }

  async function aprobarEmpresa(id) {
    try {
      await adminAPI.aprobarEmpresa(id)
      setEmpresas(prev => prev.filter(e => e.id_empresa !== id))
      setMensaje({ tipo: 'success', texto: 'Empresa aprobada exitosamente' })
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al aprobar empresa' })
    }
  }

  async function rechazarEmpresa(id) {
    try {
      await adminAPI.rechazarEmpresa(id)
      setEmpresas(prev => prev.filter(e => e.id_empresa !== id))
      setMensaje({ tipo: 'success', texto: 'Empresa rechazada' })
    } catch {
      setMensaje({ tipo: 'danger', texto: 'Error al rechazar empresa' })
    }
  }


  const topbarTitle = {
    dashboard: { title: 'Dashboard',              sub: 'Resumen general del sistema'               },
    usuarios:  { title: 'Gestión de Usuarios',    sub: 'Administra el acceso de todos los usuarios' },
    empresas:  { title: 'Empresas Pendientes',    sub: 'Aprobar o rechazar registros de empresas'   },
  }[tab]

  return (
    <div className="d-flex" style={{ height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      <div className="d-flex flex-column" style={{ width: 240, background: '#2e3266', flexShrink: 0 }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-white fw-bold fs-5">
            Trabajo<span style={{ color: 'goldenrod' }}>SV</span>
          </span>
          <span className="ms-2 text-white-50 small">Admin</span>
        </div>

        <div className="p-3 flex-grow-1 d-flex flex-column gap-1">
          <div className="text-uppercase small fw-bold px-2 mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            Panel
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className="btn text-start d-flex align-items-center gap-2 w-100 px-3 py-2 rounded-2"
              style={{
                color:      tab === item.id ? '#fff' : 'rgba(255,255,255,0.65)',
                background: tab === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: 'none', fontSize: '0.875rem', fontWeight: 500,
              }}
              onClick={() => setTab(item.id)}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: '1.1rem' }}></i>
              <span className="flex-grow-1">{item.label}</span>
              {item.id === 'empresas' && empresas.length > 0 && (
                <span className="badge bg-danger">{empresas.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow-1" style={{ background: '#E8E5D9', overflowY: 'auto' }}>

        <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 10 }}>
          <div>
            <h6 className="fw-bold mb-0" style={{ color: '#1a1d2e' }}>{topbarTitle.title}</h6>
            <small className="text-muted">{topbarTitle.sub}</small>
          </div>
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
              {estadisticas && (
                <div className="row g-3 mb-4">
                  {STATS_CONFIG.map(s => (
                    <div className="col-6 col-xl-3" key={s.key}>
                      <div className="rounded-3 p-4 d-flex align-items-center justify-content-between shadow-sm" style={{ background: '#E8E5D9', border: 'none' }}>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#1a1d2e' }}>
                            {estadisticas[s.key] ?? '—'}
                          </div>
                          <div className="mt-1 fw-medium" style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.label}</div>
                        </div>
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: s.bg }}>
                          <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.4rem' }}></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'dashboard' && (
                <div className="rounded-3 overflow-hidden shadow-sm" style={{ background: '#E8E5D9' }}>
                  <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: '#f3f4f6' }}>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1a1d2e' }}>Gestión de Usuarios</h6>
                      <small className="text-muted">Administra el acceso de todos los usuarios</small>
                    </div>
                    <span className="text-muted small">{usuarios.length} usuarios</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Usuario</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Rol</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Estado</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none', textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-muted py-4">No hay usuarios registrados</td></tr>
                        ) : usuarios.map(u => (
                          <tr key={u.id_usuario} style={{ borderColor: '#f3f4f6' }}>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold" style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #2e3266, #4a51b5)', fontSize: '0.8rem', flexShrink: 0 }}>
                                  {u.nombre?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-semibold small">{u.nombre} {u.apellido}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <span className="badge rounded-pill" style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', background: '#eef2ff', color: '#2e3266', textTransform: 'capitalize' }}>
                                {u.rol}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <span className={`badge rounded-pill ${u.activo ? 'bg-success' : 'bg-secondary'}`}>
                                {u.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <button
                                onClick={() => toggleUsuario(u.id_usuario)}
                                className={`btn btn-sm rounded-pill px-3 ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                style={{ fontSize: '0.78rem' }}
                              >
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'usuarios' && (
                <div className="rounded-3 overflow-hidden shadow-sm" style={{ background: '#E8E5D9' }}>
                  <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: '#f3f4f6' }}>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1a1d2e' }}>Gestión de Usuarios</h6>
                      <small className="text-muted">Administra el acceso de todos los usuarios</small>
                    </div>
                    <span className="text-muted small">{usuarios.length} usuarios</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Usuario</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Rol</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Estado</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none', textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-muted py-5">
                            <i className="bi bi-people fs-1 d-block mb-2"></i>
                            No hay usuarios registrados
                          </td></tr>
                        ) : usuarios.map(u => (
                          <tr key={u.id_usuario} style={{ borderColor: '#f3f4f6' }}>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold" style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #2e3266, #4a51b5)', fontSize: '0.8rem', flexShrink: 0 }}>
                                  {u.nombre?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-semibold small">{u.nombre} {u.apellido}</div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <span className="badge rounded-pill" style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', background: '#eef2ff', color: '#2e3266', textTransform: 'capitalize' }}>
                                {u.rol}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <span className={`badge rounded-pill ${u.activo ? 'bg-success' : 'bg-secondary'}`}>
                                {u.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <button
                                onClick={() => toggleUsuario(u.id_usuario)}
                                className={`btn btn-sm rounded-pill px-3 ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                style={{ fontSize: '0.78rem' }}
                              >
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'empresas' && (
                <div className="rounded-3 overflow-hidden shadow-sm" style={{ background: '#E8E5D9' }}>
                  <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: '#f3f4f6' }}>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1a1d2e' }}>Empresas Pendientes de Aprobación</h6>
                      <small className="text-muted">Listado de empresas que requieren revisión</small>
                    </div>
                    <span className="text-muted small">{empresas.length} pendientes</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Empresa</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Sector</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none' }}>Ubicación</th>
                          <th style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 24px', border: 'none', textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empresas.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-muted py-5">
                            <i className="bi bi-building-check fs-1 d-block mb-2"></i>
                            No hay empresas pendientes — todo está al día
                          </td></tr>
                        ) : empresas.map(e => (
                          <tr key={e.id_empresa} style={{ borderColor: '#f3f4f6' }}>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle' }}>
                              <div className="fw-semibold small" style={{ color: '#1a1d2e' }}>{e.nombre_empresa}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{e.email_usuario}</div>
                            </td>
                            <td className="small text-muted" style={{ padding: '14px 24px', verticalAlign: 'middle' }}>{e.sector || '—'}</td>
                            <td className="small text-muted" style={{ padding: '14px 24px', verticalAlign: 'middle' }}>{e.ubicacion || '—'}</td>
                            <td style={{ padding: '14px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <div className="d-flex gap-2 justify-content-end">
                                <button onClick={() => aprobarEmpresa(e.id_empresa)} className="btn btn-sm btn-success rounded-pill px-3">
                                  <i className="bi bi-check-lg me-1"></i>Aprobar
                                </button>
                                <button onClick={() => rechazarEmpresa(e.id_empresa)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                  <i className="bi bi-x-lg me-1"></i>Rechazar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

    </div>
  )
}
