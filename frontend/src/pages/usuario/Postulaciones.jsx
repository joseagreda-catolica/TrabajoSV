import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidatoAPI } from '../../api'
import './Postulaciones.css'

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  revisando: 'En revisión',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
}

export default function Postulaciones() {

  const [postulaciones, setPostulaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    candidatoAPI.postulaciones()
      .then(({ data }) =>
        setPostulaciones(
          data.postulaciones || []
        )
      )
      .catch(() => {})
      .finally(() =>
        setLoading(false)
      )

  }, [])

  if (loading) {
    return (
      <main className="post-page">
        <p className="loading">
          Cargando postulaciones...
        </p>
      </main>
    )
  }

  return (

    <main className="post-page">

      <div className="post-header">

        <div>

          <h1>
            Mis postulaciones
          </h1>

          <p>
            Consulta el estado de cada solicitud enviada.
          </p>

        </div>

        <div className="post-total">

          <h2>
            {postulaciones.length}
          </h2>

          <span>
            Total enviadas
          </span>

        </div>

      </div>

      {
        postulaciones.length > 0
        ? (

          <div className="post-grid">

            {
              postulaciones.map(p => (

                <div
                  key={p.id_postulacion}
                  className="post-card"
                >

                  <div className="post-top">

                    <h3>
                      {p.titulo_vacante || p.titulo}
                    </h3>

                    <span
                      className={`estado estado-${p.estado}`}
                    >

                      {
                        ESTADO_LABELS[p.estado]
                        ||
                        p.estado
                      }

                    </span>

                  </div>

                  <p className="empresa">

                    {p.nombre_empresa}

                  </p>

                  <div className="post-date">

                    <strong>
                      Fecha:
                    </strong>

                    {
                      new Date(
                        p.fecha_postulacion ||
                        p.fecha
                      ).toLocaleDateString()
                    }

                  </div>

                  <Link
                    className="ver-btn"
                    to={`/vacante/${p.id_vacante}`}
                  >

                    Ver vacante

                  </Link>

                </div>

              ))
            }

          </div>

        )

        :

        (

          <div className="empty">

            <h2>
              No tienes postulaciones
            </h2>

            <p>
              Comienza explorando vacantes.
            </p>

            <Link
              className="buscar-btn"
              to="/empleos"
            >

              Buscar empleos

            </Link>

          </div>

        )
      }

    </main>

  )

}