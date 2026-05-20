import { useState, useEffect } from 'react'
import { candidatoAPI } from '../../api'

export default function AlertasVacantes() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState({ palabra_clave: '', ubicacion: '', tipo_contrato: '' })

  useEffect(() => {
    candidatoAPI.alertas()
      .then(({ data }) => setAlertas(data.alertas || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    try {
      const { data } = await candidatoAPI.crearAlerta(nueva)
      if (data.ok) {
        setAlertas(prev => [...prev, data.alerta])
        setNueva({ palabra_clave: '', ubicacion: '', tipo_contrato: '' })
      }
    } catch {}
  }

  async function handleEliminar(id) {
    try {
      await candidatoAPI.eliminarAlerta(id)
      setAlertas(prev => prev.filter(a => a.id_alerta !== id))
    } catch {}
  }

  return (
    <main className="page-alertas">
      <h1>Alertas de vacantes</h1>
      <p>Recibe notificaciones cuando aparezcan vacantes que coincidan con tus preferencias.</p>

      <section className="nueva-alerta">
        <h2>Crear nueva alerta</h2>
        <form onSubmit={handleCrear}>
          <label>
            Palabra clave
            <input
              value={nueva.palabra_clave}
              onChange={e => setNueva(p => ({ ...p, palabra_clave: e.target.value }))}
              placeholder="Ej: desarrollador React"
            />
          </label>
          <label>
            Ubicación
            <input
              value={nueva.ubicacion}
              onChange={e => setNueva(p => ({ ...p, ubicacion: e.target.value }))}
              placeholder="Ej: Lima"
            />
          </label>
          <label>
            Tipo de contrato
            <select
              value={nueva.tipo_contrato}
              onChange={e => setNueva(p => ({ ...p, tipo_contrato: e.target.value }))}
            >
              <option value="">Cualquiera</option>
              <option value="tiempo_completo">Tiempo completo</option>
              <option value="medio_tiempo">Medio tiempo</option>
              <option value="freelance">Freelance</option>
              <option value="practicas">Prácticas</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Crear alerta</button>
        </form>
      </section>

      <section className="mis-alertas">
        <h2>Mis alertas</h2>
        {loading && <p>Cargando...</p>}
        {alertas.map(a => (
          <div key={a.id_alerta} className="alerta-card">
            <p><strong>{a.palabra_clave || 'Cualquier puesto'}</strong></p>
            {a.ubicacion && <p>Ubicación: {a.ubicacion}</p>}
            {a.tipo_contrato && <p>Tipo: {a.tipo_contrato}</p>}
            <button onClick={() => handleEliminar(a.id_alerta)} className="btn btn-danger">
              Eliminar
            </button>
          </div>
        ))}
        {!loading && alertas.length === 0 && <p>No tienes alertas configuradas.</p>}
      </section>
    </main>
  )
}
