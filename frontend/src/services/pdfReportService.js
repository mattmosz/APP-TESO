import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-BO');
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('es-BO');
}

export function generateInformePDF(informe) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { resumen, actividades } = informe;

  doc.setFontSize(18);
  doc.text('Informe de Tesorería — 8vo C', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Año lectivo: ${resumen.anioLectivo}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Generado: ${formatDateTime(resumen.fechaGeneracion)}`, pageWidth / 2, 35, {
    align: 'center',
  });

  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text('Resumen General', 14, 48);

  autoTable(doc, {
    startY: 52,
    head: [['Concepto', 'Valor']],
    body: [
      ['Monto disponible', formatMoney(resumen.montoDisponible)],
      ['Total alumnos activos', resumen.numAlumnos.toString()],
      ['Total actividades', resumen.numActividades.toString()],
      ['Total ingresos', formatMoney(resumen.totalIngresos)],
      ['Total egresos', formatMoney(resumen.totalEgresos)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255] },
    margin: { left: 14, right: 14 },
  });

  const afterResumen = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text('Detalle de Actividades (orden cronológico)', 14, afterResumen);

  const actividadesBody = actividades.map((a) => [
    formatDate(a.fecha),
    a.nombre,
    a.requiereCuota ? formatMoney(a.cuotaIndividual) : 'N/A',
    formatMoney(a.totalRecaudado),
    formatMoney(a.totalEgresos),
    formatMoney(a.balance),
  ]);

  autoTable(doc, {
    startY: afterResumen + 4,
    head: [['Fecha', 'Actividad', 'Cuota', 'Recaudado', 'Egresos', 'Balance']],
    body: actividadesBody.length > 0 ? actividadesBody : [['—', 'Sin actividades registradas', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fecha = new Date().toISOString().slice(0, 10);
  doc.save(`informe-tesoreria-8voC-${fecha}.pdf`);
}
