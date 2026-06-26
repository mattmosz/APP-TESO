/**
 * Cierre de año lectivo — condonación de deudores pendientes
 *
 * Inserta pagos con monto $0 y observación "EXENTO - cierre año lectivo"
 * para que los alumnos dejen de aparecer como deudores sin sumar al recaudado.
 *
 * INSTRUCCIONES (MongoDB Atlas):
 * 1. Atlas → tu cluster → "Browse Collections" → botón "_MONGOSH" (abajo)
 * 2. Selecciona la base de datos de la app (ej. tesoreria)
 * 3. Copia y pega este script completo, o ejecuta:
 *    mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net/NOMBRE_BD" --file scripts/cierre-ano-condonacion-deudores.mongodb.js
 *
 * IMPORTANTE:
 * - Ejecuta primero con DRY_RUN = true para revisar qué se insertaría
 * - Luego cambia DRY_RUN = false y vuelve a ejecutar
 * - El script es idempotente: no duplica registros de cierre
 */

const DRY_RUN = true;
const OBSERVACION = 'EXENTO - cierre año lectivo';
const now = new Date();

function esExento(pago) {
  return Boolean(
    pago.observaciones && pago.observaciones.toUpperCase().includes('EXENTO')
  );
}

function yaTieneCierre(pagosAlumno) {
  return pagosAlumno.some(
    (p) => p.observaciones && p.observaciones.toLowerCase().includes('cierre año lectivo')
  );
}

const alumnos = db.alumnos.find({ activo: true }).toArray();
const actividades = db.actividades
  .find({ activa: true, requiereCuota: { $ne: false } })
  .toArray();

let insertados = 0;
let omitidosExento = 0;
let omitidosCierre = 0;
let omitidosAlDia = 0;
const pendientes = [];

for (const actividad of actividades) {
  const pagos = db.pagos.find({ actividad: actividad._id }).toArray();

  for (const alumno of alumnos) {
    const pagosAlumno = pagos.filter(
      (p) => p.alumno.toString() === alumno._id.toString()
    );

    if (pagosAlumno.some(esExento)) {
      omitidosExento++;
      continue;
    }

    if (yaTieneCierre(pagosAlumno)) {
      omitidosCierre++;
      continue;
    }

    const totalPagado = pagosAlumno.reduce((sum, p) => sum + p.monto, 0);
    const deuda = actividad.cuotaIndividual - totalPagado;

    if (deuda <= 0) {
      omitidosAlDia++;
      continue;
    }

    const registro = {
      alumno: alumno._id,
      actividad: actividad._id,
      monto: 0,
      fechaPago: now,
      observaciones: OBSERVACION,
      createdAt: now,
      updatedAt: now,
    };

    pendientes.push({
      alumno: alumno.nombreCompleto,
      actividad: actividad.nombre,
      deuda,
    });

    if (!DRY_RUN) {
      db.pagos.insertOne(registro);
    }
    insertados++;
  }
}

print('=== Cierre de año lectivo — condonación de deudores ===');
print(`Modo: ${DRY_RUN ? 'DRY RUN (sin escritura)' : 'EJECUCIÓN REAL'}`);
print(`Alumnos activos: ${alumnos.length}`);
print(`Actividades con cuota activas: ${actividades.length}`);
print('---');
print(`Registros a insertar / insertados: ${insertados}`);
print(`Omitidos (ya exentos): ${omitidosExento}`);
print(`Omitidos (ya tenían cierre): ${omitidosCierre}`);
print(`Omitidos (al día, sin deuda): ${omitidosAlDia}`);

if (pendientes.length > 0 && pendientes.length <= 50) {
  print('--- Detalle ---');
  pendientes.forEach((p) => {
    print(`  ${p.alumno} | ${p.actividad} | deuda: $${p.deuda.toFixed(2)}`);
  });
} else if (pendientes.length > 50) {
  print(`--- Detalle (primeros 50 de ${pendientes.length}) ---`);
  pendientes.slice(0, 50).forEach((p) => {
    print(`  ${p.alumno} | ${p.actividad} | deuda: $${p.deuda.toFixed(2)}`);
  });
}

if (DRY_RUN && insertados > 0) {
  print('');
  print('Para aplicar los cambios, edita el script y cambia DRY_RUN = false');
}
