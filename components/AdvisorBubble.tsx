'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Perfume } from '@/data/catalog'
import type { Quiz } from '@/data/advisor'
import { useCartStore, getSingleProductWhatsApp } from '@/store/cartStore'

type Draft = { [K in keyof Quiz]: Quiz[K] | null }

interface Recommendation {
  perfume: Perfume
  razon: string
}

type Step =
  | { key: Exclude<keyof Quiz, 'aromas'>; question: string; options: { value: string; label: string }[] }
  | { key: 'aromas'; question: string; options: { value: Quiz['aromas'][number]; label: string }[] }

const STEPS: Step[] = [
  { key: 'para', question: '¡Hola! ¿El perfume es para ti o es un regalo?', options: [
    { value: 'mi', label: 'Para mí' },
    { value: 'regalo', label: 'Es un regalo' },
  ] },
  { key: 'genero', question: '¿Lo buscas de hombre, de mujer o te da igual?', options: [
    { value: 'Hombre', label: 'Hombre' },
    { value: 'Mujer', label: 'Mujer' },
    { value: 'Cualquiera', label: 'Me da igual' },
  ] },
  { key: 'edad', question: '¿En qué rango de edad está quien lo va a usar?', options: [
    { value: '18-24', label: '18–24' },
    { value: '25-34', label: '25–34' },
    { value: '35-49', label: '35–49' },
    { value: '50+', label: '50+' },
  ] },
  { key: 'aromas', question: '¿Qué aromas le gustan? Elige hasta 2.', options: [
    { value: 'fresco', label: 'Fresco · cítricos, acuáticos' },
    { value: 'dulce', label: 'Dulce · vainilla, frutas' },
    { value: 'floral', label: 'Floral · flores, almizcle' },
    { value: 'amaderado', label: 'Amaderado · maderas, cuero' },
    { value: 'oriental', label: 'Oriental · especias, ámbar, oud' },
  ] },
  { key: 'ocasion', question: '¿Cuándo lo va a usar más?', options: [
    { value: 'diario', label: 'Diario' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'noche', label: 'Noche' },
    { value: 'especial', label: 'Ocasión especial' },
  ] },
  { key: 'intensidad', question: 'Por último, ¿qué tan intenso lo quieres?', options: [
    { value: 'ligera', label: 'Suave' },
    { value: 'moderada', label: 'Media' },
    { value: 'intensa', label: 'Que se note' },
  ] },
]

const EMPTY: Draft = { para: null, genero: null, edad: null, aromas: [], ocasion: null, intensidad: null }
const TEASER_KEY = 'ararat-asesor-teaser'

function chip(active: boolean) {
  return `min-h-11 px-4 py-2 rounded-full border text-left text-sm font-inter transition-all duration-300 ${
    active ? 'bg-gold text-onyx border-gold shadow-gold font-medium' : 'border-gold/30 text-cream/80 hover:border-gold/60 hover:text-gold'
  }`
}

function BottleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9.5" y="2.5" width="5" height="3.5" rx="0.6" />
      <path d="M10.5 6h3v2.5h-3z" />
      <rect x="5" y="8.5" width="14" height="13" rx="2.5" />
      <path d="M12 12.5l.9 1.8 1.9.3-1.4 1.3.3 1.9-1.7-.9-1.7.9.3-1.9-1.4-1.3 1.9-.3z" />
    </svg>
  )
}

