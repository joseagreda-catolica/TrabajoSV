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
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Portal de Trabajo</Link>
      <ul className="navbar-links">
        <li><Link to="/empleos">Empleos</Link></li>
        <li><Link to="/recursos">Recursos</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>

        {!user && (
          <>
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li><Link to="/registro">Registrarse</Link></li>
          </>
        )}

        {user?.rol === 'candidato' && (
          <>
            <li><Link to="/usuario">Mi perfil</Link></li>
            <li><Link to="/postulaciones">Postulaciones</Link></li>
            <li><Link to="/alertas">Alertas</Link></li>
          </>
        )}

        {user?.rol === 'empresa' && (
          <li><Link to="/empresa">Panel empresa</Link></li>
        )}

        {user?.rol === 'admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}

        {user && (
          <li>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar sesión
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
