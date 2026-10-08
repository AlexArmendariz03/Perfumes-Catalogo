/**
 * advisor.ts — vocabulario y puntuación del asesor de perfumes.
 *
 * Los perfiles (familia olfativa, notas, intensidad…) se generan una vez con
 * `npm run enrich` y viven en data/perfume-profiles.json. Aquí se definen sus
 * valores posibles y cómo se cruzan con las respuestas del cuestionario.
 */

import { z } from 'zod'
import type { Perfume } from './catalog'

export const FAMILIAS = [
  'citrica', 'acuatica', 'verde', 'aromatica', 'floral', 'frutal', 'gourmand',
  'amaderada', 'fougere', 'chipre', 'cuero', 'oriental', 'especiada', 'oud', 'almizclada',
] as const
export const INTENSIDADES = ['ligera', 'moderada', 'intensa'] as const
export const OCASIONES = ['diario', 'oficina', 'noche', 'especial'] as const
export const EDADES = ['18-24', '25-34', '35-49', '50+'] as const
export const TEMPORADAS = ['calor', 'frio', 'todo-el-ano'] as const

export const ProfileSchema = z.object({
  id: z.string(),
  conocido: z.boolean(),
  familias: z.array(z.enum(FAMILIAS)),
  notas: z.array(z.string()),
  intensidad: z.enum(INTENSIDADES),
  ocasiones: z.array(z.enum(OCASIONES)),
  edades: z.array(z.enum(EDADES)),
  temporada: z.enum(TEMPORADAS),
})
export type Profile = z.infer<typeof ProfileSchema>

// ── Cuestionario ────────────────────────────────────────────────────────────

// Grupos de aromas que ve el cliente → familias del perfil
export const AROMAS = {
  fresco: ['citrica', 'acuatica', 'verde', 'aromatica'],
  dulce: ['gourmand', 'frutal'],
  floral: ['floral', 'almizclada'],
  amaderado: ['amaderada', 'fougere', 'cuero', 'chipre'],
  oriental: ['oriental', 'especiada', 'oud'],
} as const satisfies Record<string, readonly (typeof FAMILIAS)[number][]>

export const QuizSchema = z.object({
  para: z.enum(['mi', 'regalo']),
  genero: z.enum(['Hombre', 'Mujer', 'Cualquiera']),
  edad: z.enum(EDADES),
  aromas: z.array(z.enum(['fresco', 'dulce', 'floral', 'amaderado', 'oriental'])).max(2),
  ocasion: z.enum(OCASIONES),
  intensidad: z.enum(INTENSIDADES),
})
export type Quiz = z.infer<typeof QuizSchema>

// ── Selección ───────────────────────────────────────────────────────────────

// Solo perfumes completos: fuera sets, minis, viales, mists, desodorantes, cremas…
const NO_RECOMENDABLE =
  /^(mini\s+)?(set|paquete|bundle|vial)\b|^mini\b|\b(mist|body spray|desodorante|deodorant|crema|body lotion|after shave|roll-?on)\b/i

export function isRecommendable(p: Perfume): boolean {
  return !NO_RECOMENDABLE.test(p.name)
}

function genderMatches(p: Perfume, genero: Quiz['genero']): boolean {
  return genero === 'Cualquiera' || p.gender === genero || p.gender === 'Unisex'
}

export function scorePerfume(p: Perfume, profile: Profile, quiz: Quiz): number {
  let score = 0
  const wanted = new Set<string>(quiz.aromas.flatMap((a) => AROMAS[a]))
  const familyHits = profile.familias.filter((f) => wanted.has(f)).length
  if (familyHits > 0) score += 4 + (familyHits - 1) * 2

  if (profile.ocasiones.includes(quiz.ocasion)) score += 2
  const di = Math.abs(INTENSIDADES.indexOf(profile.intensidad) - INTENSIDADES.indexOf(quiz.intensidad))
  score += di === 0 ? 2 : di === 1 ? 0.5 : -1
  if (profile.edades.includes(quiz.edad)) score += 1.5
  if (p.sizes.length > 1) score += 0.25
  return score
}

export interface Candidate {
  perfume: Perfume
  profile: Profile
  score: number
}

// Mejores candidatos, con un máximo por marca para que haya variedad
export function pickCandidates(
  catalog: Perfume[],
  profiles: Record<string, Profile>,
  quiz: Quiz,
  limit = 30,
  perBrand = 2,
): Candidate[] {
  const scored = catalog
    .filter((p) => isRecommendable(p) && genderMatches(p, quiz.genero))
    .map((p) => ({ perfume: p, profile: profiles[p.id] }))
    .filter((c): c is { perfume: Perfume; profile: Profile } => !!c.profile && c.profile.conocido)
    .map((c) => ({ ...c, score: scorePerfume(c.perfume, c.profile, quiz) }))
    .sort((a, b) => b.score - a.score)

  const byBrand = new Map<string, number>()
  const out: Candidate[] = []
  for (const c of scored) {
    const n = byBrand.get(c.perfume.brand) ?? 0
    if (n >= perBrand) continue
    byBrand.set(c.perfume.brand, n + 1)
    out.push(c)
    if (out.length >= limit) break
  }
  return out
}

const FAMILIA_LABEL: Record<(typeof FAMILIAS)[number], string> = {
  citrica: 'cítrica', acuatica: 'acuática', verde: 'verde', aromatica: 'aromática',
  floral: 'floral', frutal: 'frutal', gourmand: 'dulce', amaderada: 'amaderada',
  fougere: 'fougère', chipre: 'chipre', cuero: 'de cuero', oriental: 'oriental',
  especiada: 'especiada', oud: 'de oud', almizclada: 'almizclada',
}

// Explicación de respaldo cuando no hay respuesta de la IA
export function fallbackReason(profile: Profile): string {
  const fam = profile.familias.slice(0, 2).map((f) => FAMILIA_LABEL[f]).join(' y ')
  const notas = profile.notas.slice(0, 3).join(', ')
  return `Fragancia ${fam}${notas ? `: ${notas}` : ''}.`
}
