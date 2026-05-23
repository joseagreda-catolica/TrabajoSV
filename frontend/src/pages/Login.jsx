import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Helper centralizado para no repetir la lógica de rutas por rol
  const obtenerRutaDestino = (rol) => {
    if (rol === 'admin') return '/admin'
    if (rol === 'empresa') return '/empresa'
    return '/usuario'
  }

  // ── CORRECCIÓN CRÍTICA: Redirección segura si el usuario ya está autenticado ──
  useEffect(() => {
    if (user) {
      navigate(obtenerRutaDestino(user.rol), { replace: true })
    }
  }, [user, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(form.email, form.password)
      
      if (data?.ok) {
        // Al actualizar el contexto de Auth, el useEffect de arriba se encargará 
        // de redirigir limpiamente si la app recarga el estado global.
        navigate(obtenerRutaDestino(data.user.rol), { replace: true })
      } else {
        setError(data?.message || 'Credenciales incorrectas')
      }
    } catch (err) {
      // Manejo robusto de errores de red o respuestas de Axios/Fetch
      const msgError = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      setError(msgError)
    } finally {
      setLoading(false)
    }
  }

  // Si ya hay usuario, evitamos parpadeos visuales devolviendo null mientras el useEffect redirige
  if (user) return null

  return (
    <main className="page-auth">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        
        {error && (
          <div className="error" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
        
        <p className="mt-3 text-center">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </main>
  )
}