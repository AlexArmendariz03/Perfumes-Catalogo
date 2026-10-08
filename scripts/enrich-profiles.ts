/**
 * Enriquecimiento único del catálogo para el asesor de perfumes.
 *
 * Pide a Claude la familia olfativa, notas, intensidad, ocasiones, rangos de
 * edad con más afinidad y temporada de cada perfume, y lo guarda en
 * data/perfume-profiles.json. Si se interrumpe, al volver a correrlo continúa
 * con los que faltan.
 *
 *   npm run enrich -- --limit 40   # prueba con 40 perfumes
 *   npm run enrich                 # todo el catálogo
 *
 * Requiere ANTHROPIC_API_KEY en .env.local.
 */

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { catalog } from '../data/catalog'
import { ProfileSchema, isRecommendable, type Profile } from '../data/advisor'

const OUT = path.resolve('data/perfume-profiles.json')
const MODEL = 'claude-haiku-5-5'
const CHUNK = 40
const CONCURRENCY = 4

const args = process.argv.slice(2)
const limitArg = args.indexOf('--limit')
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity

const SYSTEM = `Eres un perfumista que conoce el mercado de fragancias designer y árabes.
Para cada perfume de la lista devuelve su perfil olfativo según tu conocimiento.

- "conocido": true solo si conoces este perfume concreto (marca + nombre). Si no lo reconoces, pon false y llena el resto con tu mejor estimación a partir del nombre.
- "familias": de 1 a 3 familias olfativas principales, de la más a la menos dominante.
- "notas": de 3 a 5 notas principales en español (ej. "vainilla", "bergamota", "oud").
- "intensidad": proyección y duración típicas.
- "ocasiones": de 1 a 3 momentos en los que suele usarse.
- "edades": de 1 a 3 rangos de edad con más afinidad según tendencias de mercado (no es una regla).
- "temporada": cuándo luce más.
- "id": copia exactamente el id que se te dio.

Responde con un perfil por cada perfume de la lista, en el mismo orden.`

const BatchSchema = z.object({ perfiles: z.array(ProfileSchema) })

function load(): Record<string, Profile> {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'))
  } catch {
    return {}
  }
}

function save(profiles: Record<string, Profile>) {
  const sorted = Object.fromEntries(Object.entries(profiles).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 0).replace(/},"/g, '},\n"') + '\n')
}

async function main() {
  const client = new Anthropic()
  const profiles = load()
  const pending = catalog
    .filter((p) => isRecommendable(p) && !profiles[p.id])
    .slice(0, limit)

  const chunks: (typeof pending)[] = []
  for (let i = 0; i < pending.length; i += CHUNK) chunks.push(pending.slice(i, i + CHUNK))
  console.log(`Perfiles existentes: ${Object.keys(profiles).length} · por generar: ${pending.length} en ${chunks.length} solicitudes`)

  let done = 0
  let inputTokens = 0
  let outputTokens = 0

  async function runChunk(items: typeof pending) {
    const list = items
      .map((p) => `${p.id} | ${p.brand} | ${p.name} | ${p.type} | ${p.gender}`)
      .join('\n')
    const ids = new Set(items.map((p) => p.id))

    try {
      const res = await client.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        output_config: { effort: 'low', format: zodOutputFormat(BatchSchema) },
        messages: [{ role: 'user', content: `id | marca | nombre | concentración | género\n${list}` }],
      })
      inputTokens += res.usage.input_tokens
      outputTokens += res.usage.output_tokens

      if (res.stop_reason === 'refusal' || !res.parsed_output) {
        console.warn(`  bloque omitido (stop_reason: ${res.stop_reason})`)
        return
      }
      for (const prof of res.parsed_output.perfiles) {
        if (ids.has(prof.id)) profiles[prof.id] = prof
      }
      save(profiles)
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) throw err
      if (err instanceof Anthropic.RateLimitError) console.warn('  límite de solicitudes; vuelve a correr el script para continuar')
      else if (err instanceof Anthropic.APIError) console.warn(`  error ${err.status}: ${err.message}`)
      else throw err
    } finally {
      done++
      console.log(`  ${done}/${chunks.length} bloques`)
    }
  }

  // Varias solicitudes a la vez, sin pasar de CONCURRENCY
  const queue = [...chunks]
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) await runChunk(queue.shift()!)
    }),
  )

  const total = Object.keys(profiles).length
  const conocidos = Object.values(profiles).filter((p) => p.conocido).length
  console.log(`Listo: ${total} perfiles (${conocidos} reconocidos) · tokens entrada ${inputTokens}, salida ${outputTokens}`)
}

main().catch((err) => {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error('Falta ANTHROPIC_API_KEY válida en .env.local')
  } else {
    console.error(err)
  }
  process.exit(1)
})