// Resultado compacto para el panel: foto, nombre, tamaños, motivo y acciones
function ResultRow({ rec }: { rec: Recommendation }) {
  const { perfume, razon } = rec
  const [ml, setMl] = useState(perfume.sizes[0].ml)
  const { addItem } = useCartStore()
  const size = perfume.sizes.find((s) => s.ml === ml) || perfume.sizes[0]
  const href = `/p/${encodeURIComponent(perfume.id)}?ml=${ml}`

  return (
    <li className="glass-card rounded-xl p-3 flex gap-3">
      <Link href={href} className="relative w-20 h-20 shrink-0 bg-white rounded-lg overflow-hidden" aria-label={`Ver ${perfume.brand} ${perfume.name}`}>
        <Image src={size.image || perfume.image} alt="" fill className="object-contain p-1.5" sizes="80px" />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gold">{perfume.brand}</span>
        <Link href={href} className="font-playfair text-[17px] font-semibold leading-tight text-cream hover:text-gold transition-colors">{perfume.name}</Link>
        <p className="text-xs font-inter leading-relaxed text-cream/60">{razon}</p>
        <div role="group" aria-label="Presentación" className="flex flex-wrap gap-1.5 pt-1">
          {perfume.sizes.map((s) => (
            <button
              key={s.ml}
              type="button"
              aria-pressed={s.ml === ml}
              onClick={() => setMl(s.ml)}
              className={`h-8 px-2.5 rounded-lg font-inter text-[11px] font-medium border transition-all ${
                s.ml === ml ? 'bg-gold/15 border-gold/60 text-gold' : 'bg-white/[0.04] border-white/10 text-cream/50 hover:text-cream'
              }`}
            >
              {s.ml} ml
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => addItem(perfume, ml)}
            className="h-10 px-4 rounded-xl bg-gold/10 border border-gold/35 text-gold text-xs font-inter font-semibold hover:bg-gold/20 transition-all"
          >
            Añadir a cotización
          </button>
          <button
            type="button"
            onClick={() => window.open(getSingleProductWhatsApp(perfume, ml), '_blank', 'noopener,noreferrer')}
            aria-label={`Preguntar por ${perfume.name} en WhatsApp`}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}

export default function AdvisorBubble() {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [status, setStatus] = useState<'quiz' | 'loading' | 'done' | 'error'>('quiz')
  const [error, setError] = useState('')
  const [results, setResults] = useState<Recommendation[]>([])

  // Globo de invitación a los pocos segundos, una vez por sesión
  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(TEASER_KEY) === '1' } catch {}
    if (seen) return
    const t = setTimeout(() => setTeaser(true), 4000)
    return () => clearTimeout(t)
  }, [])

  const dismissTeaser = () => {
    setTeaser(false)
    try { sessionStorage.setItem(TEASER_KEY, '1') } catch {}
  }

  const openPanel = () => {
    dismissTeaser()
    setOpen(true)
  }

  const reset = () => {
    setDraft(EMPTY)
    setStep(0)
    setResults([])
    setStatus('quiz')
  }

  async function submit(final: Draft) {
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(final),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No pudimos generar tus opciones.')
      setResults(data.recomendaciones)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos generar tus opciones.')
      setStatus('error')
    }
  }

  const choose = (key: Exclude<keyof Quiz, 'aromas'>, value: string) => {
    const next = { ...draft, [key]: value } as Draft
    setDraft(next)
    if (step === STEPS.length - 1) submit(next)
    else setStep(step + 1)
  }

  const toggleAroma = (value: Quiz['aromas'][number]) =>
    setDraft((d) => {
      const list = d.aromas ?? []
      return { ...d, aromas: list.includes(value) ? list.filter((a) => a !== value) : [...list, value].slice(-2) }
    })

  const current = STEPS[step]

  return (
    <div className="fixed bottom-6 left-6 z-50 font-inter">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Asesor de fragancias"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom left' }}
            className="fixed left-3 right-3 bottom-24 sm:left-6 sm:right-auto sm:w-[400px] max-h-[min(640px,calc(100vh-8rem))] flex flex-col rounded-2xl bg-[#111111] border border-gold/20 shadow-[0_24px_80px_rgba(0,0,0,0.6),0_4px_20px_rgba(201,168,76,0.15)] overflow-hidden"
          >
            <header className="flex items-center justify-between gap-3 px-5 py-4 bg-onyx border-b border-gold/20">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full border border-gold/40 bg-gold/10 text-gold flex items-center justify-center">
                  <BottleIcon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-playfair text-base font-semibold leading-none text-cream">Asesor de fragancias</p>
                  <p className="text-[10px] tracking-[3px] uppercase text-gold/80 mt-1.5">
                    {status === 'quiz' ? `Pregunta ${step + 1} de ${STEPS.length}` : status === 'done' ? 'Tus 5 opciones' : 'Ararat Perfumes'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar asesor" className="w-10 h-10 flex items-center justify-center rounded-full text-gold hover:bg-gold/10 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5" aria-live="polite">
              {status === 'quiz' && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col gap-4"
                  >
                    <p className="self-start max-w-[90%] rounded-2xl rounded-bl-sm bg-gold/10 border border-gold/20 px-4 py-3 text-sm leading-relaxed text-cream">
                      {current.question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {current.key === 'aromas'
                        ? current.options.map((o) => {
                            const active = (draft.aromas ?? []).includes(o.value)
                            return (
                              <button key={o.value} type="button" aria-pressed={active} onClick={() => toggleAroma(o.value)} className={chip(active)}>
                                {o.label}
                              </button>
                            )
                          })
                        : current.options.map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              aria-pressed={draft[current.key] === o.value}
                              onClick={() => choose(current.key as Exclude<keyof Quiz, 'aromas'>, o.value)}
                              className={chip(draft[current.key] === o.value)}
                            >
                              {o.label}
                            </button>
                          ))}
                    </div>
                    {current.key === 'aromas' && (
                      <button type="button" onClick={() => setStep(step + 1)} className="self-start h-11 px-7 rounded-full bg-gold-gradient text-onyx text-xs font-semibold uppercase tracking-wider hover:shadow-gold transition-shadow">
                        {(draft.aromas ?? []).length ? 'Continuar' : 'Sorpréndeme'}
                      </button>
                    )}
                    {step > 0 && (
                      <button type="button" onClick={() => setStep(step - 1)} className="self-start text-xs text-cream/40 hover:text-gold transition-colors">
                        ← Atrás
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {status === 'loading' && (
                <div className="flex items-center gap-3 py-8 text-cream/60 text-sm">
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-gold"
                    animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                  Buscando tus opciones en el catálogo…
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-4 py-4">
                  <p role="alert" className="text-sm text-red-300">{error}</p>
                  <button type="button" onClick={reset} className="self-start h-10 px-6 rounded-full border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-all">
                    Volver a empezar
                  </button>
                </div>
              )}

              {status === 'done' && (
                <div className="flex flex-col gap-3">
                  {results.length === 0 ? (
                    <p className="text-cream/60 text-sm py-4">No encontramos perfumes con esa combinación. Prueba con otros aromas.</p>
                  ) : (
                    <ul className="flex flex-col gap-3">{results.map((r) => <ResultRow key={r.perfume.id} rec={r} />)}</ul>
                  )}
                  <button type="button" onClick={reset} className="self-center mt-2 px-6 py-2 border border-gold/40 text-gold text-sm rounded-full hover:bg-gold/10 transition-all">
                    Empezar de nuevo
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Globo de invitación */}
      <AnimatePresence>
        {teaser && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            style={{ transformOrigin: 'bottom left' }}
            className="absolute bottom-[4.5rem] left-0 w-[240px] glass-card bg-onyx/90 rounded-2xl rounded-bl-sm border border-gold/30 shadow-gold"
          >
            <button type="button" onClick={openPanel} className="block w-full text-left pl-4 pr-9 py-3">
              <span className="block font-playfair text-sm font-semibold leading-tight text-cream">¿No sabes cuál elegir?</span>
              <span className="block text-xs text-cream/60 mt-1">Te sugiero 5 perfumes en 1 minuto.</span>
            </button>
            <button type="button" onClick={dismissTeaser} aria-label="Cerrar invitación" className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center text-cream/40 hover:text-gold transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja */}
      <motion.button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? 'Cerrar asesor de fragancias' : 'Abrir asesor de fragancias'}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={reduceMotion || open ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: [0, -6, 0] }}
        transition={
          reduceMotion || open
            ? { type: 'spring', stiffness: 300, damping: 20, delay: 1 }
            : { scale: { type: 'spring', stiffness: 300, damping: 20, delay: 1 }, opacity: { delay: 1 }, y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 2 } }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-14 h-14 rounded-full bg-gold-gradient text-onyx shadow-gold-lg flex items-center justify-center"
      >
        {!open && !reduceMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-gold"
            animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
          />
        )}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <BottleIcon className="w-7 h-7" />
        )}
      </motion.button>
    </div>
  )
}
