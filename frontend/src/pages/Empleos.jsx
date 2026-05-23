import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vacantesAPI } from '../api'

export default function Empleos() {
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    search: '',
    ubicacion: '',
    tipo: '',
    nivel: '',
  })

  useEffect(() => {
    buscar()
  }, [])

  async function buscar(e) {
    e?.preventDefault()
    setLoading(true)
    try {
      const { data } = await vacantesAPI.listar(filtros)
      setVacantes(data.vacantes || [])
    } catch {
      setError('Error al cargar vacantes')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <main className="page-empleos">
      <h1>Buscar empleos</h1>

      <form className="filtros-form" onSubmit={buscar}>
        <input
          name="search"
          placeholder="Palabra clave, cargo, empresa..."
          value={filtros.search}
          onChange={handleChange}
        />
        <input
          name="ubicacion"
          placeholder="Ubicación"
          value={filtros.ubicacion}
          onChange={handleChange}
        />
        <select name="tipo" value={filtros.tipo} onChange={handleChange}>
          <option value="">Tipo de contrato</option>
          <option value="tiempo_completo">Tiempo completo</option>
          <option value="medio_tiempo">Medio tiempo</option>
          <option value="freelance">Freelance</option>
          <option value="practicas">Prácticas</option>
        </select>
        <select name="nivel" value={filtros.nivel} onChange={handleChange}>
          <option value="">Nivel de experiencia</option>
          <option value="sin_experiencia">Sin experiencia</option>
          <option value="junior">Junior</option>
          <option value="semi_senior">Semi-senior</option>
          <option value="senior">Senior</option>
        </select>
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      {loading && <p>Cargando vacantes...</p>}
      {error && <p className="error">{error}</p>}

      <div className="vacantes-grid">
        {vacantes.map(v => (
          <div key={v.id_vacante} className="vacante-card">
            <h3>{v.titulo}</h3>
            <p className="empresa">{v.nombre_empresa}</p>
            <p className="ubicacion">{v.ubicacion}</p>
            <p className="tipo">{v.tipo_contrato}</p>
            {v.salario && <p className="salario">S/ {v.salario}</p>}
            <Link to={`/vacante/${v.id_vacante}`} className="btn btn-secondary">
              Ver detalle
            </Link>
          </div>
        ))}
        {!loading && vacantes.length === 0 && (
          <p>No se encontraron vacantes con los filtros seleccionados.</p>
        )}
      </div>
    </main>
  )
}
