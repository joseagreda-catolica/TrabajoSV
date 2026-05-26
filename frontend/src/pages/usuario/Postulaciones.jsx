import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidatoAPI } from '../../api'

const ESTADOS = {
  enviada:     { label: 'Enviada',     cls: 'bg-enviado'   },
  en_revision: { label: 'En revisión', cls: 'bg-revision'  },
  entrevista:  { label: 'Entrevista',  cls: 'bg-entrevista'},
  contratado:  { label: 'Contratado',  cls: 'bg-aceptado'  },
  rechazada:   { label: 'Rechazada',   cls: 'bg-rechazado' },
}

const FILTROS_LABELS = [
  { value: 'enviada',     label: 'Enviada'     },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'entrevista',  label: 'Entrevista'  },
  { value: 'contratado',  label: 'Contratado'  },
  { value: 'rechazada',   label: 'Rechazada'   },
]

export default function Postulaciones() {
  const [todas, setTodas]     = useState([])
  const [loading, setLoading] = useState(true)
  const [activos, setActivos] = useState(
    new Set(['enviada', 'en_revision', 'entrevista', 'contratado', 'rechazada'])
  )

  useEffect(() => {
    candidatoAPI.postulaciones()
      .then(({ data }) => setTodas(data.postulaciones || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleFiltro(val) {
    setActivos(prev => {
      const next = new Set(prev)
      next.has(val) ? next.delete(val) : next.add(val)
      return next
    })
  }

  const visibles   = todas.filter(p => activos.has(p.estado))
  const aceptadas  = todas.filter(p => p.estado === 'contratado').length

  return (
    <div className="container pb-5 pt-4">
      <h2 className="fw-bold mb-4" style={{ color: '#2c3e60', fontSize: '1.5rem' }}>
        Mis Postulaciones
      </h2>

      {loading && (
        <div className="ts-card text-center py-5">
          <div className="spinner-border text-secondary"></div>
          <p className="mt-2 text-muted">Cargando...</p>
        </div>
      )}

      <div className="row g-4">

        <div className="col-lg-8">
          {!loading && visibles.length === 0 && (
            <div className="ts-card text-center py-5">
              <p className="text-muted">
                No hay postulaciones con los filtros seleccionados.{' '}
                <Link to="/empleos">Buscar empleos</Link>
              </p>
            </div>
          )}

          {visibles.map(p => {
            const est = ESTADOS[p.estado] || { label: p.estado, cls: 'bg-secondary' }
            return (
              <div key={p.id_postulacion} className="ts-card d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: '#2c3e60', fontSize: '1.25rem' }}>
                    {p.titulo_vacante || p.titulo}
                  </h4>
                  <p className="text-muted fst-italic mb-1">{p.nombre_empresa}</p>
                  <p className="text-secondary mb-2" style={{ fontSize: '0.9rem' }}>
                    {new Date(p.fecha_postulacion || p.fecha).toLocaleDateString('es-SV')}
                  </p>
                  <span className="fw-bold" style={{ color: '#2c3e60' }}>Estado </span>
                  <span className={`badge-estado ${est.cls}`}>{est.label}</span>
                </div>
                <Link
                  to={`/vacante/${p.id_vacante}`}
                  className="mt-3 mt-md-0"
                  style={{
                    border: '2px solid #2c3e60', color: '#2c3e60',
                    background: 'transparent', fontWeight: 600,
                    padding: '6px 18px', borderRadius: '6px',
                    textDecoration: 'none', transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver Detalle
                </Link>
              </div>
            )
          })}
        </div>

        <div className="col-lg-4">
          <div className="ts-card mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#2c3e60' }}>Filtrar por Estado</h5>
            {FILTROS_LABELS.map(f => (
              <div className="form-check" key={f.value}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`filtro-${f.value}`}
                  checked={activos.has(f.value)}
                  onChange={() => toggleFiltro(f.value)}
                />
                <label className="form-check-label" htmlFor={`filtro-${f.value}`}>
                  {f.label}
                </label>
              </div>
            ))}
          </div>

          <div className="ts-card">
            <h5 className="fw-bold mb-3" style={{ color: '#2c3e60' }}>Resumen</h5>
            <p className="mb-1">Aplicaciones: <strong>{todas.length}</strong></p>
            <p className="mb-0">Aceptadas: <strong>{aceptadas}</strong></p>
          </div>
        </div>

      </div>
    </div>
  )
}
