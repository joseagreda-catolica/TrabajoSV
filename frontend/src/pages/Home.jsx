import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [ubicacion, setUbicacion] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (buscar)   params.set('buscar', buscar)
    if (ubicacion) params.set('ubicacion', ubicacion)
    navigate(`/empleos?${params.toString()}`)
  }

  return (
    <>
      <div className="ts-hero">
        <div className="container">
          <h1>Encuentra tu trabajo ideal</h1>
          <p className="mb-0" style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Accede a miles de oportunidades laborales en El Salvador
          </p>
        </div>
      </div>

      <div className="container">
        <div className="ts-search-box">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">¿Qué tipo de trabajo buscas?</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Desarrollador, Diseñador..."
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. San Salvador"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-warning w-100 fw-semibold rounded-3">
                  <i className="bi bi-search me-1"></i>Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="text-center fw-bold mb-5" style={{ fontSize: '2rem' }}>
          ¿Por qué elegir TrabajoSV?
        </h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="ts-feature-card">
              <div className="ts-feature-icon"><i className="bi bi-briefcase-fill"></i></div>
              <h5 className="fw-bold">Miles de Empleos</h5>
              <p className="text-muted small">Accede a cientos de oportunidades laborales actualizadas diariamente.</p>
              <Link to="/empleos" className="btn btn-primary btn-sm mt-2">Ver empleos</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ts-feature-card">
              <div className="ts-feature-icon"><i className="bi bi-bell-fill"></i></div>
              <h5 className="fw-bold">Alertas Personalizadas</h5>
              <p className="text-muted small">Recibe notificaciones de empleos que coinciden con tus criterios.</p>
              <Link to="/registro" className="btn btn-primary btn-sm mt-2">Registrarse</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ts-feature-card">
              <div className="ts-feature-icon"><i className="bi bi-people-fill"></i></div>
              <h5 className="fw-bold">Comunidad Activa</h5>
              <p className="text-muted small">Interactúa con otros profesionales y accede a recursos educativos.</p>
              <Link to="/comunidad" className="btn btn-primary btn-sm mt-2">Explorar</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="ts-cta">
        <div className="container">
          <h3 className="fw-bold mb-4">¿Listo para tu siguiente oportunidad?</h3>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/empleos" className="btn btn-light btn-lg px-5 fw-semibold rounded-pill">
              <i className="bi bi-search me-2"></i>Buscar Empleos
            </Link>
            <Link to="/registro" className="btn btn-outline-light btn-lg px-5 fw-semibold rounded-pill">
              <i className="bi bi-person-plus me-2"></i>Registrarse
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
