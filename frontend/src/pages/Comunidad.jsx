import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { forosAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Comunidad() {
  const { user } = useAuth()
  const [temas, setTemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [nuevo, setNuevo] = useState({ titulo: '', contenido: '' })
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    forosAPI.listar()
      .then(({ data }) => setTemas(data.temas || data.foros || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    try {
      const { data } = await forosAPI.crear(nuevo)
      if (data.ok) {
        setTemas(prev => [data.tema, ...prev])
        setNuevo({ titulo: '', contenido: '' })
        setMostrarForm(false)
      }
    } catch {}
  }

  return (
    <main className="page-comunidad">
      <div className="comunidad-header">
        <h1>Comunidad</h1>
        {user && (
          <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo tema'}
          </button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-nuevo-tema" onSubmit={handleCrear}>
          <label>
            Título
            <input
              value={nuevo.titulo}
              onChange={e => setNuevo(p => ({ ...p, titulo: e.target.value }))}
              required
            />
          </label>
          <label>
            Contenido
            <textarea
              value={nuevo.contenido}
              onChange={e => setNuevo(p => ({ ...p, contenido: e.target.value }))}
              rows={4}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary">Publicar</button>
        </form>
      )}

      {loading && <p>Cargando temas...</p>}

      <div className="temas-list">
        {temas.map(t => (
          <div key={t.id_tema} className="tema-card">
            <h3>{t.titulo}</h3>
            <p>{t.contenido?.substring(0, 150)}...</p>
            <small>Por: {t.nombre || t.nombre_autor} {t.apellido} · {new Date(t.fecha_creacion).toLocaleDateString()}</small>
            <Link to={`/comunidad/${t.id_tema}`}>Ver discusión</Link>
          </div>
        ))}
        {!loading && temas.length === 0 && (
          <p>No hay temas aún. ¡Sé el primero en publicar!</p>
        )}
      </div>
    </main>
  )
}
