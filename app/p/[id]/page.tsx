import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { catalog, type Perfume } from '@/data/catalog'

// Página pública de un perfume: se comparte en el mensaje de WhatsApp para
// que el chat muestre la foto (vista previa con og:image) sin exponer el origen.

interface Props {
  params: { id: string }
  searchParams: { ml?: string }
}

function findVariant(id: string, mlParam?: string) {
  const perfume = catalog.find((p) => p.id === id)
  if (!perfume) return null
  const ml = Number(mlParam)
  const size = perfume.sizes.find((s) => s.ml === ml) || perfume.sizes[0]
  return { perfume, size, image: size.image || perfume.image }
}

// La foto se sirve a través de /api/img para ocultar la URL de la tienda origen
function proxiedImage(image: string): string {
  if (!image.startsWith('http')) return image
  return `/api/img/${Buffer.from(image).toString('base64url')}`
}

function siteOrigin(): string {
  const h = headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

function title(perfume: Perfume, ml: number) {
  return `${perfume.brand} — ${perfume.name}${ml ? ` (${ml}ml)` : ''}`
}

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const found = findVariant(params.id, searchParams.ml)
  if (!found) return { title: 'Ararat Perfumes' }
  const { perfume, size, image } = found
  const imageUrl = `${siteOrigin()}${proxiedImage(image)}`
  return {
    title: `${title(perfume, size.ml)} | Ararat Perfumes`,
    description: `${perfume.type} · ${perfume.gender} · Ararat Perfumes`,
    openGraph: {
      title: title(perfume, size.ml),
      description: `${perfume.type} · ${perfume.gender} · Ararat Perfumes`,
      images: [{ url: imageUrl }],
      type: 'website',
    },
  }
}

export default function PerfumePage({ params, searchParams }: Props) {
  const found = findVariant(params.id, searchParams.ml)
  if (!found) notFound()
  const { perfume, size, image } = found

  return (
    <main className="min-h-screen bg-onyx flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="bg-[#111] flex items-center justify-center p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxiedImage(image)}
            alt={perfume.name}
            className="w-full h-auto max-h-[420px] object-contain"
          />
        </div>
        <div className="px-5 py-5 flex flex-col gap-2">
          <span className="text-[11px] font-inter font-semibold tracking-widest uppercase text-[#C9A84C]">
            {perfume.brand}
          </span>
          <h1
            className="text-2xl font-semibold text-white leading-snug"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            {perfume.name}
          </h1>
          <p className="text-sm font-inter text-white/50">
            {[perfume.type, perfume.gender, size.ml ? `${size.ml}ml` : ''].filter(Boolean).join(' · ')}
          </p>
          <Link
            href="/"
            className="mt-4 text-center py-3 rounded-xl text-sm font-inter font-semibold text-[#0A0A0A] bg-[#C9A84C]"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  )
}
