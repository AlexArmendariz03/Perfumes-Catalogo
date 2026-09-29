/**
 * catalog.ts — punto de entrada único para el catálogo de perfumes.
 *
 * Feature flag NEXT_PUBLIC_USE_AROME:
 *   "true"  → catálogo Arome.mx (2600 productos, imágenes Shopify CDN)
 *   "false" → catálogo original (1307 productos, imágenes propias)
 *
 * Cambia el valor en .env.local y reinicia el servidor.
 */

import { perfumes as originalPerfumes, type Perfume } from './perfumes'
import { aromePerfumes, type AromePerfume } from './arome-perfumes'

const USE_AROME = process.env.NEXT_PUBLIC_USE_AROME === 'true'

// Normaliza AromePerfume al mismo shape que Perfume
function toUnified(p: AromePerfume): Perfume {
  // Quita el prefijo de marca del nombre si viene incluido (ej: "CALVIN KLEIN - Perfume X")
  const brandPrefix = p.brand.toUpperCase()
  const cleanName = p.name.toUpperCase().startsWith(brandPrefix)
    ? p.name.slice(p.brand.length).replace(/^\s*[-–]\s*/, '').trim()
    : p.name

  return {
    id: p.id,
    code: '',           // handle de Shopify no se muestra en tarjeta
    name: cleanName,
    brand: p.brand,
    description: p.description,
    category: p.category,
    gender: p.gender,
    type: p.type,
    oz: p.oz,
    ml: p.ml,
    sizes: p.sizes,
    image: p.image,
    featured: p.featured,
    stock: p.stock,
  }
}

export const catalog: Perfume[] = USE_AROME
  ? aromePerfumes.map(toUnified)
  : originalPerfumes

export const catalogSource: 'arome' | 'original' = USE_AROME ? 'arome' : 'original'

export type { Perfume }
