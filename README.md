# Portal de Trabajo

Plataforma de búsqueda de empleo con backend Node.js/Express y frontend React.js.

## Estructura del proyecto

```
portal-trabajo/
├── backend/          Node.js + Express + MySQL
├── frontend/         React.js + Vite
├── .env              Variables de entorno (no commitear)
├── .env.example      Plantilla de variables de entorno
└── portal_trabajo.sql  Schema de la base de datos
```

## Requisitos

- Node.js 18+
- MySQL (o acceso a Railway)

## Configuración inicial

```bash
# 1. Copia el archivo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de base de datos

# 2. Instala dependencias del backend
cd backend
npm install

# 3. Instala dependencias del frontend
cd ../frontend
npm install
```

## Ejecutar en desarrollo

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Corre en http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Corre en http://localhost:5173
```

El frontend ya tiene configurado un proxy a `localhost:3000`, por lo que las llamadas a `/api` se redirigen automáticamente al backend.

## Páginas del frontend

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Home | Público |
| `/empleos` | Listado de vacantes con filtros | Público |
| `/vacante/:id` | Detalle y postulación | Público / Candidato |
| `/recursos` | Recursos profesionales | Público |
| `/comunidad` | Foro de discusión | Público / Autenticado |
| `/login` | Inicio de sesión | Público |
| `/registro` | Crear cuenta | Público |
| `/usuario` | Perfil del candidato | Candidato |
| `/postulaciones` | Mis postulaciones | Candidato |
| `/alertas` | Alertas de vacantes | Candidato |
| `/empresa` | Panel de empresa | Empresa |
| `/admin` | Panel de administración | Admin |

## API del backend

Todas las rutas son bajo `/api`:

- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/register` — Registrarse
- `POST /api/auth/logout` — Cerrar sesión
- `GET  /api/auth/check-session` — Verificar sesión activa
- `GET  /api/vacantes` — Listar vacantes (con filtros)
- `GET  /api/vacantes/:id` — Detalle de vacante
- `POST /api/vacantes/:id/postular` — Postularse
- `GET  /api/candidato/perfil` — Perfil del candidato
- `GET  /api/candidato/postulaciones` — Mis postulaciones
- `GET  /api/empresa/vacantes` — Vacantes de la empresa
- `GET  /api/admin/usuarios` — Lista de usuarios (admin)

## Stack tecnológico

**Backend:**
- Node.js / Express 5
- MySQL 2
- express-session (autenticación por cookies/sesiones)
- bcryptjs (hash de contraseñas)
- cors, multer, dotenv

**Frontend:**
- React 19 + Vite
- React Router DOM 7
- Axios
- CSS puro (sin framework de UI — agregar según preferencia del equipo)
