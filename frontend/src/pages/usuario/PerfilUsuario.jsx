import { useState, useEffect } from 'react'
import { candidatoAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './PerfilUsuario.css'
import { Link } from 'react-router-dom'

export default function PerfilUsuario() {

  const { user } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    candidatoAPI.perfil()
      .then(({ data }) =>
        setPerfil(data.candidato || data.perfil || data)
      )
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  async function handleGuardar(e) {
    e.preventDefault()

    try {

      const formData = new FormData(e.target)

      const datos =
        Object.fromEntries(formData)

      await candidatoAPI.actualizar(datos)

      setMensaje({
        tipo: 'success',
        texto: 'Perfil actualizado correctamente'
      })

    } catch {

      setMensaje({
        tipo: 'error',
        texto: 'Error al actualizar el perfil'
      })

    }
  }

  if (loading)
    return <p>Cargando perfil...</p>

  return (

    <main className="perfil-page">

      <div className="perfil-layout">

        {/* SIDEBAR */}

        <aside className="perfil-sidebar">

          <div className="avatar">

            {(user?.nombre?.[0] || 'U')}

          </div>

          <h3>
            {user?.nombre} {user?.apellido}
          </h3>

          <span>
            {perfil?.titulo || 'Profesional'}
          </span>

          <button className="edit-btn">
            Editar perfil
          </button>

          <nav>

            <Link
              to="/usuario"
              className="active"
            >
              Mi perfil
            </Link>

            <Link
              to="/postulaciones"
            >
              Mis postulaciones
            </Link>

            <Link
              to="/alertas"
            >
              Alertas
            </Link>

            <Link
              to="/valoraciones"
            >
              Valoraciones
            </Link>

            <Link
              to="/estadisticas"
            >
              Estadísticas
            </Link>

          </nav>

        </aside>

        {/* CONTENIDO */}

        <section className="perfil-content">

          <div className="stats">

            <div className="stat-card">

              <h2>
                {perfil?.visitas || 0}
              </h2>

              <span>
                Visitas al perfil
              </span>

            </div>

            <div className="stat-card">

              <h2>
                {perfil?.postulaciones || 0}
              </h2>

              <span>
                Solicitudes enviadas
              </span>

            </div>

          </div>

          <div className="panel">

            <h4>
              INFORMACIÓN PERSONAL
            </h4>

            {
              mensaje &&
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            }

            <form
              onSubmit={handleGuardar}
              className="perfil-form"
            >

              <div className="row">

                <div>

                  <label>Nombre</label>

                  <input
                    value={user?.nombre || ''}
                    disabled
                  />

                </div>

                <div>

                  <label>Apellido</label>

                  <input
                    value={user?.apellido || ''}
                    disabled
                  />

                </div>

              </div>

              <div>

                <label>Email</label>

                <input
                  value={user?.email || ''}
                  disabled
                />

              </div>

              <div className="row">

                <div>

                  <label>Teléfono</label>

                  <input
                    name="telefono"
                    defaultValue={perfil?.telefono || ''}
                  />

                </div>

                <div>

                  <label>Ubicación</label>

                  <input
                    name="ubicacion"
                    defaultValue={perfil?.ubicacion || ''}
                  />

                </div>

              </div>

              <div>

                <label>
                  Nivel de experiencia
                </label>

                <select
                  name="nivel_experiencia"
                  defaultValue={
                    perfil?.nivel_experiencia || ''
                  }
                >

                  <option value="">
                    Seleccionar
                  </option>

                  <option value="sin_experiencia">
                    Sin experiencia
                  </option>

                  <option value="junior">
                    Junior
                  </option>

                  <option value="semi_senior">
                    Semi-senior
                  </option>

                  <option value="senior">
                    Senior
                  </option>

                </select>

              </div>

              <div>

                <label>
                  Habilidades
                </label>

                <input
                  name="habilidades"
                  defaultValue={
                    perfil?.habilidades || ''
                  }
                />

              </div>

              <div>

                <label>
                  Resumen profesional
                </label>

                <textarea
                  rows="5"
                  name="resumen"
                  defaultValue={
                    perfil?.resumen || ''
                  }
                />

              </div>

              <div className="cv-upload">

                <label>
                  Curriculum Vitae
                </label>

                <div className="upload-box">

                  <div className="upload-icon">
                    📄
                  </div>

                  <p>
                    Arrastra tu CV aquí
                  </p>

                  <span>
                    o selecciona un archivo PDF
                  </span>

                  <input
                    type="file"
                    name="cv"
                    accept=".pdf"
                    className="file-input"
                  />

                </div>

                {
                  perfil?.cv &&
                  <div className="archivo-actual">

                    <span>
                      Archivo actual:
                    </span>

                    <strong>
                      {perfil.cv}
                    </strong>

                  </div>
                }

              </div>

              <button
                className="guardar-btn"
                type="submit"
              >

                Guardar cambios

              </button>

            </form>

          </div>

        </section>

      </div>

    </main>

  )

}