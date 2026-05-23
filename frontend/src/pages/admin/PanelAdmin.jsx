import { useState, useEffect } from 'react'
import { adminAPI } from '../../api'

export default function PanelAdmin() {
  const [tab, setTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.usuarios(),
      adminAPI.empresasPendientes(),
      adminAPI.estadisticas(),
    ]).then(([u, e, s]) => {
      setUsuarios(u.data.usuarios || [])
      setEmpresas(e.data.empresas || [])
      setEstadisticas(s.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function toggleUsuario(id) {
    try {
      await adminAPI.toggleUsuario(id)
      setUsuarios(prev => prev.map(u =>
        u.id_usuario === id ? { ...u, activo: !u.activo } : u
      ))
    } catch {}
  }

  async function aprobarEmpresa(id) {
    try {
      await adminAPI.aprobarEmpresa(id)
      setEmpresas(prev => prev.filter(e => e.id_empresa !== id))
    } catch {}
  }

  async function rechazarEmpresa(id) {
    try {
      await adminAPI.rechazarEmpresa(id)
      setEmpresas(prev => prev.filter(e => e.id_empresa !== id))
    } catch {}
  }

  return (
    <main className="page-admin">
      <h1>Panel de administración</h1>

      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card"><h3>{estadisticas.total_usuarios}</h3><p>Usuarios</p></div>
          <div className="stat-card"><h3>{estadisticas.total_vacantes}</h3><p>Vacantes</p></div>
          <div className="stat-card"><h3>{estadisticas.total_postulaciones}</h3><p>Postulaciones</p></div>
          <div className="stat-card"><h3>{estadisticas.total_empresas}</h3><p>Empresas</p></div>
        </div>
      )}

      <div className="tabs">
        <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')}>Usuarios</button>
        <button className={tab === 'empresas' ? 'active' : ''} onClick={() => setTab('empresas')}>
          Empresas pendientes {empresas.length > 0 && `(${empresas.length})`}
        </button>
      </div>

      {loading && <p>Cargando...</p>}

      {tab === 'usuarios' && (
        <div className="usuarios-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button onClick={() => toggleUsuario(u.id_usuario)} className="btn btn-secondary">
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'empresas' && (
        <div className="empresas-list">
          {empresas.length === 0 && <p>No hay empresas pendientes de aprobación.</p>}
          {empresas.map(e => (
            <div key={e.id_empresa} className="empresa-card">
              <h3>{e.nombre_empresa}</h3>
              <p>{e.email_usuario}</p>
              <div className="empresa-actions">
                <button onClick={() => aprobarEmpresa(e.id_empresa)} className="btn btn-primary">Aprobar</button>
                <button onClick={() => rechazarEmpresa(e.id_empresa)} className="btn btn-danger">Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
