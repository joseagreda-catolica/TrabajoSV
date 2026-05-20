require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const flash   = require('express-flash');
const path    = require('path');

const app = express();

// CORS — permite al frontend React en desarrollo
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET no está definida en .env');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
}));

app.use(flash());

// Rutas
app.use('/api', require('./src/routes/api'));

// Error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ ok: false, message: err.message || 'Error interno del servidor' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
