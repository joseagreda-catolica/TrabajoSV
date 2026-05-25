import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { candidatoAPI } from '../../api'

const ESTADO_LABELS = {
  pendiente:  'Pendiente',
  revisando:  'En revisión',
  aceptado:   'Aceptado',
  rechazado:  'Rechazado',
}

export default function Postulaciones() {
  const [postulaciones, setPostulaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    candidatoAPI.postulaciones()
      .then(({ data }) => setPostulaciones(data.postulaciones || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page-postulaciones">
      <h1>Mis postulaciones</h1>
      {loading && <p>Cargando...</p>}
      <div className="postulaciones-list">
        {postulaciones.map(p => (
          <div key={p.id_postulacion} className="postulacion-card">
            <h3>{p.titulo_vacante || p.titulo}</h3>
            <p className="empresa">{p.nombre_empresa}</p>
            <span className={`estado estado-${p.estado}`}>
              {ESTADO_LABELS[p.estado] || p.estado}
            </span>
            <small>{new Date(p.fecha_postulacion || p.fecha).toLocaleDateString()}</small>
            <Link to={`/vacante/${p.id_vacante}`}>Ver vacante</Link>
          </div>
        ))}
        {!loading && postulaciones.length === 0 && (
          <p>Aún no te has postulado a ninguna vacante. <Link to="/empleos">Buscar empleos</Link></p>
        )}
      </div>
    </main>
  )
}
