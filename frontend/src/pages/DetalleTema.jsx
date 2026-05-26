import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { forosAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function DetalleTema() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tema, setTema] = useState(null)
  const [respuestas, setRespuestas] = useState([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    forosAPI.detalle(id)
      .then(({ data }) => {
        if (data.ok) {
          setTema(data.tema)
          setRespuestas(data.respuestas || [])
        }
      })
      .catch(() => navigate('/comunidad'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleResponder(e) {
    e.preventDefault()
    if (!nueva.trim() || !user) return

    setEnviando(true)
    try {
      const { data } = await forosAPI.responder(id, { contenido: nueva })
      if (data.ok) {
        setRespuestas(prev => [...prev, data.respuesta])
        setNueva('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <main style={{ padding: '40px 20px', textAlign: 'center' }}><p>Cargando...</p></main>

  if (!tema) {
    return <main style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Tema no encontrado</h2>
      <button onClick={() => navigate('/comunidad')} className="btn btn-primary">
        Volver a Comunidad
      </button>
    </main>
  }

  return (
    <main className="page-detalle-tema">
      <div className="tema-header">
        <button onClick={() => navigate('/comunidad')} className="btn-back">← Volver</button>
        <h1>{tema.titulo}</h1>
      </div>

      <div className="tema-info">
        <small>Por: {tema.nombre} {tema.apellido} · {new Date(tema.fecha_creacion).toLocaleDateString()}</small>
      </div>

      <div className="respuestas-container">
        <h2>Discusión ({respuestas.length} respuestas)</h2>

        <div className="respuestas-list">
          {respuestas.map((r, i) => (
            <div key={i} className="respuesta-card">
              <div className="respuesta-header">
                <strong>{r.nombre} {r.apellido}</strong>
                <small>{new Date(r.fecha_creacion || r.fecha).toLocaleDateString()}</small>
              </div>
              <p className="respuesta-contenido">{r.contenido}</p>
            </div>
          ))}
          {respuestas.length === 0 && (
            <p className="no-respuestas">No hay respuestas aún. ¡Sé el primero en responder!</p>
          )}
        </div>

        {user && (
          <form className="form-respuesta" onSubmit={handleResponder}>
            <h3>Tu respuesta</h3>
            <textarea
              value={nueva}
              onChange={e => setNueva(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={4}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Publicar respuesta'}
            </button>
          </form>
        )}

        {!user && (
          <div className="auth-prompt">
            <p>Inicia sesión para responder a este tema.</p>
          </div>
        )}
      </div>
    </main>
  )
}
