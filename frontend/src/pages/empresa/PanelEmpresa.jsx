import { useState, useEffect } from 'react'
import { empresaAPI } from '../../api'

export default function PanelEmpresa() {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)

  const [nueva, setNueva] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    ubicacion: '',
    tipo_contrato: 'tiempo_completo',
    nivel_experiencia: 'junior',
    salario: '',
  })

  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    empresaAPI.vacantes()
      .then(({ data }) => setVacantes(data.vacantes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCrear(e) {
    e.preventDefault()

    try {
      const { data } = await empresaAPI.crearVacante(nueva)

      if (data.ok) {
        setVacantes(prev => [data.vacante, ...prev])

        setNueva({
          titulo: '',
          descripcion: '',
          requisitos: '',
          ubicacion: '',
          tipo_contrato: 'tiempo_completo',
          nivel_experiencia: 'junior',
          salario: '',
        })

        setMostrarForm(false)

        setMensaje({
          tipo: 'success',
          texto: 'Vacante publicada exitosamente',
        })
      }

    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto:
          err.response?.data?.message ||
          'Error al publicar vacante',
      })
    }
  }

  async function handleCambiarEstado(id, estado) {
    try {
      await empresaAPI.actualizarVacante(id, { estado })

      setVacantes(prev =>
        prev.map(v =>
          v.id_vacante === id
            ? { ...v, estado }
            : v
        )
      )

    } catch {}
  }

  function handleChange(e) {
    setNueva(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <main className="page-empresa">

      {/* HEADER */}

      <div className="empresa-header">

        <div>
          <h1>Panel de empresa</h1>
          <p className="subtitle">
            Gestiona tus vacantes y postulaciones
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm
            ? 'Cancelar'
            : '+ Nueva vacante'}
        </button>

      </div>

      {/* MENSAJES */}

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* FORMULARIO */}

      {mostrarForm && (
        <form
          className="form-vacante"
          onSubmit={handleCrear}
        >

          <div className="form-header">
            <h2>Nueva vacante</h2>
            <p>
              Completa la información de la oferta laboral
            </p>
          </div>

          <div className="form-grid">

            <label>
              Título

              <input
                name="titulo"
                value={nueva.titulo}
                onChange={handleChange}
                placeholder="Frontend Developer"
                required
              />
            </label>

            <label>
              Ubicación

              <input
                name="ubicacion"
                value={nueva.ubicacion}
                onChange={handleChange}
                placeholder="Remoto / Lima / México"
              />
            </label>

            <label>
              Tipo de contrato

              <select
                name="tipo_contrato"
                value={nueva.tipo_contrato}
                onChange={handleChange}
              >
                <option value="tiempo_completo">
                  Tiempo completo
                </option>

                <option value="medio_tiempo">
                  Medio tiempo
                </option>

                <option value="freelance">
                  Freelance
                </option>

                <option value="practicas">
                  Prácticas
                </option>
              </select>
            </label>

            <label>
              Nivel de experiencia

              <select
                name="nivel_experiencia"
                value={nueva.nivel_experiencia}
                onChange={handleChange}
              >
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
            </label>

            <label className="full-width">
              Salario (opcional)

              <input
                type="number"
                name="salario"
                value={nueva.salario}
                onChange={handleChange}
                placeholder="3000"
              />
            </label>

            <label className="full-width">
              Descripción

              <textarea
                name="descripcion"
                value={nueva.descripcion}
                onChange={handleChange}
                rows={5}
                placeholder="Describe la vacante..."
                required
              />
            </label>

            <label className="full-width">
              Requisitos

              <textarea
                name="requisitos"
                value={nueva.requisitos}
                onChange={handleChange}
                rows={4}
                placeholder="Experiencia, tecnologías, habilidades..."
              />
            </label>

          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Publicar vacante
          </button>

        </form>
      )}

      {/* VACANTES */}

      <section className="mis-vacantes">

        <div className="section-header">
          <h2>Mis vacantes</h2>

          <span className="vacantes-count">
            {vacantes.length} vacantes
          </span>
        </div>

        {loading && (
          <div className="loading-card">
            Cargando vacantes...
          </div>
        )}

        {!loading && vacantes.length === 0 && (
          <div className="empty-state">

            <h3>
              No tienes vacantes publicadas
            </h3>

            <p>
              Comienza creando tu primera oferta laboral.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => setMostrarForm(true)}
            >
              Crear vacante
            </button>

          </div>
        )}

        <div className="vacantes-grid">

          {vacantes.map(v => (
            <div
              key={v.id_vacante}
              className="vacante-card"
            >

              <div className="vacante-top">

                <div>
                  <h3>{v.titulo}</h3>

                  <div className="vacante-meta">

                    <span>{v.ubicacion}</span>

                    <span>
                      {v.tipo_contrato.replace('_', ' ')}
                    </span>

                    <span>
                      {v.nivel_experiencia.replace('_', ' ')}
                    </span>

                  </div>

                </div>

                <span
                  className={`estado estado-${v.estado}`}
                >
                  {v.estado}
                </span>

              </div>

              {v.salario && (
                <p className="salario">
                  S/ {v.salario}
                </p>
              )}

              <p className="fecha">
                Publicado el{' '}
                {new Date(
                  v.fecha_publicacion
                ).toLocaleDateString()}
              </p>

              <div className="vacante-actions">

                {v.estado === 'activa' && (
                  <button
                    onClick={() =>
                      handleCambiarEstado(
                        v.id_vacante,
                        'cerrada'
                      )
                    }
                    className="btn btn-secondary"
                  >
                    Cerrar vacante
                  </button>
                )}

                {v.estado === 'cerrada' && (
                  <button
                    onClick={() =>
                      handleCambiarEstado(
                        v.id_vacante,
                        'activa'
                      )
                    }
                    className="btn btn-primary"
                  >
                    Reactivar
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

      </section>

    </main>
  )
}