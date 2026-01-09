import express from 'express';
import Alumno from '../models/Alumno.js';
import Actividad from '../models/Actividad.js';
import Pago from '../models/Pago.js';
import Egreso from '../models/Egreso.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    // Contar alumnos activos
    const numAlumnos = await Alumno.countDocuments({ activo: true });
    
    // Contar actividades activas
    const numActividades = await Actividad.countDocuments({ activa: true });
    
    // Calcular ingresos totales
    const pagos = await Pago.find();
    const totalIngresos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    
    // Calcular egresos totales
    const egresos = await Egreso.find();
    const totalEgresos = egresos.reduce((sum, egreso) => sum + egreso.monto, 0);
    
    // Calcular monto disponible
    const montoDisponible = totalIngresos - totalEgresos;

    res.json({
      numAlumnos,
      numActividades,
      totalIngresos,
      totalEgresos,
      montoDisponible
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reporte de deudores por actividad
router.get('/deudores/:actividadId', async (req, res) => {
  try {
    const { actividadId } = req.params;
    
    // Obtener todos los alumnos activos
    const alumnos = await Alumno.find({ activo: true });
    
    // Obtener pagos de esta actividad
    const pagos = await Pago.find({ actividad: actividadId });
    const alumnosQuePagaron = pagos.map(p => p.alumno.toString());
    
    // Filtrar deudores
    const deudores = alumnos.filter(
      alumno => !alumnosQuePagaron.includes(alumno._id.toString())
    );

    res.json(deudores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener reporte general de deudores (todas las actividades)
router.get('/deudores', async (req, res) => {
  try {
    // Solo incluir actividades activas que requieren cuota
    const actividades = await Actividad.find({ activa: true, requiereCuota: { $ne: false } });
    const alumnos = await Alumno.find({ activo: true });
    
    const reporte = [];
    
    for (const actividad of actividades) {
      const pagos = await Pago.find({ actividad: actividad._id });
      
      // Calcular total recaudado para esta actividad
      const totalRecaudado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
      const totalEsperado = actividad.totalActividad || (actividad.cuotaIndividual * alumnos.length);
      const faltante = totalEsperado - totalRecaudado;
      
      const deudores = [];
      
      for (const alumno of alumnos) {
        // Sumar todos los pagos de este alumno para esta actividad
        const pagosAlumno = pagos.filter(p => p.alumno.toString() === alumno._id.toString());
        const totalPagado = pagosAlumno.reduce((sum, pago) => sum + pago.monto, 0);
        const deuda = actividad.cuotaIndividual - totalPagado;
        
        if (deuda > 0) {
          deudores.push({
            id: alumno._id,
            nombreCompleto: alumno.nombreCompleto,
            totalPagado: totalPagado,
            montoPendiente: deuda,
            porcentajePagado: Math.round((totalPagado / actividad.cuotaIndividual) * 100)
          });
        }
      }
      
      if (deudores.length > 0 || faltante > 0) {
        reporte.push({
          actividad: {
            id: actividad._id,
            nombre: actividad.nombre,
            cuotaIndividual: actividad.cuotaIndividual,
            totalActividad: totalEsperado,
            totalRecaudado: totalRecaudado,
            faltante: faltante,
            porcentajeCompletado: Math.round((totalRecaudado / totalEsperado) * 100),
            fechaMaximaPago: actividad.fechaMaximaPago
          },
          deudores: deudores,
          cantidadDeudores: deudores.length
        });
      }
    }

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
