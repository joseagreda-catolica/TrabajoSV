import { useState, useEffect } from 'react'
import { recursosAPI } from '../api'

export default function Recursos() {
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recursosAPI.listar()
      .then(({ data }) => setRecursos(data.recursos || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page-recursos">
      <h1>Recursos</h1>
      <p>Guías, artículos y herramientas para potenciar tu carrera profesional.</p>
      {loading && <p>Cargando recursos...</p>}
      <div className="recursos-grid">
        {recursos.map(r => (
          <div key={r.id_recurso} className="recurso-card">
            <h3>{r.titulo}</h3>
            <p>{r.descripcion}</p>
            {r.url && <a href={r.url} target="_blank" rel="noreferrer">Ver recurso</a>}
          </div>
        ))}
        {!loading && recursos.length === 0 && (
          <p>No hay recursos disponibles por el momento.</p>
        )}
      </div>
    </main>
  )
}
