import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recursosAPI } from '../api'

export default function DetalleRecurso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recurso, setRecurso] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recursosAPI.detalle(id)
      .then(({ data }) => {
        if (data.ok) {
          setRecurso(data.recurso)
        } else {
          navigate('/recursos')
        }
      })
      .catch(() => navigate('/recursos'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return <main style={{ padding: '40px 20px', textAlign: 'center' }}><p>Cargando recurso...</p></main>
  }

  if (!recurso) {
    return <main style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Recurso no encontrado</h2>
      <button onClick={() => navigate('/recursos')} className="btn btn-primary">
        Volver a Recursos
      </button>
    </main>
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

  return (
    <main className="page-detalle-recurso">
      <div className="recurso-header">
        <button onClick={() => navigate('/recursos')} className="btn-back">← Volver a Recursos</button>

        <div className="recurso-hero">
          <div className="recurso-tipo" style={{ backgroundColor: getTipoColor(recurso.tipo) }}>
            {getTipoLabel(recurso.tipo)}
          </div>
          <h1>{recurso.titulo}</h1>
          <p className="recurso-fecha">
            Publicado el {new Date(recurso.fecha_publicacion).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="recurso-content">
        <div className="recurso-main">
          <div className="recurso-description">
            <h2>Descripción</h2>
            <p>{recurso.descripcion}</p>
          </div>

          <div className="recurso-details">
            <h2>Información del Recurso</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Tipo</label>
                <span>{getTipoLabel(recurso.tipo)}</span>
              </div>
              <div className="detail-item">
                <label>Publicado</label>
                <span>{new Date(recurso.fecha_publicacion).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>

          {recurso.url_contenido && (
            <div className="recurso-action">
              <a
                href={recurso.url_contenido}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-large"
              >
                Acceder al Recurso →
              </a>
            </div>
          )}
        </div>

        <div className="recurso-sidebar">
          <div className="sidebar-card">
            <h3>Consejos para aprovechar este recurso</h3>
            <ul>
              <li>Dedica tiempo suficiente para aprender</li>
              <li>Toma notas mientras estudias</li>
              <li>Practica los conceptos aprendidos</li>
              <li>Vuelve a revisar si tienes dudas</li>
              <li>Comparte lo aprendido con otros</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>Recursos Relacionados</h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Vuelve a la sección de recursos para explorar más contenido similar.
            </p>
            <button
              onClick={() => navigate('/recursos')}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Ver más Recursos
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
