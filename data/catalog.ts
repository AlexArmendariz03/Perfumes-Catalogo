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
import { cleanName, typeFromName, genderFromName } from './names'

const USE_AROME = process.env.NEXT_PUBLIC_USE_AROME === 'true'

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const brandKey = (s: string) => stripAccents(s).replace(/[^a-z0-9&]+/g, ' ').trim()

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

// Algunos productos de Arome traen el nombre de la tienda como marca
const isStoreBrand = (b: string) => /^arome m[eé]xico$/i.test(b.trim())

// Marcas reales del catálogo, para reconocerlas dentro del nombre
const knownBrands = new Map<string, string>()
for (const p of aromePerfumes) {
  if (p.brand.trim() && !isStoreBrand(p.brand)) knownBrands.set(brandKey(p.brand), p.brand.trim())
}
const brandKeysLongestFirst = Array.from(knownBrands.keys()).sort((a, b) => b.length - a.length)

// Deduce la marca real desde el nombre cuando viene como "Arome México".
// Devuelve null si no hay marca → no es perfume (mochilas, gel, etc.)
function resolveBrand(p: AromePerfume): string | null {
  if (!isStoreBrand(p.brand)) return p.brand

  // "VERSACE - Eros ..." / "ARMANI - ..."
  const prefix = p.name.match(/^([^-–]{2,40}?)\s*[-–]\s*/)
  if (prefix) {
    const k = brandKey(prefix[1])
    if (knownBrands.has(k)) return knownBrands.get(k)!
    const partial = brandKeysLongestFirst.find((b) => ` ${b} `.includes(` ${k} `))
    if (partial) return knownBrands.get(partial)!
  }

  // Marca conocida en cualquier parte del nombre ("Versace Eros Energy ...")
  const name = ` ${brandKey(p.name)} `
  const hit = brandKeysLongestFirst.find((b) => b.length > 2 && name.includes(` ${b} `))
  if (hit) return knownBrands.get(hit)!

  // Marca nueva: "... de Le Chameau EDP 100ML" o "PRETTY PINK - ..."
  const deBrand = p.name.match(/\bde\s+([A-ZÀ-Ý][\wÀ-ÿ&.' ]+?)\s+(?:EDP|EDT|EDC|Eau|Extrait|\d)/i)
  if (deBrand) return deBrand[1].trim()
  if (prefix && prefix[1] === prefix[1].toUpperCase()) return titleCase(prefix[1].trim())

  return null
}

// Normaliza AromePerfume al mismo shape que Perfume (null = no es perfume)
function toUnified(p: AromePerfume): Perfume | null {
  const brand = resolveBrand(p)
  if (!brand) return null

  // Quita el prefijo de marca del nombre si viene incluido
  // ej: "CALVIN KLEIN - Perfume X", "ARMANI - Acqua Di Gio", "Versace Eros Energy"
  let cleanName = p.name.replace(/^[A-ZÀ-Ý0-9&.' ]{2,40}\s*[-–]\s*/, '')
  if (cleanName.toUpperCase().startsWith(brand.toUpperCase() + ' ')) {
    cleanName = cleanName.slice(brand.length)
  }
  cleanName = cleanName.trim()

  return {
    id: p.id.replace(/^arome_/, ''),  // sin prefijo: el id aparece en el enlace de WhatsApp
    code: '',           // handle de Shopify no se muestra en tarjeta
    name: cleanName,
    brand,
    description: p.description,
    category: p.category,
    gender: genderFromName(p.name) ?? p.gender,
    type: typeFromName(p.name) ?? p.type,
    oz: p.oz,
    ml: p.ml,
    sizes: p.sizes,
    image: p.image,
    featured: p.featured,
    stock: p.stock,
  }
}

// Clave para agrupar presentaciones del mismo perfume (100ml, 175ml, ...).
// Ignora tamaño, concentración escrita en el nombre, género y marca repetida,
// pero sí distingue por marca + género + tipo (EDT ≠ EDP).
// ej. "Perfume Lacoste Blanc L.12.12 para Hombre de Lacoste EDT 175ML"
//   y "LACOSTE - Lacoste Blanc L.12.12 para Hombre EDT 100ML" → "blanc l.12.12"
function groupKey(p: Perfume): string {
  const brand = stripAccents(p.brand).trim()
  const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const name = (' ' + stripAccents(p.name) + ' ')
    .replace(/\d+(?:[.,]\d+)?\s*(?:ml|oz|fl\.?\s*oz)\b/g, ' ')
    .replace(/\b(?:edt|edp|edc|eau de (?:toilette|parfum|cologne)|parfum|extrait(?: de parfum)?)\s*(?=\d|\b)/g, ' ')
    .replace(/\s\d+(?:\.\d+)?\s*$/g, ' ')
    .replace(/\b(?:para|pour)\s+(?:hombre|mujer|caballero|dama|unisex)\b/g, ' ')
    .replace(/\b(?:hombre|mujer|caballero|dama|unisex)\b/g, ' ')
    .replace(new RegExp(`\\bde\\s+${esc}\\b`, 'g'), ' ')
    .replace(new RegExp(`\\b${esc}\\b`, 'g'), ' ')
    .replace(/^\s*perfume\b/, ' ')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()
  return [brand, stripAccents(p.gender), stripAccents(p.type), name].join('|')
}

// Une los productos que son el mismo perfume en distinto tamaño en una sola
// tarjeta; cada tamaño conserva su propia foto. Duplicados del mismo ml se descartan.
function groupVariants(list: Perfume[]): Perfume[] {
  const groups = new Map<string, Perfume[]>()
  for (const p of list) {
    const key = groupKey(p)
    const g = groups.get(key)
    if (g) g.push(p)
    else groups.set(key, [p])
  }

  return Array.from(groups.values()).map((items) => {
    const sizes = new Map<number, Perfume['sizes'][number]>()
    for (const p of items) {
      for (const s of p.sizes) {
        if (!sizes.has(s.ml)) sizes.set(s.ml, { ...s, image: s.image || p.image })
      }
    }
    if (sizes.size <= 1) return items[0]

    const sorted = Array.from(sizes.values()).sort((a, b) => a.ml - b.ml)
    const base = items[0]
    return {
      ...base,
      // Quita el tamaño del nombre ("... EDT 175ML" → "... EDT")
      name: base.name.replace(/\s*\d+(?:[.,]\d+)?\s*ml\b/gi, '').trim(),
      ml: sorted[0].ml,
      sizes: sorted,
      image: sorted[0].image || base.image,
      featured: items.some((p) => p.featured),
      stock: items.reduce((acc, p) => acc + p.stock, 0),
    }
  })
}

// Accesorios que no son fragancia (maletas, neceseres, cosmetiqueras, etc.)
const NOT_PERFUME = /\bmaquillaje\b|\bcosmetiquera\b|\bneceser\b|\bmaleta\b|\batomizador\b/i

// Ocultos de momento — comenta o borra la línea para volver a mostrarlos
const HIDDEN: ((p: Perfume) => boolean)[] = [
  (p) => /^cartier$/i.test(p.brand.trim()),
  (p) => /^tom ?ford$/i.test(p.brand.trim()),
  (p) => /\bsauvage\b/i.test(p.name),   // Dior Sauvage (todas sus versiones)
]

export const catalog: Perfume[] = groupVariants(
  (USE_AROME
    ? aromePerfumes.map(toUnified).filter((p): p is Perfume => p !== null)
    : originalPerfumes)
    .filter((p) => !p.name.toLowerCase().includes('tester') && !NOT_PERFUME.test(p.name))
    .filter((p) => !HIDDEN.some((hide) => hide(p)))
).map((p) => ({ ...p, name: cleanName(p.name, p.brand) }))

export const catalogSource: 'arome' | 'original' = USE_AROME ? 'arome' : 'original'

export type { Perfume }
