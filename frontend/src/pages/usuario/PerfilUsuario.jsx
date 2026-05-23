import { useState, useEffect } from 'react'
import { candidatoAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function PerfilUsuario() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    candidatoAPI.perfil()
      .then(({ data }) => setPerfil(data.candidato || data.perfil || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleGuardar(e) {
    e.preventDefault()
    try {
      const formData = new FormData(e.target)
      const datos = Object.fromEntries(formData)
      await candidatoAPI.actualizar(datos)
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar el perfil' })
    }
  }

  if (loading) return <p>Cargando perfil...</p>

  return (
    <main className="page-perfil">
      <h1>Mi perfil</h1>
      <p>Bienvenido, {user?.nombre} {user?.apellido}</p>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <form onSubmit={handleGuardar} className="perfil-form">
        <label>
          Teléfono
          <input name="telefono" defaultValue={perfil?.telefono || ''} />
        </label>
        <label>
          Ubicación
          <input name="ubicacion" defaultValue={perfil?.ubicacion || ''} />
        </label>
        <label>
          Nivel de experiencia
          <select name="nivel_experiencia" defaultValue={perfil?.nivel_experiencia || ''}>
            <option value="">Seleccionar</option>
            <option value="sin_experiencia">Sin experiencia</option>
            <option value="junior">Junior</option>
            <option value="semi_senior">Semi-senior</option>
            <option value="senior">Senior</option>
          </select>
        </label>
        <label>
          Habilidades
          <input name="habilidades" defaultValue={perfil?.habilidades || ''} placeholder="React, Node.js, etc." />
        </label>
        <label>
          Resumen profesional
          <textarea name="resumen" defaultValue={perfil?.resumen || ''} rows={4} />
        </label>
        <button type="submit" className="btn btn-primary">Guardar cambios</button>
      </form>
    </main>
  )
}
