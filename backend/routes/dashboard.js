import express from 'express';
import Alumno from '../models/Alumno.js';
import Actividad from '../models/Actividad.js';
import Pago from '../models/Pago.js';
import Egreso from '../models/Egreso.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isPagoExento } from '../utils/exento.js';

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
      
      // Contar alumnos exentos para esta actividad
      const alumnosExentos = new Set();
      pagos.forEach(p => {
        if (isPagoExento(p)) {
          alumnosExentos.add(p.alumno.toString());
        }
      });
      
      // Calcular total recaudado (excluyendo pagos exentos que son $0)
      const totalRecaudado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
      
      // Total esperado = cuota × (alumnos activos - alumnos exentos)
      const alumnosQueDebenPagar = alumnos.length - alumnosExentos.size;
      const totalEsperado = actividad.cuotaIndividual * alumnosQueDebenPagar;
      const faltante = totalEsperado - totalRecaudado;
      
      const deudores = [];
      
      for (const alumno of alumnos) {
        // Sumar todos los pagos de este alumno para esta actividad
        const pagosAlumno = pagos.filter(p => p.alumno.toString() === alumno._id.toString());
        
        const esExento = pagosAlumno.some(isPagoExento);
        
        // Si es exento, no es deudor
        if (esExento) continue;
        
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
      
      if (deudores.length > 0) {
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

// Informe anual consolidado para exportación PDF (solo tesorera/admin)
router.get('/informe-anual', adminOnly, async (req, res) => {
  try {
    const alumnos = await Alumno.find({ activo: true });
    const actividades = await Actividad.find().sort({ fecha: 1 });
    const todosPagos = await Pago.find();
    const egresosDetalle = await Egreso.find()
      .populate('actividad', 'nombre')
      .sort({ fecha: 1 });

    const totalIngresos = todosPagos.reduce((sum, p) => sum + p.monto, 0);
    const totalEgresos = egresosDetalle.reduce((sum, e) => sum + e.monto, 0);

    let anioLectivo = new Date().getFullYear().toString();
    if (actividades.length > 0) {
      const firstYear = new Date(actividades[0].fecha).getFullYear();
      const lastYear = new Date(actividades[actividades.length - 1].fecha).getFullYear();
      anioLectivo = firstYear === lastYear ? `${firstYear}` : `${firstYear}-${lastYear}`;
    }

    const actividadesDetalle = actividades.map((actividad) => {
      const pagos = todosPagos.filter(
        (p) => p.actividad.toString() === actividad._id.toString()
      );
      const egresos = egresosDetalle.filter(
        (e) => e.actividad && e.actividad._id.toString() === actividad._id.toString()
      );

      const alumnosExentos = new Set();
      pagos.forEach((p) => {
        if (isPagoExento(p)) {
          alumnosExentos.add(p.alumno.toString());
        }
      });

      const totalRecaudado = pagos.reduce((sum, p) => sum + p.monto, 0);
      const totalEgresosActividad = egresos.reduce((sum, e) => sum + e.monto, 0);

      const requiereCuota = actividad.requiereCuota !== false;
      const totalEsperado = requiereCuota
        ? actividad.cuotaIndividual * (alumnos.length - alumnosExentos.size)
        : actividad.totalActividad;

      const cantidadPagos = new Set(
        pagos.filter((p) => p.monto > 0).map((p) => p.alumno.toString())
      ).size;

      return {
        nombre: actividad.nombre,
        fecha: actividad.fecha,
        cuotaIndividual: actividad.cuotaIndividual,
        requiereCuota,
        totalEsperado,
        totalRecaudado,
        totalEgresos: totalEgresosActividad,
        balance: totalRecaudado - totalEgresosActividad,
        cantidadPagos,
        activa: actividad.activa,
      };
    });

    const egresos = egresosDetalle.map((e) => ({
      nombre: e.nombre,
      monto: e.monto,
      fecha: e.fecha,
      actividadNombre: e.actividad?.nombre ?? null,
      descripcion: e.descripcion || '',
    }));

    res.json({
      resumen: {
        numAlumnos: alumnos.length,
        numActividades: actividades.length,
        totalIngresos,
        totalEgresos,
        montoDisponible: totalIngresos - totalEgresos,
        anioLectivo,
        fechaGeneracion: new Date().toISOString(),
      },
      actividades: actividadesDetalle,
      egresos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
