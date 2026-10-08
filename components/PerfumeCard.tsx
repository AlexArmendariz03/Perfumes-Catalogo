'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { message } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import Image from 'next/image'
import Link from 'next/link'
import { Perfume } from '@/data/catalog'
// import { formatPrecio } from '@/lib/pricing'
import { useCartStore, getSingleProductWhatsApp } from '@/store/cartStore'

interface Props {
  perfume: Perfume
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function PerfumeCard({ perfume }: Props) {
  const [selectedMl, setSelectedMl] = useState(perfume.sizes[0].ml)
  const [imgError, setImgError] = useState(false)
  const { addItem } = useCartStore()
  const [messageApi, contextHolder] = message.useMessage()

  const selectedSize = perfume.sizes.find((s) => s.ml === selectedMl) || perfume.sizes[0]
  const image = selectedSize.image || perfume.image
  const productHref = `/p/${encodeURIComponent(perfume.id)}?ml=${selectedMl}`

  const handleWhatsApp = () => {
    const url = getSingleProductWhatsApp(perfume, selectedMl)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleAddToCart = () => {
    addItem(perfume, selectedMl)
    messageApi.success({
      content: `${perfume.name} (${selectedMl}ml) agregado`,
      icon: <ShoppingCartOutlined style={{ color: '#C9A84C' }} />,
      duration: 2,
    })
  }

  return (
    <>
      {contextHolder}
      <motion.article variants={cardVariants} className="group flex flex-col gap-4 font-hanken">
        {/* Foto: las de la tienda vienen en fondo blanco, así que el recuadro es blanco */}
        <Link
          href={productHref}
          aria-label={`Ver ${perfume.brand} ${perfume.name}`}
          className="relative block aspect-square overflow-hidden bg-white"
        >
          {!imgError ? (
            <Image
              src={image}
              alt={`${perfume.brand} ${perfume.name}`}
              fill
              className="object-contain p-[8%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg width="56" height="82" viewBox="0 0 48 70" fill="none" stroke="#CFC6B6" strokeWidth="1.2" aria-hidden="true">
                <rect x="18" y="2" width="12" height="9" rx="1" />
                <path d="M20 11h8v6h-8z" />
                <rect x="6" y="17" width="36" height="50" rx="5" />
              </svg>
            </span>
          )}
        </Link>

        {/* Marca, nombre y detalle */}
        <div className="flex flex-col gap-1.5">
          <span className="font-plex text-[12px] uppercase tracking-[0.08em] text-cream/60">
            {perfume.brand}
          </span>
          <h3 className="font-bodoni text-[19px] sm:text-[22px] font-normal leading-[1.15] text-cream line-clamp-2">
            <Link href={productHref} className="hover:text-gold transition-colors">
              {perfume.name}
            </Link>
          </h3>
          <span className="text-[14px] text-cream/60">
            {[perfume.type, perfume.gender].filter(Boolean).join(' · ')}
          </span>
        </div>

        {/* Presentaciones */}
        <div role="group" aria-label="Presentación" className="flex flex-wrap gap-1.5">
          {perfume.sizes.map((size) => {
            const active = size.ml === selectedMl
            return (
              <button
                key={size.ml}
                type="button"
                aria-pressed={active}
                onClick={() => { setSelectedMl(size.ml); setImgError(false) }}
                className={`h-9 px-3 rounded font-plex text-[12px] transition-colors ${
                  active
                    ? 'bg-cream text-onyx border border-cream'
                    : 'border border-white/15 text-cream hover:border-white/40'
                }`}
              >
                {size.ml} ml
              </button>
            )
          })}
        </div>

        {/* precio oculto — descomentar para mostrar
        <p className="font-plex text-[15px] text-cream">
          ${formatPrecio(selectedSize.price)} <span className="text-cream/50">MXN</span>
        </p>
        */}

        {/* Acciones */}
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-11 rounded-full border border-cream/80 text-cream text-[14px] font-medium hover:bg-cream hover:text-onyx transition-colors"
          >
            <span className="sm:hidden">Añadir</span>
            <span className="hidden sm:inline">Añadir a cotización</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            aria-label={`Preguntar por ${perfume.name} en WhatsApp`}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full border border-white/15 text-cream hover:border-[#25D366] hover:text-[#25D366] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z" />
            </svg>
          </button>
        </div>
      </motion.article>
    </>
  )
}
