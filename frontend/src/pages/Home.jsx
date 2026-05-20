import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="page-home">
      <section className="hero">
        <h1>Encuentra tu trabajo ideal</h1>
        <p>Conectamos candidatos con las mejores empresas</p>
        <div className="hero-actions">
          <Link to="/empleos" className="btn btn-primary">Buscar empleos</Link>
          {!user && <Link to="/registro" className="btn btn-secondary">Registrarse</Link>}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Para candidatos</h3>
          <p>Postúlate a vacantes, sube tu CV y recibe alertas de nuevas oportunidades.</p>
          <Link to="/registro">Comenzar</Link>
        </div>
        <div className="feature-card">
          <h3>Para empresas</h3>
          <p>Publica tus vacantes y encuentra los mejores talentos del mercado.</p>
          <Link to="/registro">Publicar vacante</Link>
        </div>
        <div className="feature-card">
          <h3>Comunidad</h3>
          <p>Comparte experiencias, recursos y consejos con otros profesionales.</p>
          <Link to="/comunidad">Explorar</Link>
        </div>
      </section>
    </main>
  )
}
