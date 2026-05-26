import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  const getTipoColor = (tipo) => {
    const colores = {
      'guia': '#3b82f6',
      'video': '#ef4444',
      'articulo': '#8b5cf6',
      'curso': '#10b981',
      'tutorial': '#f59e0b'
    }
    return colores[tipo] || '#6b7280'
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      'guia': 'Guía',
      'video': 'Video',
      'articulo': 'Artículo',
      'curso': 'Curso',
      'tutorial': 'Tutorial'
    }
    return tipos[tipo] || tipo
  }

  return (
    <main className="page-recursos">
      <h1>Recursos</h1>
      <p>Guías, artículos y herramientas para potenciar tu carrera profesional.</p>
      {loading && <p>Cargando recursos...</p>}
      <div className="recursos-grid">
        {recursos.map(r => (
          <Link key={r.id_recurso} to={`/recurso/${r.id_recurso}`} className="recurso-card-link">
            <div className="recurso-card">
              <div className="recurso-tipo" style={{ backgroundColor: getTipoColor(r.tipo) }}>
                {getTipoLabel(r.tipo)}
              </div>
              <h3>{r.titulo}</h3>
              <p>{r.descripcion}</p>
              <div className="recurso-footer">
                <small>{new Date(r.fecha_publicacion).toLocaleDateString('es-ES')}</small>
                <span className="recurso-link">Ver más →</span>
              </div>
            </div>
          </Link>
        ))}
        {!loading && recursos.length === 0 && (
          <p>No hay recursos disponibles por el momento.</p>
        )}
      </div>
    </main>
  )
}
