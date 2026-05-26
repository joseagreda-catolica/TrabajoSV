const router  = require('express').Router();
const Recurso = require('../../models/Recurso');

// Ruta de depuración
router.use((req, res, next) => {
  console.log('RECURSOS Router:', req.method, req.path);
  next();
});

// Obtener detalle de un recurso específico (público) - DEBE IR PRIMERO
router.get('/:id', async (req, res) => {
  try {
    const recurso = await Recurso.buscarPorId(req.params.id);
    if (!recurso) return res.status(404).json({ ok: false, message: 'Recurso no encontrado' });
    res.json({ ok: true, recurso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener recurso' });
  }
});

// Listar recursos con filtro opcional por tipo (público)
router.get('/', async (req, res) => {
  try {
    const recursos = await Recurso.listar(req.query.tipo || null);
    res.json({ ok: true, recursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener recursos' });
  }
});

module.exports = router;
