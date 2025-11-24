import express from 'express';
import Pago from '../models/Pago.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los pagos
router.get('/', async (req, res) => {
  try {
    const pagos = await Pago.find()
      .populate('alumno', 'nombreCompleto')
      .populate('actividad', 'nombre cuotaIndividual')
      .sort({ fechaPago: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pagos por actividad
router.get('/actividad/:actividadId', async (req, res) => {
  try {
    const pagos = await Pago.find({ actividad: req.params.actividadId })
      .populate('alumno', 'nombreCompleto')
      .populate('actividad', 'nombre cuotaIndividual')
      .sort({ fechaPago: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pagos por alumno
router.get('/alumno/:alumnoId', async (req, res) => {
  try {
    const pagos = await Pago.find({ alumno: req.params.alumnoId })
      .populate('alumno', 'nombreCompleto')
      .populate('actividad', 'nombre cuotaIndividual')
      .sort({ fechaPago: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar un pago
router.post('/', async (req, res) => {
  try {
    const pago = new Pago(req.body);
    await pago.save();
    await pago.populate('alumno', 'nombreCompleto');
    await pago.populate('actividad', 'nombre cuotaIndividual');
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un pago
router.put('/:id', async (req, res) => {
  try {
    const pago = await Pago.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('alumno', 'nombreCompleto')
      .populate('actividad', 'nombre cuotaIndividual');
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un pago
router.delete('/:id', async (req, res) => {
  try {
    const pago = await Pago.findByIdAndDelete(req.params.id);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
