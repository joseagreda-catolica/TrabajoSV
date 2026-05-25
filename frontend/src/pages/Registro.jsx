import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', password2: '',
    rol: 'candidato', nombre_empresa: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      if (data.ok) {
        navigate('/login')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-auth">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>
          <label>
            Apellido
            <input name="apellido" value={form.apellido} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Contraseña
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
          </label>
          <label>
            Confirmar contraseña
            <input type="password" name="password2" value={form.password2} onChange={handleChange} required />
          </label>
          <label>
            Tipo de cuenta
            <select name="rol" value={form.rol} onChange={handleChange}>
              <option value="candidato">Candidato</option>
              <option value="empresa">Empresa</option>
            </select>
          </label>
          {form.rol === 'empresa' && (
            <label>
              Nombre de empresa
              <input name="nombre_empresa" value={form.nombre_empresa} onChange={handleChange} required />
            </label>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </main>
  )
}
