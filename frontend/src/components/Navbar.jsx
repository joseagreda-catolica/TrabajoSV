import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ts-navbar sticky-top">
      <div className="container-fluid px-3">

        <Link className="navbar-brand fw-bold" to="/">TrabajoSV</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/empleos">
                <i className="bi bi-briefcase me-1"></i>Empleos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/recursos">
                <i className="bi bi-book me-1"></i>Recursos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/comunidad">
                <i className="bi bi-people me-1"></i>Comunidad
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">

            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Iniciar sesión</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm fw-semibold px-3" to="/registro">
                    Registrarse
                  </Link>
                </li>
              </>
            )}

            {user?.rol === 'candidato' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuario">
                    <i className="bi bi-person-circle me-1"></i>{user.nombre}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/postulaciones">Postulaciones</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/alertas">Alertas</Link>
                </li>
              </>
            )}

            {user?.rol === 'empresa' && (
              <li className="nav-item">
                <Link className="nav-link" to="/empresa">
                  <i className="bi bi-building me-1"></i>Mi empresa
                </Link>
              </li>
            )}

            {user?.rol === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin</Link>
              </li>
            )}

            {user && (
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm"
                >
                  Cerrar sesión
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  )
}
