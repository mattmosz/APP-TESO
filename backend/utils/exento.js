export function isPagoExento(pago) {
  return Boolean(
    pago.observaciones && pago.observaciones.toUpperCase().includes('EXENTO')
  );
}
