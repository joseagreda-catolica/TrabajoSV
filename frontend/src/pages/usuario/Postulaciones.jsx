import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidatoAPI, valoracionesAPI } from '../../api'

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
  const [mostrarValoracion, setMostrarValoracion] = useState(null)
  const [puntuacion, setPuntuacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const cargarPostulaciones = () => {
      candidatoAPI.postulaciones()
        .then(({ data }) => setTodas(data.postulaciones || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }

    cargarPostulaciones()

    // Recargar postulaciones cada 30 segundos para ver cambios en tiempo real
    const intervalo = setInterval(cargarPostulaciones, 30000)
    return () => clearInterval(intervalo)
  }, [])

  function toggleFiltro(val) {
    setActivos(prev => {
      const next = new Set(prev)
      next.has(val) ? next.delete(val) : next.add(val)
      return next
    })
  }

  async function enviarValoracion(postulacion) {
    setEnviando(true)
    try {
      await valoracionesAPI.crear(postulacion.id_empresa, {
        puntuacion: parseInt(puntuacion),
        comentario: comentario || null
      })
      setMostrarValoracion(null)
      setPuntuacion(5)
      setComentario('')
      alert('¡Valoración publicada exitosamente!')
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar valoración')
    } finally {
      setEnviando(false)
    }
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
              <div key={p.id_postulacion} className="ts-card mb-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start">
                  <div style={{ flex: 1 }}>
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
                  <div className="d-flex gap-2 mt-3 mt-md-0">
                    <Link
                      to={`/vacante/${p.id_vacante}`}
                      style={{
                        border: '2px solid #2c3e60', color: '#2c3e60',
                        background: 'transparent', fontWeight: 600,
                        padding: '6px 12px', borderRadius: '6px',
                        textDecoration: 'none', fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ver Detalle
                    </Link>
                    <button
                      onClick={() => setMostrarValoracion(p)}
                      disabled={p.estado !== 'contratado'}
                      style={{
                        border: '2px solid #ffc107', color: '#ffc107',
                        background: 'transparent', fontWeight: 600,
                        padding: '6px 12px', borderRadius: '6px',
                        cursor: p.estado === 'contratado' ? 'pointer' : 'not-allowed', fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        opacity: p.estado === 'contratado' ? 1 : 0.5,
                      }}
                    >
                      ⭐ Valorar
                    </button>
                  </div>
                </div>
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

      {mostrarValoracion && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px',
            maxWidth: '500px', width: '90%'
          }}>
            <h4 className="fw-bold mb-3">Valorar a {mostrarValoracion.nombre_empresa}</h4>

            <div className="mb-4">
              <label className="form-label fw-bold">Puntuación</label>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    onClick={() => setPuntuacion(n)}
                    style={{
                      cursor: 'pointer',
                      color: n <= puntuacion ? '#ffc107' : '#ddd',
                      transition: 'all 0.2s'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Comentario (opcional)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Comparte tu experiencia con esta empresa..."
                style={{ fontFamily: 'inherit' }}
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={() => {
                  setMostrarValoracion(null)
                  setComentario('')
                  setPuntuacion(5)
                }}
                className="btn"
                style={{ flex: 1, background: '#f5f5f5', color: '#333' }}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                onClick={() => enviarValoracion(mostrarValoracion)}
                className="btn"
                style={{ flex: 1, background: '#ffc107', color: '#333', fontWeight: 'bold' }}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar Valoración'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
