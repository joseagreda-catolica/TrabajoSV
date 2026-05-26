import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { vacantesAPI } from '../api'
import { useAuth } from '../context/AuthContext'

function capitalize(str) {
  if (!str) return '—'
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function DetalleVacante() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vacante, setVacante]       = useState(null)
  const [yaPostulado, setYaPostulado] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [carta, setCarta]           = useState('')
  const [feedback, setFeedback]     = useState(null)
  const [enviando, setEnviando]     = useState(false)
  const [showModal, setShowModal]   = useState(false)

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
    setFeedback(null)
    setEnviando(true)
    try {
      const { data } = await vacantesAPI.postular(id, { carta_presentacion: carta })
      if (data.ok) {
        setYaPostulado(true)
        setShowModal(false)
        setFeedback({ tipo: 'success', texto: data.message || 'Postulación enviada exitosamente' })
      } else {
        setFeedback({ tipo: 'danger', texto: data.message })
      }
    } catch (err) {
      setFeedback({ tipo: 'danger', texto: err.response?.data?.message || 'Error al postular' })
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-secondary"></div>
      </div>
    )
  }

  if (!vacante) return null

  const salario = vacante.salario_min && vacante.salario_max
    ? `$${vacante.salario_min} - $${vacante.salario_max}`
    : vacante.salario
      ? `S/ ${vacante.salario}`
      : 'A convenir'

  return (
    <>
      <header className="ts-hero-vacante">
        <div className="container">
          <Link to="/empleos" className="text-white-50 text-decoration-none small mb-3 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i>Volver al listado de empleos
          </Link>
          <h1 className="fw-bold mb-2 text-white">{vacante.titulo}</h1>
          <div className="d-flex gap-4 text-white-50 flex-wrap">
            <span><i className="bi bi-building me-2"></i>{vacante.nombre_empresa || '—'}</span>
            <span><i className="bi bi-geo-alt me-2"></i>{vacante.ubicacion || '—'}</span>
          </div>
        </div>
      </header>

      <main className="container ts-main-content">

        {feedback && (
          <div className={`alert alert-${feedback.tipo} py-2 small mb-3`}>
            {feedback.texto}
          </div>
        )}

        <div className="row g-4">

          <div className="col-lg-8">
            <div className="ts-info-card">
              <div className="d-flex flex-wrap gap-2 mb-5">
                <div className="ts-meta-chip">
                  <i className="bi bi-clock"></i>{capitalize(vacante.tipo_contrato)}
                </div>
                <div className="ts-meta-chip">
                  <i className="bi bi-briefcase"></i>{capitalize(vacante.nivel_experiencia)}
                </div>
                <div className="ts-meta-chip">
                  <i className="bi bi-cash-stack"></i>{salario}
                </div>
              </div>

              <h5 className="ts-section-title">Descripción del puesto</h5>
              <div className="text-muted" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {vacante.descripcion || 'Sin descripción disponible.'}
              </div>

              {vacante.requisitos && (
                <>
                  <h5 className="ts-section-title mt-4">Requisitos</h5>
                  <div className="text-muted" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {vacante.requisitos}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="ts-sidebar-card">
              <h6 className="text-center fw-bold mb-4" style={{ color: '#2c3e60' }}>DETALLES CLAVE</h6>

              <div className="mb-4">
                <label className="text-muted small d-block mb-1">Empresa</label>
                <div className="d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3">
                    <i className="bi bi-buildings fs-4" style={{ color: '#2c3e60' }}></i>
                  </div>
                  <span className="fw-bold" style={{ color: '#2c3e60' }}>{vacante.nombre_empresa || '—'}</span>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">Contrato</label>
                  <span className="fw-semibold">{capitalize(vacante.tipo_contrato)}</span>
                </div>
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">Experiencia</label>
                  <span className="fw-semibold">{capitalize(vacante.nivel_experiencia)}</span>
                </div>
              </div>

              <div className="p-3 mb-4 text-center rounded" style={{ backgroundColor: '#ebe8de' }}>
                <small className="d-block text-muted">Fecha límite para aplicar:</small>
                <span className="fw-bold" style={{ color: '#2c3e60' }}>
                  {vacante.fecha_cierre
                    ? new Date(vacante.fecha_cierre).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </span>
              </div>

              {user?.rol === 'candidato' && vacante.estado === 'activa' && (
                yaPostulado ? (
                  <button className="btn-apply mb-3 shadow-sm" disabled style={{ opacity: 0.7 }}>
                    ✓ Ya postulado
                  </button>
                ) : (
                  <button className="btn-apply mb-3 shadow-sm" onClick={() => setShowModal(true)}>
                    Aplicar a esta vacante
                  </button>
                )
              )}

              {!user && (
                <Link to="/login" className="btn btn-primary w-100 fw-semibold rounded-pill mb-3">
                  Inicia sesión para aplicar
                </Link>
              )}

              <p className="text-center text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-shield-check me-1"></i>Postulación segura vía TrabajoSV
              </p>
            </div>
          </div>

        </div>
      </main>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">Aplicar a {vacante.titulo}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Carta de presentación</label>
                  <textarea
                    className="form-control border-0 bg-light shadow-sm"
                    rows={5}
                    placeholder="Cuéntanos por qué eres el candidato ideal..."
                    value={carta}
                    onChange={e => setCarta(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary w-100 fw-semibold rounded-pill"
                  onClick={handlePostular}
                  disabled={enviando}
                >
                  <i className="bi bi-send-fill me-1"></i>
                  {enviando ? 'Enviando...' : 'Enviar postulación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
