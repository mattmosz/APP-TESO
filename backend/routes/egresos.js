import express from 'express';
import Egreso from '../models/Egreso.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los egresos
router.get('/', async (req, res) => {
  try {
    const egresos = await Egreso.find()
      .populate('actividad', 'nombre')
      .sort({ fecha: -1 });
    res.json(egresos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un egreso por ID
router.get('/:id', async (req, res) => {
  try {
    const egreso = await Egreso.findById(req.params.id)
      .populate('actividad', 'nombre');
    if (!egreso) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }
    res.json(egreso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo egreso
router.post('/', async (req, res) => {
  try {
    const egreso = new Egreso(req.body);
    await egreso.save();
    await egreso.populate('actividad', 'nombre');
    res.status(201).json(egreso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar egreso
router.put('/:id', async (req, res) => {
  try {
    const egreso = await Egreso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('actividad', 'nombre');
    
    if (!egreso) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }
    res.json(egreso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar egreso
router.delete('/:id', async (req, res) => {
  try {
    const egreso = await Egreso.findByIdAndDelete(req.params.id);
    if (!egreso) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }
    res.json({ message: 'Egreso eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
