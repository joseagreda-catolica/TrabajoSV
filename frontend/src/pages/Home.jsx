import React, { useState } from 'react';
import './Home.css';

export default function Home() {
  
  const [busqueda, setBusqueda] = useState({
    buscar: '',
    ubicacion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusqueda(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Construimos los parámetros de la URL de manera limpia
    const params = new URLSearchParams();
    if (busqueda.buscar.trim()) params.set('buscar', busqueda.buscar.trim());
    if (busqueda.ubicacion.trim()) params.set('ubicacion', busqueda.ubicacion.trim());

    // Redirección con React Router (Recomendado):
    // navigate(`/empleos?${params.toString()}`);

    // Redirección clásica si aún no configuras rutas en React:
    window.location.href = `/empleos?${params.toString()}`;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>Encuentra tu trabajo ideal</h1>
          <p>Accede a miles de oportunidades laborales en El Salvador</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="container">
        <div className="search-box">
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">¿Qué tipo de trabajo buscas?</label>
                <input 
                  type="text" 
                  name="buscar" 
                  value={busqueda.buscar}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Ej. Desarrollador, Diseñador..." 
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Ubicación</label>
                <input 
                  type="text" 
                  name="ubicacion" 
                  value={busqueda.ubicacion}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Ej. San Salvador" 
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

      {/* Features Section */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-5" style={{ fontSize: '2rem' }}>¿Por qué elegir TrabajoSV?</h2>
        <div className="row g-4">
          
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon"><i class="bi bi-briefcase-fill"></i></div>
              <h5 className="fw-bold">Miles de Empleos</h5>
              <p className="text-muted small">Accede a cientos de oportunidades laborales actualizadas diariamente.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon"><i class="bi bi-bell-fill"></i></div>
              <h5 className="fw-bold">Alertas Personalizadas</h5>
              <p className="text-muted small">Recibe notificaciones de empleos que coinciden con tus criterios.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon"><i class="bi bi-people-fill"></i></div>
              <h5 className="fw-bold">Comunidad Activa</h5>
              <p className="text-muted small">Interactúa con otros profesionales y accede a recursos educativos.</p>
            </div>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h3 class="fw-bold mb-4">¿Listo para tu siguiente oportunidad?</h3>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a href="/empleos" className="btn btn-light btn-lg px-5 fw-semibold rounded-pill">
              <i className="bi bi-search me-2"></i>Buscar Empleos
            </a>
            <a href="/registro" className="btn btn-outline-light btn-lg px-5 fw-semibold rounded-pill">
              <i className="bi bi-person-plus me-2"></i>Registrarse
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}