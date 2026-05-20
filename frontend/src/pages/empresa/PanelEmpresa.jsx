import { useState, useEffect } from 'react'
import { empresaAPI } from '../../api'

export default function PanelEmpresa() {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nueva, setNueva] = useState({
    titulo: '', descripcion: '', requisitos: '', ubicacion: '',
    tipo_contrato: 'tiempo_completo', nivel_experiencia: 'junior', salario: '',
  })
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    empresaAPI.vacantes()
      .then(({ data }) => setVacantes(data.vacantes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    try {
      const { data } = await empresaAPI.crearVacante(nueva)
      if (data.ok) {
        setVacantes(prev => [data.vacante, ...prev])
        setNueva({ titulo: '', descripcion: '', requisitos: '', ubicacion: '', tipo_contrato: 'tiempo_completo', nivel_experiencia: 'junior', salario: '' })
        setMostrarForm(false)
        setMensaje({ tipo: 'success', texto: 'Vacante publicada exitosamente' })
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al publicar vacante' })
    }
  }

  async function handleCambiarEstado(id, estado) {
    try {
      await empresaAPI.actualizarVacante(id, { estado })
      setVacantes(prev => prev.map(v => v.id_vacante === id ? { ...v, estado } : v))
    } catch {}
  }

  function handleChange(e) {
    setNueva(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  return (
    <main className="page-empresa">
      <div className="empresa-header">
        <h1>Panel de empresa</h1>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Publicar vacante'}
        </button>
      </div>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      {mostrarForm && (
        <form className="form-vacante" onSubmit={handleCrear}>
          <h2>Nueva vacante</h2>
          <label>Título<input name="titulo" value={nueva.titulo} onChange={handleChange} required /></label>
          <label>Descripción<textarea name="descripcion" value={nueva.descripcion} onChange={handleChange} rows={4} required /></label>
          <label>Requisitos<textarea name="requisitos" value={nueva.requisitos} onChange={handleChange} rows={3} /></label>
          <label>Ubicación<input name="ubicacion" value={nueva.ubicacion} onChange={handleChange} /></label>
          <label>
            Tipo de contrato
            <select name="tipo_contrato" value={nueva.tipo_contrato} onChange={handleChange}>
              <option value="tiempo_completo">Tiempo completo</option>
              <option value="medio_tiempo">Medio tiempo</option>
              <option value="freelance">Freelance</option>
              <option value="practicas">Prácticas</option>
            </select>
          </label>
          <label>
            Nivel de experiencia
            <select name="nivel_experiencia" value={nueva.nivel_experiencia} onChange={handleChange}>
              <option value="sin_experiencia">Sin experiencia</option>
              <option value="junior">Junior</option>
              <option value="semi_senior">Semi-senior</option>
              <option value="senior">Senior</option>
            </select>
          </label>
          <label>Salario (opcional)<input name="salario" type="number" value={nueva.salario} onChange={handleChange} /></label>
          <button type="submit" className="btn btn-primary">Publicar</button>
        </form>
      )}

      <section className="mis-vacantes">
        <h2>Mis vacantes</h2>
        {loading && <p>Cargando...</p>}
        <div className="vacantes-grid">
          {vacantes.map(v => (
            <div key={v.id_vacante} className="vacante-card">
              <h3>{v.titulo}</h3>
              <p>{v.ubicacion}</p>
              <span className={`estado estado-${v.estado}`}>{v.estado}</span>
              <div className="vacante-actions">
                {v.estado === 'activa' && (
                  <button onClick={() => handleCambiarEstado(v.id_vacante, 'cerrada')} className="btn btn-secondary">
                    Cerrar
                  </button>
                )}
                {v.estado === 'cerrada' && (
                  <button onClick={() => handleCambiarEstado(v.id_vacante, 'activa')} className="btn btn-primary">
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loading && vacantes.length === 0 && <p>Aún no has publicado vacantes.</p>}
        </div>
      </section>
    </main>
  )
}
