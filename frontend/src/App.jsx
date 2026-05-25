import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Empleos from './pages/Empleos'
import DetalleVacante from './pages/DetalleVacante'
import Recursos from './pages/Recursos'
import Comunidad from './pages/Comunidad'
import Login from './pages/Login'
import Registro from './pages/Registro'
import PerfilUsuario from './pages/usuario/PerfilUsuario'
import Postulaciones from './pages/usuario/Postulaciones'
import AlertasVacantes from './pages/usuario/AlertasVacantes'
import PanelEmpresa from './pages/empresa/PanelEmpresa'
import PanelAdmin from './pages/admin/PanelAdmin'

function NotFound() {
  return <main style={{ padding: '2rem', textAlign: 'center' }}><h1>404 - Página no encontrada</h1></main>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/empleos" element={<Empleos />} />
              <Route path="/vacante/:id" element={<DetalleVacante />} />
              <Route path="/recursos" element={<Recursos />} />
              <Route path="/comunidad" element={<Comunidad />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              {/* Candidato */}
              <Route path="/usuario" element={
                 <ProtectedRoute roles={['candidato']}>
                  <PerfilUsuario />
                 </ProtectedRoute>
              } />
              <Route path="/postulaciones" element={
                <ProtectedRoute roles={['candidato']}>
                  <Postulaciones />
                </ProtectedRoute>
              } />
              <Route path="/alertas" element={
                 <ProtectedRoute roles={['candidato']}>
                  <AlertasVacantes />
                 </ProtectedRoute>
              } />

              {/* Empresa */}
              <Route path="/empresa" element={
                 <ProtectedRoute roles={['empresa']}>
                  <PanelEmpresa />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <PanelAdmin />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
