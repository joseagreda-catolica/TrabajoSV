const router     = require('express').Router();
const { apiAuth, apiRole } = require('../../middlewares/auth');
const Valoracion = require('../../models/Valoracion');
const Empresa    = require('../../models/Empresa');
const Candidato  = require('../../models/Candidato');

// Obtener valoraciones de una empresa (público)
router.get('/:id_empresa', async (req, res) => {
  try {
    const empresa = await Empresa.buscarPorId(req.params.id_empresa);
    if (!empresa) return res.status(404).json({ ok: false, message: 'Empresa no encontrada' });
    const valoraciones = await Valoracion.listarPorEmpresa(req.params.id_empresa);
    const promedio     = await Empresa.obtenerPromedioValoracion(req.params.id_empresa);
    res.json({ ok: true, empresa, valoraciones, promedio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Error al obtener valoraciones' });
  }
});

// Enviar valoración (candidato)
router.post('/:id_empresa', apiAuth, apiRole('candidato'), async (req, res) => {
  try {
    const { puntuacion, comentario } = req.body;

    if (!puntuacion) {
      return res.status(400).json({ ok: false, message: 'La puntuación es requerida' });
    }

    const puntuacionNum = parseInt(puntuacion);
    if (isNaN(puntuacionNum) || puntuacionNum < 1 || puntuacionNum > 5) {
      return res.status(400).json({ ok: false, message: 'La puntuación debe ser entre 1 y 5' });
    }

    const candidato = await Candidato.buscarPorUsuario(req.session.user.id);
    if (!candidato) return res.status(400).json({ ok: false, message: 'Completa tu perfil de candidato primero' });

    // Verificar que no ya existe una valoración de este candidato para esta empresa
    const yaValoro = await Valoracion.existeValoracion(req.params.id_empresa, candidato.id_candidato);
    if (yaValoro) {
      return res.status(409).json({ ok: false, message: 'Ya has valorado esta empresa' });
    }

    await Valoracion.crear({
      id_empresa:   req.params.id_empresa,
      id_candidato: candidato.id_candidato,
      puntuacion: puntuacionNum,
      comentario:   comentario || null
    });

    res.status(201).json({ ok: true, message: 'Valoración publicada exitosamente.' });
  } catch (err) {
    console.error('Error en valoraciones:', err);
    res.status(500).json({ ok: false, message: 'Error al enviar valoración' });
  }
});

module.exports = router;
