import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { catalog } from '@/data/catalog'
import { QuizSchema, pickCandidates, fallbackReason, type Profile, type Quiz, type Candidate } from '@/data/advisor'
import profilesJson from '@/data/perfume-profiles.json'

const profiles = profilesJson as Record<string, Profile>
const MODEL = 'claude-haiku-5-5'

// ── Límite de consultas por IP (en memoria: es por instancia, suficiente para frenar abusos) ──
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 15
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

const SYSTEM = `Eres el asesor de fragancias de Ararat Perfumes, una tienda en México que cotiza por WhatsApp.
Recibes las respuestas de un cliente y una lista de perfumes candidatos del catálogo con su perfil olfativo.
Elige los 5 que mejor le queden y explica cada elección en una frase corta (máximo 22 palabras), en español de México, cálida y concreta: menciona notas o el carácter del perfume y por qué encaja con lo que pidió.

Reglas:
- Usa solo ids de la lista de candidatos, sin repetir.
- Busca variedad: no elijas dos perfumes casi iguales.
- La edad es solo una referencia de gustos frecuentes; no la menciones como regla ni digas "según estudios".
- Si es un regalo, prioriza perfumes fáciles de llevar y que gusten a la mayoría.
- No menciones precios.`

const ResultSchema = z.object({
  recomendaciones: z.array(z.object({ id: z.string(), razon: z.string() })),
})

const LABELS = {
  para: { mi: 'para él/ella misma', regalo: 'es un regalo' },
  intensidad: { ligera: 'suave', moderada: 'media', intensa: 'que se note' },
} as const

function describeQuiz(q: Quiz): string {
  return [
    `Para: ${LABELS.para[q.para]}`,
    `Perfume de: ${q.genero === 'Cualquiera' ? 'sin preferencia (incluye unisex)' : q.genero}`,
    `Edad: ${q.edad}`,
    `Aromas que le gustan: ${q.aromas.length ? q.aromas.join(', ') : 'sin preferencia, sorpréndelo'}`,
    `Ocasión: ${q.ocasion}`,
    `Intensidad: ${LABELS.intensidad[q.intensidad]}`,
  ].join('\n')
}

function describeCandidates(cands: Candidate[]): string {
  return cands
    .map(({ perfume: p, profile: pr }) =>
      [p.id, p.brand, p.name, p.type, p.gender, pr.familias.join('/'), pr.notas.join(', '), pr.intensidad].join(' | '),
    )
    .join('\n')
}

async function chooseWithModel(quiz: Quiz, cands: Candidate[]) {
  if (!process.env.ANTHROPIC_API_KEY) return null
  const client = new Anthropic({ timeout: 20_000, maxRetries: 1 })
  try {
    const res = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: 'low', format: zodOutputFormat(ResultSchema) },
      messages: [
        {
          role: 'user',
          content: `Cliente:\n${describeQuiz(quiz)}\n\nCandidatos (id | marca | nombre | concentración | género | familias | notas | intensidad):\n${describeCandidates(cands)}`,
        },
      ],
    })
    if (res.stop_reason === 'refusal' || !res.parsed_output) return null
    return res.parsed_output.recomendaciones
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`[asesor] error ${err.status}: ${err.message}`)
      return null
    }
    throw err
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas consultas. Intenta de nuevo en unos minutos.' }, { status: 429 })
  }

  const parsed = QuizSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Respuestas inválidas' }, { status: 400 })
  }
  const quiz = parsed.data

  if (Object.keys(profiles).length === 0) {
    return NextResponse.json({ error: 'El asesor todavía no está listo.' }, { status: 503 })
  }

  const cands = pickCandidates(catalog, profiles, quiz)
  if (cands.length === 0) {
    return NextResponse.json({ recomendaciones: [] })
  }

  // La IA elige y explica; si falla, se usan los 5 mejores por puntaje
  const byId = new Map(cands.map((c) => [c.perfume.id, c]))
  const chosen: { perfume: Candidate['perfume']; razon: string }[] = []
  const seen = new Set<string>()

  for (const r of (await chooseWithModel(quiz, cands)) ?? []) {
    const c = byId.get(r.id)
    if (!c || seen.has(r.id) || chosen.length >= 5) continue
    seen.add(r.id)
    chosen.push({ perfume: c.perfume, razon: r.razon.trim() })
  }
  for (const c of cands) {
    if (chosen.length >= 5) break
    if (seen.has(c.perfume.id)) continue
    seen.add(c.perfume.id)
    chosen.push({ perfume: c.perfume, razon: fallbackReason(c.profile) })
  }

  return NextResponse.json({ recomendaciones: chosen })
}
