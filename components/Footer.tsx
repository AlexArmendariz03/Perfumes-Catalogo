'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '526141234567'

export default function Footer() {
  const year = new Date().getFullYear()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me gustaría obtener información sobre sus perfumes.')}`

  return (
    <footer id="footer" className="bg-black border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]">
                <Image src="/logo.png" alt="Ararat Perfumes" fill className="object-contain" />
              </div>
              <div>
                <p className="font-playfair text-xl text-cream font-semibold" style={{ fontFamily: 'Playfair Display' }}>
                  Ararat
                </p>
                <p className="text-[10px] tracking-[4px] uppercase text-gold font-inter">Perfumes</p>
              </div>
            </div>
            <p className="text-cream/50 text-sm font-inter font-light leading-relaxed max-w-xs">
              Fragancias de lujo cuidadosamente seleccionadas para quienes aprecian lo extraordinario.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-gold text-xs font-inter font-semibold tracking-widest uppercase mb-5">
              Navegación
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', href: '#inicio' },
                { label: 'Catálogo', href: '#catalogo' },
                { label: 'Fragancias destacadas', href: '#catalogo' },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-cream/50 hover:text-gold text-sm font-inter transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold text-xs font-inter font-semibold tracking-widest uppercase mb-5">
              Contacto
            </h4>
            <div className="space-y-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-cream/60 hover:text-[#25D366] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366]/10 group-hover:bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-sm font-inter">WhatsApp</span>
              </a>
              <p className="text-cream/30 text-xs font-inter pl-12">
                Respuesta en minutos durante horario de atención
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="gold-divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-cream/30 text-xs font-inter">
          <p>© {year} Ararat Perfumes. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Fragancias que cuentan historias
            <span className="text-gold">✦</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
