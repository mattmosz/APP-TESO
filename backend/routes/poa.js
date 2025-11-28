import express from 'express';
import POA from '../models/POA.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener el POA actual
router.get('/', async (req, res) => {
  try {
    // Solo debe haber un POA, obtener el más reciente
    const poa = await POA.findOne().sort({ fechaCarga: -1 });
    
    if (!poa) {
      return res.status(404).json({ error: 'No hay POA cargado' });
    }
    
    res.json(poa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir o reemplazar POA
router.post('/', async (req, res) => {
  try {
    // Eliminar POA anterior si existe
    await POA.deleteMany({});
    
    // Crear nuevo POA
    const poa = new POA(req.body);
    await poa.save();
    
    res.status(201).json(poa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar POA
router.delete('/', async (req, res) => {
  try {
    await POA.deleteMany({});
    res.json({ message: 'POA eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
