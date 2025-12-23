import express from 'express';
import Alumno from '../models/Alumno.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los alumnos
router.get('/', async (req, res) => {
  try {
    const alumnos = await Alumno.find().sort({ nombreCompleto: 1 });
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un alumno por ID
router.get('/:id', async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo alumno
router.post('/', adminOnly, async (req, res) => {
  try {
    const alumno = new Alumno(req.body);
    await alumno.save();
    res.status(201).json(alumno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar alumno
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const alumno = await Alumno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json(alumno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar alumno
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const alumno = await Alumno.findByIdAndDelete(req.params.id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json({ message: 'Alumno eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
