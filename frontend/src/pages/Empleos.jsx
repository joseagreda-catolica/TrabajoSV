import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vacantesAPI } from '../api'
import { useAuth } from '../context/AuthContext'

function capitalize(str) {
  if (!str) return '—'
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function Empleos() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtros, setFiltros]   = useState({
    search:    searchParams.get('buscar')    || '',
    ubicacion: searchParams.get('ubicacion') || '',
    tipo:      '',
    nivel:     '',
  })

  const [seleccionada, setSeleccionada]   = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [yaPostulado, setYaPostulado]     = useState(false)
  const [carta, setCarta]                 = useState('')
  const [feedback, setFeedback]           = useState(null)

  useEffect(() => { buscar() }, [])

  async function buscar(e) {
    e?.preventDefault()
    setLoading(true)
    try {
      const { data } = await vacantesAPI.listar(filtros)
      setVacantes(data.vacantes || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleSeleccionar(v) {
    setSeleccionada(null)
    setFeedback(null)
    setCarta('')
    setLoadingDetalle(true)
    try {
      const { data } = await vacantesAPI.detalle(v.id_vacante)
      setSeleccionada(data.vacante)
      setYaPostulado(data.yaPostulado)
    } finally {
      setLoadingDetalle(false)
    }
  }

  async function handlePostular(e) {
    e.preventDefault()
    setFeedback(null)
    try {
      const { data } = await vacantesAPI.postular(seleccionada.id_vacante, { carta_presentacion: carta })
      if (data.ok) {
        setYaPostulado(true)
        setFeedback({ tipo: 'success', texto: data.message || 'Postulación enviada' })
      }
    } catch (err) {
      setFeedback({ tipo: 'danger', texto: err.response?.data?.message || 'Error al postular' })
    }
  }

  function handleChange(e) {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="container-fluid flex-grow-1 py-3 px-3 px-md-4">

      <div className="ts-filter-bar mb-3">
        <form className="row g-2 align-items-end" onSubmit={buscar}>
          <div className="col-md-4">
            <label className="form-label small fw-semibold mb-1">Buscar empleo</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Cargo, empresa o habilidad..."
              value={filtros.search}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold mb-1">Ubicación</label>
            <input
              type="text"
              name="ubicacion"
              className="form-control"
              placeholder="Ciudad o departamento"
              value={filtros.ubicacion}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold mb-1">Tipo</label>
            <select name="tipo" className="form-select" value={filtros.tipo} onChange={handleChange}>
              <option value="">Cualquier tipo</option>
              <option value="tiempo_completo">Tiempo completo</option>
              <option value="medio_tiempo">Medio tiempo</option>
              <option value="freelance">Freelance</option>
              <option value="practicas">Prácticas</option>
              <option value="temporal">Temporal</option>
            </select>
          </div>
          <div className="col-md-1">
            <label className="form-label small fw-semibold mb-1">Nivel</label>
            <select name="nivel" className="form-select" value={filtros.nivel} onChange={handleChange}>
              <option value="">Todos</option>
              <option value="sin_experiencia">Sin exp.</option>
              <option value="junior">Junior</option>
              <option value="semi_senior">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-warning w-100 fw-semibold">
              <i className="bi bi-search me-1"></i>Buscar
            </button>
          </div>
        </form>
      </div>

      <p className="text-muted small fw-semibold mb-2 ms-1" style={{ letterSpacing: '0.03em' }}>
        RESULTADOS DE BÚSQUEDA
      </p>

      <div className="row g-3 flex-grow-1">

        <div className="col-md-4">
          <div className="ts-jobs-panel">
            <div className="ts-jobs-panel-header">Vacantes disponibles</div>
            <div className="ts-jobs-list">

              {loading && (
                <p className="text-muted small text-center py-3">Cargando empleos...</p>
              )}

              {!loading && vacantes.length === 0 && (
                <p className="text-muted small text-center py-3">
                  No se encontraron vacantes.
                </p>
              )}

              {vacantes.map(v => (
                <div
                  key={v.id_vacante}
                  className={`p-3 rounded-3 border cursor-pointer ${seleccionada?.id_vacante === v.id_vacante ? 'border-primary bg-light' : 'bg-white'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSeleccionar(v)}
                >
                  <div className="fw-semibold small mb-1" style={{ color: '#1a1d2e' }}>{v.titulo}</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-building me-1"></i>{v.nombre_empresa}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-geo-alt me-1"></i>{v.ubicacion}
                    {' · '}
                    {capitalize(v.tipo_contrato)}
                  </div>
                  {v.salario && (
                    <div className="small fw-semibold mt-1" style={{ color: '#2e3266' }}>
                      S/ {v.salario}
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="ts-detail-panel">

            {!seleccionada && !loadingDetalle && (
              <div className="p-5 text-center">
                <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: '#d1d5db' }}></i>
                <p className="text-muted mt-3">Selecciona una vacante para ver los detalles</p>
              </div>
            )}

            {loadingDetalle && (
              <div className="p-5 text-center">
                <div className="spinner-border text-secondary"></div>
              </div>
            )}

            {seleccionada && !loadingDetalle && (
              <>
                <div className="ts-detail-header">
                  <h5 className="text-white fw-bold mb-1">{seleccionada.titulo}</h5>
                  <p className="text-white-50 small mb-0">
                    <i className="bi bi-building me-1"></i>{seleccionada.nombre_empresa}
                    &nbsp;·&nbsp;
                    <i className="bi bi-geo-alt me-1"></i>{seleccionada.ubicacion}
                  </p>
                </div>

                <div className="p-4">
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    <span className="ts-meta-chip">
                      <i className="bi bi-clock"></i>{capitalize(seleccionada.tipo_contrato)}
                    </span>
                    <span className="ts-meta-chip">
                      <i className="bi bi-briefcase"></i>{capitalize(seleccionada.nivel_experiencia)}
                    </span>
                    {seleccionada.salario && (
                      <span className="ts-meta-chip">
                        <i className="bi bi-cash-stack"></i>S/ {seleccionada.salario}
                      </span>
                    )}
                  </div>

                  <h6 className="fw-bold mb-2" style={{ color: '#1a1d2e' }}>Descripción del puesto</h6>
                  <p className="text-muted small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {seleccionada.descripcion}
                  </p>

                  {feedback && (
                    <div className={`alert alert-${feedback.tipo} py-2 small my-2`}>
                      {feedback.texto}
                    </div>
                  )}

                  {user?.rol === 'candidato' && seleccionada.estado === 'activa' && (
                    <div className="mt-3">
                      {yaPostulado ? (
                        <div className="alert alert-success py-2 small">
                          <i className="bi bi-check-circle me-1"></i>Ya te postulaste a esta vacante
                        </div>
                      ) : (
                        <form onSubmit={handlePostular}>
                          <label className="form-label small fw-semibold">
                            Carta de presentación <span className="text-muted fw-normal">(opcional)</span>
                          </label>
                          <textarea
                            className="form-control mb-2"
                            rows={4}
                            placeholder="Cuéntale al empleador por qué eres el candidato ideal..."
                            value={carta}
                            onChange={e => setCarta(e.target.value)}
                          />
                          <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-warning px-4 fw-semibold rounded-pill">
                              <i className="bi bi-send-fill me-1"></i>Postularme
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {!user && (
                    <div className="alert alert-light mt-3 text-center small">
                      <a href="/login" className="fw-semibold">Inicia sesión</a> para postularte a esta vacante.
                    </div>
                  )}

                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
