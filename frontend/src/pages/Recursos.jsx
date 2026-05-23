import React, { useState, useEffect } from 'react';
import './Recursos.css';

export default function Recursos() {

  const [recursos, setRecursos] = useState([]);
  const [cargando, setCargando] = useState(true);

 
  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    try {
      // Reemplaza con tu endpoint real (ej. '/api/recursos')
      const res = await fetch('/api/recursos', { credentials: 'include' });
      const data = await res.json();
      
      if (data.ok) {
        setRecursos(data.recursos || []);
      }
    } catch (err) {
      console.error('Error cargando los recursos:', err);
    } finally {
      setCargando(false);
    }
  };

  // Helper para pintar el icono correcto según el tipo de recurso
  const getIconClass = (tipo) => {
    if (tipo === 'video') return 'bi-play-btn-fill text-danger';
    if (tipo === 'guia' || tipo === 'pdf') return 'bi-file-earmark-pdf-fill text-primary';
    return 'bi-journal-text text-success'; // Artículo u otros
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      {/* Marcador de Navbar */}
      <nav id="nav-website" className="navbar navbar-expand-lg navbar-dark shadow-sm header-recursos-nav">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">TrabajoSV</a>
        </div>
      </nav>

      {/* Encabezado / Banner */}
      <div className="py-5 border-bottom banner-recursos">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm icon-container-box">
              <i className="bi bi-book-fill text-white fs-4"></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0 text-dark-blue">Recursos de Aprendizaje</h2>
              <p className="text-secondary mb-0">Guías, videos y artículos para impulsar tu carrera profesional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor Principal Dinámico */}
      <div id="div-root" className="container flex-grow-1 py-5">
        <div id="container-recursos" className="row g-4">
          
          {cargando ? (
            /* 1. Estado de Carga (Spinner) */
            <div className="col-12 text-center py-5">
              <div className="spinner-border color-spinner-recursos" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Cargando recursos...</p>
            </div>
          ) : recursos.length === 0 ? (
            /* 2. No se encontraron registros */
            <div className="col-12 text-center py-5">
              <p className="text-muted">No hay recursos disponibles en este momento.</p>
            </div>
          ) : (
            /* 3. Renderizado de las tarjetas de recursos */
            recursos.map((item) => (
              <div className="col-md-4" key={item.id || item.id_recurso}>
                <div className="card h-100 shadow-sm card-recurso-interactive">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className={`bi ${getIconClass(item.tipo)} fs-4`}></i>
                      <span className="badge bg-light text-secondary text-uppercase">{item.tipo}</span>
                    </div>
                    <h5 className="card-title fw-bold text-dark-blue">{item.titulo}</h5>
                    <p className="card-text text-muted small flex-grow-1">{item.descripcion}</p>
                    <a 
                      href={item.enlace || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline-primary btn-sm mt-3 align-self-start rounded-pill px-3 fw-semibold"
                    >
                      Ver recurso <i className="bi bi-arrow-right-short ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {/* Footer */}
      <footer id="footer-website" className="py-4 border-top footer-recursos">
        <div className="container text-center">
          <span className="text-muted small">© 2026 TrabajoSV. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}