import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import './Registro.css'

export default function Registro() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password2: '',
    rol: 'candidato',
    nombre_empresa: '',
    area: ''
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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

      setError(
        err.response?.data?.message ||
        'Error al registrarse'
      )

    }
    finally {
      setLoading(false)
    }

  }

  return (

    <div className="register-page">


      <div className="register-content">

        <section className="left-side">

          <h1>
            Crea tu perfil y comienza hoy mismo
          </h1>

          <p>
            Únete a más de 18,000 profesionales que ya encontraron su trabajo ideal.
          </p>

        </section>

        <section className="right-side">

          <div className="form-card">

            <h2>
              Crear cuenta
            </h2>

            <p className="subtitle">
              ¿Cómo deseas registrarte?
            </p>

            <div className="role-selector">

              <button
                type="button"
                className={
                  form.rol === 'candidato'
                    ? 'selected' : ''
                }
                onClick={() =>
                  setForm({
                    ...form,
                    rol: 'candidato'
                  })
                }
              >

                👤 Soy candidato

              </button>

              <button
                type="button"
                className={
                  form.rol === 'empresa'
                    ? 'selected' : ''
                }
                onClick={() =>
                  setForm({
                    ...form,
                    rol: 'empresa'
                  })
                }
              >

                🏢 Soy empresa

              </button>

            </div>

            {error &&
              <div className="error">
                {error}
              </div>
            }

            <form onSubmit={handleSubmit}>

              <div className="two-cols">

                <input
                  placeholder="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />

                <input
                  placeholder="Apellido"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                />

              </div>

              <input
                type="email"
                placeholder="Correo electrónico"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div className="two-cols">

                <input
                  type="password"
                  placeholder="Mín. 8 caracteres"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  placeholder="Repetir"
                  name="password2"
                  value={form.password2}
                  onChange={handleChange}
                  required
                />

              </div>

              <select
                name="area"
                value={form.area}
                onChange={handleChange}
              >

                <option value="">
                  Seleccionar área...
                </option>

                <option>
                  Tecnología
                </option>

                <option>
                  Diseño
                </option>

                <option>
                  Marketing
                </option>

              </select>

              {
                form.rol === 'empresa'
                &&
                <input
                  placeholder="Nombre empresa"
                  name="nombre_empresa"
                  value={form.nombre_empresa}
                  onChange={handleChange}
                  required
                />
              }

              <button
                disabled={loading}
                className="submit-btn"
              >

                {
                  loading
                    ?
                    'Creando cuenta...'
                    :
                    'Crear mi cuenta gratis'
                }

              </button>

            </form>

          </div>

        </section>

      </div>

    </div>

  )

}