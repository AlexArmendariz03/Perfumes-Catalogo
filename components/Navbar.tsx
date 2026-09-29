'use client'

import { useState, useEffect } from 'react'
import { Badge, Button } from 'antd'
import { ShoppingCartOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Contacto', href: '#footer' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems, openCart } = useCartStore()
  const itemCount = totalItems()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-onyx/95 backdrop-blur-md border-b border-gold/20 shadow-dark'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#inicio"
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-12 h-12 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]">
              <Image src="/logo.png" alt="Ararat Perfumes" fill className="object-contain" priority />
            </div>
            <div className="hidden sm:block">
              <p
                className="font-playfair text-xl font-semibold text-cream leading-tight"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Ararat
              </p>
              <p className="text-[10px] tracking-[4px] uppercase text-gold font-inter font-medium">
                Perfumes
              </p>
            </div>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ color: '#C9A84C' }}
                className="text-cream/80 hover:text-gold transition-colors text-sm tracking-wider font-inter font-medium uppercase"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Cart button */}
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Badge
                count={itemCount}
                style={{ backgroundColor: '#C9A84C', color: '#0A0A0A', fontWeight: 700 }}
              >
                <button
                  onClick={openCart}
                  className="relative w-11 h-11 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 hover:border-gold/70 transition-all duration-300 flex items-center justify-center text-gold text-lg"
                >
                  <ShoppingCartOutlined />
                </button>
              </Badge>
            </motion.div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-cream hover:text-gold transition-colors text-xl p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-onyx/98 border-t border-gold/20 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-cream/80 hover:text-gold transition-colors text-sm tracking-widest uppercase font-medium py-2 border-b border-white/5"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
