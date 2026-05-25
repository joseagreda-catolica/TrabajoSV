import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { vacantesAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function DetalleVacante() {

  const { id } = useParams()

  const navigate = useNavigate()

  const { user } = useAuth()

  const [vacante, setVacante] = useState(null)

  const [yaPostulado, setYaPostulado] = useState(false)

  const [loading, setLoading] = useState(true)

  const [carta, setCarta] = useState('')

  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {

    vacantesAPI.detalle(id)

      .then(({ data }) => {

        setVacante(data.vacante)

        setYaPostulado(data.yaPostulado)

      })

      .catch(() => navigate('/empleos'))

      .finally(() => setLoading(false))

  }, [id])

  async function handlePostular(e) {

    e.preventDefault()

    try {

      const { data } = await vacantesAPI.postular(id, {
        carta_presentacion: carta,
      })

      setMensaje({
        tipo: 'success',
        texto: data.message,
      })

      setYaPostulado(true)

    } catch (err) {

      setMensaje({
        tipo: 'error',
        texto:
          err.response?.data?.message ||
          'Error al postular',
      })

    }

  }

  if (loading) {
    return (
      <main className="page-detalle-vacante">

        <div className="loading-card">
          Cargando vacante...
        </div>

      </main>
    )
  }

  if (!vacante) {
    return (
      <main className="page-detalle-vacante">

        <div className="empty-state">
          <h2>Vacante no encontrada</h2>

          <Link
            to="/empleos"
            className="btn btn-primary"
          >
            Volver a empleos
          </Link>
        </div>

      </main>
    )
  }

  return (
    <main className="page-detalle-vacante">

      {/* HERO */}

      <header className="vacante-hero">

        <div className="hero-content">

          <div className="hero-badge">
            Oferta laboral
          </div>

          <h1>{vacante.titulo}</h1>

          <div className="hero-meta">

            <span>{vacante.nombre_empresa}</span>

            <span>{vacante.ubicacion}</span>

            <span>
              {vacante.tipo_contrato.replace('_', ' ')}
            </span>

          </div>

        </div>

        <span
          className={`estado estado-${vacante.estado}`}
        >
          {vacante.estado}
        </span>

      </header>

      {/* INFO */}

      <section className="vacante-info">

        <div className="info-card">
          <strong>Nivel</strong>

          <p>
            {vacante.nivel_experiencia.replace('_', ' ')}
          </p>
        </div>

        <div className="info-card">
          <strong>Contrato</strong>

          <p>
            {vacante.tipo_contrato.replace('_', ' ')}
          </p>
        </div>

        <div className="info-card">
          <strong>Ubicación</strong>

          <p>{vacante.ubicacion}</p>
        </div>

        {vacante.salario && (
          <div className="info-card">
            <strong>Salario</strong>

            <p>S/ {vacante.salario}</p>
          </div>
        )}

      </section>

      {/* DESCRIPCION */}

      <section className="descripcion">

        <div className="section-title">
          <h2>Descripción del puesto</h2>
        </div>

        <div className="contenido-texto">
          {vacante.descripcion}
        </div>

      </section>

      {/* REQUISITOS */}

      {vacante.requisitos && (

        <section className="requisitos">

          <div className="section-title">
            <h2>Requisitos</h2>
          </div>

          <div className="contenido-texto">
            {vacante.requisitos}
          </div>

        </section>

      )}

      {/* MENSAJES */}

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* POSTULACION */}

      {user?.rol === 'candidato' &&
        vacante.estado === 'activa' && (

        <section
          className={`postular-form ${
            yaPostulado ? 'success' : ''
          }`}
        >

          <div className="section-title">
            <h2>Postularse</h2>

            <p>
              Envía tu candidatura para esta vacante
            </p>
          </div>

          {yaPostulado ? (

            <div className="success-box">

              <h3>
                Ya te postulaste a esta vacante
              </h3>

              <p>
                La empresa revisará tu perfil
                próximamente.
              </p>

            </div>

          ) : (

            <form onSubmit={handlePostular}>

              <label>

                Carta de presentación (opcional)

                <textarea
                  value={carta}
                  onChange={e =>
                    setCarta(e.target.value)
                  }
                  rows={6}
                  placeholder="Cuéntanos por qué eres el candidato ideal para este puesto..."
                />

              </label>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Postularme ahora
              </button>

            </form>

          )}

        </section>

      )}

      {/* LOGIN */}

      {!user && (

        <div className="login-required">

          <h3>
            ¿Quieres postularte?
          </h3>

          <p>
            Inicia sesión para enviar tu candidatura.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
          >
            Iniciar sesión
          </Link>

        </div>

      )}

    </main>
  )
}