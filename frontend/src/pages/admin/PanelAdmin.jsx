import { useState, useEffect } from 'react'
import { adminAPI } from '../../api'

export default function PanelAdmin() {

  const [tab, setTab] = useState('usuarios')

  const [usuarios, setUsuarios] = useState([])

  const [empresas, setEmpresas] = useState([])

  const [estadisticas, setEstadisticas] = useState(null)

  const [loading, setLoading] = useState(true)

  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {

    Promise.all([
      adminAPI.usuarios(),
      adminAPI.empresasPendientes(),
      adminAPI.estadisticas(),
    ])

      .then(([u, e, s]) => {

        setUsuarios(u.data.usuarios || [])

        setEmpresas(e.data.empresas || [])

        setEstadisticas(s.data)

      })

      .catch(() => {

        setMensaje({
          tipo: 'error',
          texto: 'Error cargando información',
        })

      })

      .finally(() => setLoading(false))

  }, [])

  async function toggleUsuario(id) {

    try {

      await adminAPI.toggleUsuario(id)

      setUsuarios(prev =>
        prev.map(u =>
          u.id_usuario === id
            ? { ...u, activo: !u.activo }
            : u
        )
      )

      setMensaje({
        tipo: 'success',
        texto: 'Estado actualizado correctamente',
      })

    } catch {

      setMensaje({
        tipo: 'error',
        texto: 'No se pudo actualizar el usuario',
      })

    }

  }

  async function aprobarEmpresa(id) {

    try {

      await adminAPI.aprobarEmpresa(id)

      setEmpresas(prev =>
        prev.filter(
          e => e.id_empresa !== id
        )
      )

      setMensaje({
        tipo: 'success',
        texto: 'Empresa aprobada exitosamente',
      })

    } catch {

      setMensaje({
        tipo: 'error',
        texto: 'Error al aprobar empresa',
      })

    }

  }

  async function rechazarEmpresa(id) {

    try {

      await adminAPI.rechazarEmpresa(id)

      setEmpresas(prev =>
        prev.filter(
          e => e.id_empresa !== id
        )
      )

      setMensaje({
        tipo: 'success',
        texto: 'Empresa rechazada',
      })

    } catch {

      setMensaje({
        tipo: 'error',
        texto: 'Error al rechazar empresa',
      })

    }

  }

  return (
    <main className="page-admin">

      {/* HEADER */}

      <div className="admin-header">

        <div>

          <h1>
            Panel de administración
          </h1>

          <p className="subtitle">
            Gestiona usuarios, empresas y actividad
            de la plataforma
          </p>

        </div>

      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* ESTADISTICAS */}

      {estadisticas && (

        <section className="estadisticas-grid">

          <div className="stat-card">

            <div className="stat-top">
              <span>Total usuarios</span>
            </div>

            <h3>
              {estadisticas.total_usuarios}
            </h3>

          </div>

          <div className="stat-card">

            <div className="stat-top">
              <span>Vacantes publicadas</span>
            </div>

            <h3>
              {estadisticas.total_vacantes}
            </h3>

          </div>

          <div className="stat-card">

            <div className="stat-top">
              <span>Postulaciones</span>
            </div>

            <h3>
              {estadisticas.total_postulaciones}
            </h3>

          </div>

          <div className="stat-card">

            <div className="stat-top">
              <span>Empresas</span>
            </div>

            <h3>
              {estadisticas.total_empresas}
            </h3>

          </div>

        </section>

      )}

      {/* TABS */}

      <div className="tabs">

        <button
          className={
            tab === 'usuarios'
              ? 'active'
              : ''
          }
          onClick={() => setTab('usuarios')}
        >
          Usuarios
        </button>

        <button
          className={
            tab === 'empresas'
              ? 'active'
              : ''
          }
          onClick={() => setTab('empresas')}
        >
          Empresas pendientes

          {empresas.length > 0 && (
            <span className="tab-count">
              {empresas.length}
            </span>
          )}

        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="loading-card">
          Cargando información...
        </div>
      )}

      {/* TAB USUARIOS */}

      {!loading && tab === 'usuarios' && (

        <section className="usuarios-section">

          <div className="section-header">

            <h2>
              Usuarios registrados
            </h2>

            <span className="usuarios-count">
              {usuarios.length} usuarios
            </span>

          </div>

          {usuarios.length === 0 ? (

            <div className="empty-state">

              <h3>
                No hay usuarios registrados
              </h3>

              <p>
                Los usuarios aparecerán aquí.
              </p>

            </div>

          ) : (

            <div className="usuarios-table">

              <table>

                <thead>

                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>

                </thead>

                <tbody>

                  {usuarios.map(u => (

                    <tr key={u.id_usuario}>

                      <td>

                        <div className="usuario-info">

                          <div className="usuario-avatar">
                            {u.nombre?.charAt(0)}
                          </div>

                          <div>

                            <strong>
                              {u.nombre} {u.apellido}
                            </strong>

                          </div>

                        </div>

                      </td>

                      <td>{u.email}</td>

                      <td>

                        <span className="rol-badge">
                          {u.rol}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`estado-badge ${
                            u.activo
                              ? 'estado-activo'
                              : 'estado-inactivo'
                          }`}
                        >
                          {u.activo
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>

                      </td>

                      <td>

                        <button
                          onClick={() =>
                            toggleUsuario(
                              u.id_usuario
                            )
                          }
                          className={`btn ${
                            u.activo
                              ? 'btn-danger'
                              : 'btn-primary'
                          }`}
                        >
                          {u.activo
                            ? 'Desactivar'
                            : 'Activar'}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}

      {/* TAB EMPRESAS */}

      {!loading && tab === 'empresas' && (

        <section className="empresas-section">

          <div className="section-header">

            <h2>
              Empresas pendientes
            </h2>

            <span className="usuarios-count">
              {empresas.length} pendientes
            </span>

          </div>

          {empresas.length === 0 ? (

            <div className="empty-state">

              <h3>
                No hay empresas pendientes
              </h3>

              <p>
                Todo está al día.
              </p>

            </div>

          ) : (

            <div className="empresas-list">

              {empresas.map(e => (

                <div
                  key={e.id_empresa}
                  className="empresa-card"
                >

                  <div className="empresa-top">

                    <div>

                      <h3>
                        {e.nombre_empresa}
                      </h3>

                      <p>
                        {e.email_usuario}
                      </p>

                    </div>

                    <span className="pendiente-badge">
                      Pendiente
                    </span>

                  </div>

                  <div className="empresa-actions">

                    <button
                      onClick={() =>
                        aprobarEmpresa(
                          e.id_empresa
                        )
                      }
                      className="btn btn-primary"
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={() =>
                        rechazarEmpresa(
                          e.id_empresa
                        )
                      }
                      className="btn btn-danger"
                    >
                      Rechazar
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      )}

    </main>
  )
}