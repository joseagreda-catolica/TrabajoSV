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
    <main className="page-auth">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </div>
    </main>
  )
}
