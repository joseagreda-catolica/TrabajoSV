import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { vacantesAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function DetalleVacante() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
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
      const { data } = await vacantesAPI.postular(id, { carta_presentacion: carta })
      setMensaje({ tipo: 'success', texto: data.message })
      setYaPostulado(true)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al postular' })
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!vacante) return <p>Vacante no encontrada</p>

  return (
    <main className="page-detalle-vacante">
      <h1>{vacante.titulo}</h1>
      <div className="vacante-info">
        <p><strong>Empresa:</strong> {vacante.nombre_empresa}</p>
        <p><strong>Ubicación:</strong> {vacante.ubicacion}</p>
        <p><strong>Tipo:</strong> {vacante.tipo_contrato}</p>
        <p><strong>Nivel:</strong> {vacante.nivel_experiencia}</p>
        {vacante.salario && <p><strong>Salario:</strong> S/ {vacante.salario}</p>}
        <p><strong>Estado:</strong> {vacante.estado}</p>
      </div>

      <section className="descripcion">
        <h2>Descripción</h2>
        <p>{vacante.descripcion}</p>
      </section>

      {vacante.requisitos && (
        <section className="requisitos">
          <h2>Requisitos</h2>
          <p>{vacante.requisitos}</p>
        </section>
      )}

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {user?.rol === 'candidato' && vacante.estado === 'activa' && (
        <section className="postular-form">
          <h2>Postularse</h2>
          {yaPostulado ? (
            <p>Ya te postulaste a esta vacante.</p>
          ) : (
            <form onSubmit={handlePostular}>
              <label>
                Carta de presentación (opcional)
                <textarea
                  value={carta}
                  onChange={e => setCarta(e.target.value)}
                  rows={5}
                  placeholder="Cuéntanos por qué eres el candidato ideal..."
                />
              </label>
              <button type="submit" className="btn btn-primary">Postularme</button>
            </form>
          )}
        </section>
      )}

      {!user && (
        <p><a href="/login">Inicia sesión</a> para postularte a esta vacante.</p>
      )}
    </main>
  )
}
