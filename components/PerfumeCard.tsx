'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { message } from 'antd'
import { ShoppingCartOutlined, StarFilled } from '@ant-design/icons'
import Image from 'next/image'
import { Perfume } from '@/data/catalog'
// import { formatPrecio } from '@/lib/pricing'
import { useCartStore, getSingleProductWhatsApp, shortImageUrl } from '@/store/cartStore'

interface Props {
  perfume: Perfume
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const categoryGlow: Record<string, string> = {
  Oriental:  '201,140,60',
  Floral:    '220,80,120',
  Fresco:    '60,180,210',
  Amaderado: '160,120,80',
  Gourmand:  '210,130,50',
  Citrico:   '220,200,60',
}

export default function PerfumeCard({ perfume }: Props) {
  const [selectedMl, setSelectedMl] = useState(
    perfume.sizes[perfume.sizes.length > 1 ? 1 : 0].ml
  )
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCartStore()
  const [messageApi, contextHolder] = message.useMessage()

  const selectedSize = perfume.sizes.find((s) => s.ml === selectedMl) || perfume.sizes[0]
  const glow = categoryGlow[perfume.category] || '201,168,76'

  const handleWhatsApp = async (e: React.MouseEvent) => {
    e.preventDefault()
    const short = await shortImageUrl(perfume.image)
    const url = getSingleProductWhatsApp(perfume, selectedMl, short)
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
      <motion.div
        variants={cardVariants}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="relative group flex flex-col rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 100%)',
          border: hovered
            ? `1px solid rgba(${glow},0.5)`
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: hovered
            ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(${glow},0.15)`
            : '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          {perfume.featured ? (
            <div className="flex items-center gap-1 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-bold font-inter uppercase tracking-widest px-2.5 py-1 rounded-full">
              <StarFilled style={{ fontSize: 7 }} />
              Destacado
            </div>
          ) : (
            <div />
          )}
          <div className="text-[9px] font-inter font-semibold tracking-widest text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            {perfume.gender}
          </div>
        </div>

        {/* ── IMAGE AREA ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            height: 260,
            background: `radial-gradient(ellipse at 50% 60%, rgba(${glow},0.12) 0%, rgba(10,10,10,0) 70%), #111`,
          }}
        >
          {!imgError ? (
            <motion.div
              className="relative w-full h-full"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Image
                src={perfume.image}
                alt={perfume.name}
                fill
                className="object-contain drop-shadow-2xl"
                style={{ padding: '20px 28px' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => setImgError(true)}
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ background: `radial-gradient(circle, rgba(${glow},0.3), rgba(${glow},0.05))` }}
              >
                🧴
              </div>
              <p className="text-[11px] text-white/30 font-inter">{perfume.code}</p>
            </div>
          )}

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #0e0e0e, transparent)' }} />

          {/* Hover overlay — WhatsApp */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
              >
                <motion.button
                  onClick={handleWhatsApp}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-2 text-white font-inter font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl"
                  style={{ background: '#25D366' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Cotizar ahora
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CARD BODY ── */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-3">

          {/* Brand + code */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-inter font-semibold tracking-widest uppercase"
              style={{ color: `rgba(${glow},0.9)` }}>
              {perfume.brand}
            </span>
            {perfume.code && <span className="text-[9px] font-inter text-white/25 tracking-widest">{perfume.code}</span>}
          </div>

          {/* Name */}
          <h3 className="font-playfair text-[17px] font-semibold text-white leading-snug line-clamp-2"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {perfume.name}
          </h3>

          {/* Tags row */}
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest font-inter font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `rgba(${glow},0.12)`, color: `rgba(${glow},1)`, border: `1px solid rgba(${glow},0.25)` }}>
              {perfume.category}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-inter px-2 py-0.5 rounded-full text-white/40 border border-white/8">
              {(perfume as any).type || 'EDP'}
            </span>
          </div>

          {/* Size selector */}
          {perfume.sizes.length > 1 && (
            <div className="flex gap-1.5">
              {perfume.sizes.map((size) => (
                <button
                  key={size.ml}
                  onClick={() => setSelectedMl(size.ml)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-inter font-medium transition-all duration-200"
                  style={{
                    background: selectedMl === size.ml ? `rgba(${glow},0.15)` : 'rgba(255,255,255,0.04)',
                    border: selectedMl === size.ml ? `1px solid rgba(${glow},0.6)` : '1px solid rgba(255,255,255,0.08)',
                    color: selectedMl === size.ml ? `rgb(${glow})` : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {size.ml}ml
                </button>
              ))}
            </div>
          )}

          {/* Price + actions */}
          <div className="flex items-center justify-end mt-auto pt-2 border-t border-white/5">
            {/* precio oculto — descomentar para mostrar
            <div>
              <p className="text-[10px] text-white/30 font-inter">{selectedMl}ml</p>
              <p className="text-2xl font-bold font-inter leading-none"
                style={{
                  background: `linear-gradient(135deg, rgb(${glow}) 0%, rgba(${glow},0.7) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                ${formatPrecio(selectedSize.price)}
                <span className="text-[11px] font-normal text-white/30 ml-1"
                  style={{ WebkitTextFillColor: 'rgba(255,255,255,0.3)' }}>MXN</span>
              </p>
            </div>
            */}

            <div className="flex gap-2">
              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-inter font-semibold transition-all duration-200"
                style={{
                  background: `rgba(${glow},0.12)`,
                  border: `1px solid rgba(${glow},0.35)`,
                  color: `rgb(${glow})`,
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 13 }} />
                Agregar
              </motion.button>

              {/* WhatsApp */}
              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(37,211,102,0.1)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  color: '#25D366',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
