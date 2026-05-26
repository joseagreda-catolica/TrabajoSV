import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    const destino = user.rol === 'admin' ? '/admin' : user.rol === 'empresa' ? '/empresa' : '/usuario'
    navigate(destino, { replace: true })
    return null
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      if (data.ok) {
        const destino = data.user.rol === 'admin' ? '/admin' : data.user.rol === 'empresa' ? '/empresa' : '/usuario'
        navigate(destino, { replace: true })
      } else {
        setError(data.message || 'Credenciales incorrectas')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-grow-1">
      <div className="row w-100 m-0">

        <div className="col-md-6 d-flex bg-azul-oscuro py-5">
          <div className="m-auto px-3" style={{ maxWidth: 420 }}>
            <h2 className="fw-bold mb-3">Accede a miles de oportunidades laborales</h2>
            <p className="fw-normal mb-4">
              Gestiona tus postulaciones y conecta con las mejores empresas de El Salvador.
            </p>
            <ul className="li-marker-yellow fw-normal ps-3">
              <li className="mb-2">Postúlate con un Click</li>
              <li className="mb-2">Alertas de empleo personalizadas</li>
              <li className="mb-2">Estadísticas de tu perfil</li>
              <li>Valorar empresas donde trabajaste</li>
            </ul>
          </div>
        </div>

        <div className="col-md-6 bg-beige-suave py-5">
          <div className="p-4" style={{ maxWidth: 440, margin: '0 auto' }}>
            <h4 className="fw-bold mb-1">Bienvenido de nuevo</h4>
            <p className="text-muted mb-4">Ingresa tus credenciales para continuar</p>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold small">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="form-label fw-semibold small">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-50 mx-auto fw-semibold"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="text-center mt-3 small">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro">Regístrate gratis</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
