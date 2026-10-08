/**
 * names.ts — limpieza de nombres y corrección de concentración / género.
 *
 * Los nombres de Arome traen de todo: "Perfume Acqua Di Gio Profondo para Hombre
 * de Giorgio Armani EDP 100ML". En la tarjeta la marca, el género, la
 * concentración y el tamaño ya se muestran aparte, así que el nombre queda en
 * "Acqua Di Gio Profondo".
 */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

// Formas en que la marca aparece en los nombres: "Dolce & Gabbana" / "Dolce Gabbana",
// "Montblanc" / "Mont Blanc", "Thierry Mugler" / "Mugler", "Christian Dior" / "Dior"
function brandPatterns(brand: string): string[] {
  const b = fold(brand).replace(/[^A-Za-z0-9& ]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = b.split(' ')
  const alts = new Set([b, b.replace(/\s*&\s*/g, ' '), b.replace(/\s+/g, '')])
  if (words.length > 1) {
    alts.add(words[words.length - 1])
    alts.add(words.slice(0, -1).join(' '))
  }
  return Array.from(alts)
    .filter((a) => a.length > 2)
    .sort((a, c) => c.length - a.length)
    .map((a) => escapeRegExp(a).replace(/\s+|&/g, '[\\s&-]*'))
}

export function cleanName(name: string, brand: string): string {
  const isSet = /^(mini\s+)?(set|paquete|bundle)\b/i.test(name)
  const pats = brandPatterns(brand)
  let n = ' ' + fold(name).replace(/\s+/g, ' ') + ' '

  n = n
    .replace(/^\s*perfume(\s+perfume)?\b/i, ' ')
    .replace(/\b(mini|vial)\s+perfume\b/gi, '$1')
    .replace(/\s+\|.*$/, ' ')
    .replace(/\b(?:para|pour|for)\s+(?:dama|hombre|mujer)\s+y\s+(?:caballero|mujer|hombre)\b/gi, ' ')
    .replace(/\b(?:edt|edp|edc)(?=\d)/gi, ' ')
    .replace(/\b(?:para|pour|for)\s+(?:hombre|mujer|caballero|dama|ninos?|ninas?|unisex|men|women|him|her)\b/gi, ' ')
    .replace(/\bunisex\b/gi, ' ')
  for (const p of pats) {
    n = n.replace(new RegExp(`\\b(?:de|by)\\s+${p}(?:\\s+paris)?\\b`, 'gi'), ' ')
  }
  n = n
    .replace(/\beau\s+de\s+(?:toil+et+e|parfum|cologne)\b/gi, ' ')
    .replace(/\b(?:edt|edp|edc)\b/gi, ' ')
    .replace(/\bextrait(?:\s+de\s+parfum)?\b/gi, ' ')
  if (!isSet) {
    n = n
      .replace(/\(?\s*\d+(?:[.,]\d+)?\s*(?:ml|oz|g)\b(?:\s*(?:,|y|\+)\s*\d+(?:[.,]\d+)?\s*(?:ml|oz|g)\b)*\s*\)?/gi, ' ')
      .replace(/\s\d\.\d\s*$/, ' ')
      // "… Parfum" al final es la concentración, salvo en nombres como "Le Beau Le Parfum"
      .replace(/(\ble\s+)?\bparfum\s*$/i, (m, le) => (le ? m : ' '))
      .replace(/\boriginal\s*$/i, ' ')
      .replace(/\s+perfume\s*$/i, ' ')
  }
  n = n
    .replace(/\s+,/g, ',')
    .replace(/\s+(?:de|y)\s*$/i, ' ')
    .replace(/\s+[-–,]\s*$/, ' ')
    .replace(/^\s*[-–,]\s*/, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Marca repetida al inicio: "Versace Eros Energy" → "Eros Energy"
  if (!isSet) {
    for (const p of pats) {
      const m = n.match(new RegExp(`^${p}\\s+(.+)$`, 'i'))
      if (m && m[1].length > 2 && !/^[&+]/.test(m[1])) {
        n = m[1]
        break
      }
    }
  }

  // Recupera acentos del original ("Acqua di Giò") cuando el texto coincide
  const idx = fold(name).toLowerCase().indexOf(n.toLowerCase())
  if (idx >= 0) n = name.slice(idx, idx + n.length)
  if (!n) n = brand
  return n.charAt(0).toUpperCase() + n.slice(1)
}

// Concentración escrita en el nombre; manda sobre el dato de la tienda, que a veces viene mal
export function typeFromName(name: string): string | null {
  const n = name.toLowerCase()
  if (/eau de toil|\bedt\b/.test(n)) return 'EDT'
  if (/eau de parfum|\bedp\b/.test(n)) return 'EDP'
  if (/\bedc\b|eau de cologne/.test(n)) return 'EDC'
  if (/extrait|\bparfum\b/.test(n)) return 'Parfum'
  return null
}

// Género escrito en el nombre ("Unisex", "para Hombre", "para Mujer")
export function genderFromName(name: string): string | null {
  const n = name.toLowerCase()
  if (/\bunisex\b/.test(n)) return 'Unisex'
  if (/\b(para|pour|for)\s+(hombre|caballero|men|him|homme)\b/.test(n)) return 'Hombre'
  if (/\b(para|pour|for)\s+(mujer|dama|women|her|femme)\b/.test(n)) return 'Mujer'
  return null
}
