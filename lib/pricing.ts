/**
 * Calcula el precio de venta en MXN a partir del costo en USD.
 * Formula: precio_mxn = costo_usd × 2 × tipo_de_cambio
 * El tipo de cambio se configura en .env.local → NEXT_PUBLIC_EXCHANGE_RATE
 */

export const EXCHANGE_RATE = parseFloat(
  process.env.NEXT_PUBLIC_EXCHANGE_RATE ?? '17.5'
)

export function calcPrecioMXN(costoUSD: number): number {
  return costoUSD * 2 * EXCHANGE_RATE
}

export function formatPrecio(costoUSD: number): string {
  return calcPrecioMXN(costoUSD).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
