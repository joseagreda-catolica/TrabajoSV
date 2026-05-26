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

  function setRol(rol) {
    setForm(prev => ({ ...prev, rol }))
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
    <div className="d-flex flex-grow-1">
      <div className="row w-100 m-0">

        <div className="col-md-5 d-flex bg-azul-oscuro py-5">
          <div className="m-auto px-3" style={{ maxWidth: 380 }}>
            <h2 className="fw-bold mb-3">Crea tu perfil y comienza hoy mismo</h2>
            <p className="fw-normal">
              Únete a más de 18,000 profesionales que ya encontraron su trabajo ideal en TrabajoSV.
            </p>
          </div>
        </div>

        <div className="col-md-7 bg-beige-suave py-5">
          <div className="p-4" style={{ maxWidth: 520, margin: '0 auto' }}>
            <h4 className="fw-bold mb-1">Crear cuenta</h4>
            <p className="text-muted mb-3">¿Cómo deseas registrarte?</p>

            <div className="d-flex gap-3 mb-4">
              <button
                type="button"
                className={`btn flex-grow-1 ${form.rol === 'candidato' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setRol('candidato')}
              >
                <i className="bi bi-person-check me-2"></i>Soy Candidato
              </button>
              <button
                type="button"
                className={`btn flex-grow-1 ${form.rol === 'empresa' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setRol('empresa')}
              >
                <i className="bi bi-building-check me-2"></i>Soy Empresa
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label fw-semibold small">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    placeholder="Juan"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control"
                    placeholder="Pérez"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {form.rol === 'empresa' && (
                <div>
                  <label className="form-label fw-semibold small">Nombre de empresa</label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    className="form-control"
                    placeholder="Mi Empresa SV"
                    value={form.nombre_empresa}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

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
                  minLength={8}
                />
              </div>
              <div>
                <label className="form-label fw-semibold small">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="password2"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password2}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-50 mx-auto fw-semibold"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
              </button>
            </form>

            <p className="text-center mt-3 small">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
