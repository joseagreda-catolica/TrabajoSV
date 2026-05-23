import React, { useState, useEffect, useRef } from 'react';
import './Empleos.css';

export default function Empleos() {
  // ── ESTADOS DE REACT ──────────────────────────────────────────────────
  const [vacantes, setVacantes] = useState([]);
  const [empleoSeleccionado, setEmpleoSeleccionado] = useState(null);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [cargandoVacantes, setCargandoVacantes] = useState(true);
  
  // Estados para el Formulario de Filtros
  const [filtros, setFiltros] = useState({
    buscar: '',
    ubicacion: '',
    tipo: '',
    nivel: '',
    salario_min: ''
  });

  // Estados para el Modal de Postulación
  const [cartaPresentacion, setCartaPresentacion] = useState('');
  const [feedbackModal, setFeedbackModal] = useState('');
  const [enviandoPostulacion, setEnviandoPostulacion] = useState(false);

  // Estado de sesión del usuario (Autenticación)
  const [usuario, setUsuario] = useState({ logged: false, user: null });

  // Referencia para cerrar el modal usando Bootstrap tradicional de fondo
  const modalRef = useRef(null);

  // ── EFECTO INICIAL (Carga de datos y sesión) ───────────────────────────
  useEffect(() => {
    checkSession();
    fetchVacantes();
    leerParametrosURL();
  }, []);

  // 1. Verificar Sesión de Usuario
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/check-session', { credentials: 'include' });
      const data = await res.json();
      if (data.logged) {
        setUsuario({ logged: true, user: data.user });
      }
    } catch (e) {
      // fail silently
    }
  };

  // 2. Cargar Vacantes Iniciales
  const fetchVacantes = async (queryString = '') => {
    setCargandoVacantes(true);
    try {
      const res = await fetch(`/api/vacantes${queryString}`, { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        const formateadas = data.vacantes.map(v => ({
          id: v.id_vacante,
          titulo: v.titulo,
          ubicacion: v.ubicacion || 'El Salvador',
          salario: v.salario_min && v.salario_max ? `$${v.salario_min} - $${v.salario_max}` : 'A convenir',
          tipoEmpleo: v.tipo_contrato ? v.tipo_contrato.replace(/_/g, ' ') : ''
        }));
        setVacantes(formateadas);
      }
    } catch (err) {
      console.error('Error cargando vacantes:', err);
    } finally {
      setCargandoVacantes(false);
    }
  };

  // 3. Leer parámetros iniciales de la URL (si existen)
  const leerParametrosURL = () => {
    const params = new URLSearchParams(window.location.search);
    const iniciales = {
      buscar: params.get('buscar') || '',
      ubicacion: params.get('ubicacion') || '',
      tipo: params.get('tipo') || '',
      nivel: params.get('nivel') || '',
      salario_min: params.get('salario_min') || ''
    };
    
    if (Object.values(iniciales).some(val => val !== '')) {
      setFiltros(iniciales);
      // Ejecutar búsqueda con esos parámetros
      const queryParams = new URLSearchParams();
      if (iniciales.buscar) queryParams.set('search', iniciales.buscar);
      if (iniciales.ubicacion) queryParams.set('ubicacion', iniciales.ubicacion);
      if (iniciales.tipo) queryParams.set('tipo', iniciales.tipo);
      if (iniciales.nivel) queryParams.set('nivel', iniciales.nivel);
      if (iniciales.salario_min) queryParams.set('salario_min', iniciales.salario_min);
      fetchVacantes('?' + queryParams.toString());
    }
  };

  // ── MANEJADORES DE EVENTOS ─────────────────────────────────────────────
  
  // Seleccionar un empleo y cargar su detalle
  const handleSeleccionarEmpleo = async (id) => {
    try {
      const res = await fetch(`/api/vacantes/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setEmpleoSeleccionado(data.vacante);
        setYaPostulado(data.yaPostulado);
      }
    } catch (err) {
      console.error('Error cargando vacante:', err);
    }
  };

  // Cambios en los inputs de filtros
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Enviar formulario de búsqueda
  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (filtros.buscar.trim()) queryParams.set('search', filtros.buscar.trim());
    if (filtros.ubicacion.trim()) queryParams.set('ubicacion', filtros.ubicacion.trim());
    if (filtros.tipo) queryParams.set('tipo', filtros.tipo);
    if (filtros.nivel) queryParams.set('nivel', filtros.nivel);
    if (filtros.salario_min) queryParams.set('salario_min', filtros.salario_min);
    
    fetchVacantes('?' + queryParams.toString());
  };

  // Enviar postulación desde el Modal
  const handleEnviarPostulacion = async () => {
    if (!empleoSeleccionado) return;
    setEnviandoPostulacion(true);
    setFeedbackModal('');

    try {
      const res = await fetch(`/api/vacantes/${empleoSeleccionado.id_vacante}/postular`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carta_presentacion: cartaPresentacion })
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = '/usuario/usuario-login.html';
        return;
      }

      if (data.ok) {
        // Cerrar modal usando la API vanilla de Bootstrap vinculada a React
        const modalEl = document.getElementById('modalPostularEmpleos');
        const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
        modalInstance?.hide();

        // Limpiar carta y refrescar el estado del botón
        setCartaPresentacion('');
        handleSeleccionarEmpleo(empleoSeleccionado.id_vacante);
      } else {
        setFeedbackModal(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoPostulacion(false);
    }
  };

  // Helper para links de perfil
  const getProfileLink = (rol) => {
    if (rol === 'empresa') return '/comunidad_recursos/empresa.html';
    if (rol === 'admin') return '/admin/admin.html';
    return '/usuario/usuario.html';
  };

  // ── RENDERIZADO (JSX) ──────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* 1. Navbar Adaptado */}
      <nav id="nav-website" className="navbar navbar-expand-lg bg-dark navbar-dark px-3 justify-content-between">
        <a className="navbar-brand fw-bold" href="/">TrabajoSV</a>
        <div id="nav-auth-area">
          {usuario.logged ? (
            <div className="d-flex align-items-center gap-2">
              <a href={getProfileLink(usuario.user.rol)} className="d-flex align-items-center gap-2 text-decoration-none">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#fff'
                }}>
                  {usuario.user.nombre ? usuario.user.nombre[0].toUpperCase() : '?'}
                </div>
                <span className="text-white fw-semibold" style={{ fontSize: '0.875rem' }}>
                  Hola, {usuario.user.nombre}
                </span>
              </a>
              <a href="/auth/logout" className="btn btn-sm rounded-pill px-3 fw-semibold ms-1 text-white"
                 style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
                Salir
              </a>
            </div>
          ) : (
            <a className="btn btn-warning btn-sm px-4 fw-semibold rounded-pill" href="/usuario/usuario-login.html">
              Ingresar
            </a>
          )}
        </div>
      </nav>

      {/* 2. Contenido Principal */}
      <div id="div-root" className="container-fluid flex-column flex-grow-1 py-3 px-3 px-md-4">
        
        {/* Barra de Filtros */}
        <div id="container-filter" className="filter-bar mb-3">
          <form className="row g-2 align-items-end" onSubmit={handleBuscarSubmit}>
            <div className="col-md-4">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#4a4740' }}>Buscar empleo</label>
              <input type="text" name="buscar" value={filtros.buscar} onChange={handleInputChange} placeholder="Cargo, empresa o habilidad..." className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#4a4740' }}>Ubicación</label>
              <input list="ubicaciones-list" name="ubicacion" value={filtros.ubicacion} onChange={handleInputChange} autoComplete="off" placeholder="Ciudad o departamento" className="form-control" />
              <datalist id="ubicaciones-list">
                {['Ahuachapán', 'Santa Ana', 'San Salvador', 'San Miguel', 'La Libertad', 'Sonsonate', 'Chalatenango'].map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#4a4740' }}>Tipo</label>
              <select name="tipo" value={filtros.tipo} onChange={handleInputChange} className="form-select">
                <option value="">Cualquier tipo</option>
                <option value="tiempo_completo">Tiempo completo</option>
                <option value="medio_tiempo">Medio tiempo</option>
                <option value="freelance">Freelance</option>
                <option value="practicas">Prácticas</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#4a4740' }}>Nivel</label>
              <select name="nivel" value={filtros.nivel} onChange={handleInputChange} className="form-select">
                <option value="">Todos</option>
                <option value="sin_experiencia">Sin exp.</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="directivo">Directivo</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label small fw-semibold mb-1" style={{ color: '#4a4740' }}>Salario mín.</label>
              <input type="number" name="salario_min" value={filtros.salario_min} onChange={handleInputChange} min="0" placeholder="0" className="form-control" />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-warning w-100 fw-semibold">
                <i className="bi bi-search me-1"></i>Buscar
              </button>
            </div>
          </form>
        </div>

        <p className="text-muted small fw-semibold mb-2 ms-1" style={{ letterSpacing: '0.03em' }}>RESULTADOS DE BÚSQUEDA</p>

        <div className="row g-3 flex-grow-1">
          {/* Panel Izquierdo: Tarjetas de Empleo */}
          <div className="col-md-4">
            <div className="jobs-panel">
              <div className="jobs-panel-header">Vacantes disponibles</div>
              <div id="container-card-empleos">
                {cargandoVacantes ? (
                  <p className="text-muted small text-center py-3">Cargando empleos...</p>
                ) : vacantes.length === 0 ? (
                  <p className="text-muted small text-center py-4">No se encontraron empleos.</p>
                ) : (
                  vacantes.map(emp => (
                    <div 
                      key={emp.id} 
                      className={`card card-empleo-item p-3 mb-2 style-card-clickable ${empleoSeleccionado?.id_vacante === emp.id ? 'border-warning shadow-sm' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSeleccionarEmpleo(emp.id)}
                    >
                      <h6 className="fw-bold mb-1 text-primary">{emp.titulo}</h6>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-geo-alt me-1"></i>{emp.ubicacion} &nbsp;·&nbsp; 
                        <i className="bi bi-clock me-1"></i>{emp.tipoEmpleo}
                      </p>
                      <span className="badge bg-light text-dark mt-2 align-self-start">{emp.salario}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho: Detalle del Empleo */}
          <div className="col-md-8">
            <div className="detail-panel">
              {!empleoSeleccionado ? (
                <div id="detail-placeholder" className="detail-body text-center py-5">
                  <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: '#d1d5db' }}></i>
                  <p className="text-muted mt-3">Selecciona una vacante para ver los detalles</p>
                </div>
              ) : (
                <div id="detail-panel-content">
                  <div className="detail-header">
                    <h5 className="text-white fw-bold mb-1">{empleoSeleccionado.titulo}</h5>
                    <p className="text-white-50 small mb-0">
                      <i className="bi bi-building me-1"></i>{empleoSeleccionado.nombre_empresa || ''}
                      &nbsp;·&nbsp;
                      <i className="bi bi-geo-alt me-1"></i>{empleoSeleccionado.ubicacion || ''}
                    </p>
                  </div>
                  <div className="detail-body">
                    <div id="detail-chips" className="d-flex flex-wrap gap-2 mb-4">
                      <span className="meta-chip"><i className="bi bi-geo-alt-fill text-danger"></i> {empleoSeleccionado.ubicacion || 'El Salvador'}</span>
                      <span className="meta-chip"><i className="bi bi-clock-fill" style={{ color: '#2e3266' }}></i> {empleoSeleccionado.tipo_contrato?.replace(/_/g, ' ')}</span>
                      <span className="meta-chip"><i className="bi bi-cash-coin text-warning"></i> {empleoSeleccionado.salario_min && empleoSeleccionado.salario_max ? `$${empleoSeleccionado.salario_min} - $${empleoSeleccionado.salario_max}` : 'A convenir'}</span>
                      <span className="meta-chip"><i className="bi bi-bar-chart-fill" style={{ color: '#059669' }}></i> {empleoSeleccionado.nivel_experiencia?.replace(/_/g, ' ')}</span>
                    </div>

                    <h6 className="fw-bold mb-2" style={{ color: '#1a1d2e' }}>Descripción del puesto</h6>
                    <p className="text-muted small custom-text-justify" style={{ whiteSpace: 'pre-wrap' }}>
                      {empleoSeleccionado.descripcion || 'Sin descripción disponible.'}
                    </p>

                    <div className="d-flex justify-content-end mt-3">
                      {yaPostulado ? (
                        <button className="btn btn-secondary px-4 fw-semibold rounded-pill" disabled>
                          ✓ Ya postulado
                        </button>
                      ) : (
                        <button 
                          className="btn btn-warning px-4 fw-semibold rounded-pill"
                          data-bs-toggle="modal" 
                          data-bs-target="#modalPostularEmpleos"
                        >
                          <i className="bi bi-send-fill me-1"></i>Postularme
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modal Postulación */}
      <div className="modal fade" id="modalPostularEmpleos" tabIndex="-1" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold">Enviar Postulación</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              {feedbackModal && <div className="alert alert-danger py-2 small mb-2">{feedbackModal}</div>}
              
              <label className="form-label small fw-semibold">
                Carta de presentación <span className="text-muted fw-normal">(opcional)</span>
              </label>
              <textarea 
                className="form-control" 
                rows="5" 
                value={cartaPresentacion}
                onChange={(e) => setCartaPresentacion(e.target.value)}
                placeholder="Cuéntale al empleador por qué eres el candidato ideal..."
              ></textarea>
              
              <button 
                className="btn w-100 fw-semibold rounded-pill py-2 mt-3" 
                style={{ background: '#2e3266', color: '#fff' }}
                onClick={handleEnviarPostulacion}
                disabled={enviandoPostulacion}
              >
                {enviandoPostulacion ? 'Enviando...' : <><i className="bi bi-send-fill me-1"></i>Enviar Postulación</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer id="footer-website" className="mt-auto bg-light text-center py-3 border-top">
         <span className="text-muted small">© 2026 TrabajoSV. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}