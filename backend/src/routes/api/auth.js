const router  = require('express').Router();
const Usuario  = require('../../models/Usuario');
const Candidato = require('../../models/Candidato');
const Empresa   = require('../../models/Empresa');

// GET /api/auth/check-session
router.get('/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ logged: true, user: req.session.user });
  } else {
    res.json({ logged: false, user: null });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ ok: false, message: 'Email y contraseña son requeridos' });

    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario)
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos' });

    if (!usuario.activo)
      return res.status(403).json({ ok: false, message: 'Tu cuenta está desactivada. Contacta al administrador' });

    const valid = await Usuario.verificarPassword(password, usuario.password_hash);
    if (!valid)
      return res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos' });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ ok: false, message: 'Error de sesión' });

      const user = {
        id:       usuario.id_usuario,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        email:    usuario.email,
        rol:      usuario.rol,
      };

      req.session.user = user;
      res.json({ ok: true, user });
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, password, password2, rol, nombre_empresa } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !email?.trim())
      return res.status(400).json({ ok: false, message: 'Nombre, apellido y email son requeridos' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ ok: false, message: 'Email inválido' });

    if (!password || password.length < 8 || password.length > 72)
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener entre 8 y 72 caracteres' });

    if (password !== password2)
      return res.status(400).json({ ok: false, message: 'Las contraseñas no coinciden' });

    const rolValido = rol && ['candidato', 'empresa'].includes(rol) ? rol : 'candidato';

    if (rolValido === 'empresa' && (!nombre_empresa?.trim()))
      return res.status(400).json({ ok: false, message: 'Nombre de empresa es requerido' });

    const existe = await Usuario.buscarPorEmail(email);
    if (existe)
      return res.status(409).json({ ok: false, message: 'El email ya está registrado' });

    const idUsuario = await Usuario.crear({ nombre, apellido, email, password, rol: rolValido });

    if (rolValido === 'empresa') {
      await Empresa.crear(idUsuario, { nombre_empresa: nombre_empresa.trim() });
    } else {
      await Candidato.crear(idUsuario);
    }

    res.status(201).json({ ok: true, message: 'Cuenta creada exitosamente. Inicia sesión' });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ ok: false, message: 'Error al crear la cuenta' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

module.exports = router;
