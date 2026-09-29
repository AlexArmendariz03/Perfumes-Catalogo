'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { catalog as perfumes } from '@/data/catalog'
import { categories } from '@/data/perfumes'
import PerfumeCard from './PerfumeCard'

const PAGE_SIZE = 24

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function CatalogSection() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [activeGender, setActiveGender] = useState<string>('Todos')
  const [activeType, setActiveType] = useState<string>('Todos')
  const [sortBy, setSortBy] = useState<string>('default')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState(1)

  const resetPage = useCallback(() => setPage(1), [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return perfumes
      .filter((p) => activeCategory === 'Todos' || p.category === activeCategory)
      .filter((p) => activeGender === 'Todos' || p.gender === activeGender)
      .filter((p) => activeType === 'Todos' || p.type === activeType)
      .filter((p) =>
        !q ||
        `${p.brand} ${p.name}`.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sizes[0].price - b.sizes[0].price
        if (sortBy === 'price-desc') return b.sizes[0].price - a.sizes[0].price
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        return 0
      })
  }, [activeCategory, activeGender, activeType, sortBy, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilter = (setter: (v: any) => void) => (val: any) => {
    setter(val)
    resetPage()
  }

  return (
    <section id="catalogo" className="py-24 px-4 bg-onyx relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[6px] uppercase text-gold font-inter font-medium mb-3">
            Nuestra Selección
          </p>
          <h2
            className="font-playfair text-4xl sm:text-5xl font-bold text-cream mb-4"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Catálogo de <span className="gold-text">Fragancias</span>
          </h2>
          <div className="gold-divider mx-auto max-w-xs my-5" />
          <p className="text-cream/60 font-inter font-light max-w-md mx-auto">
            {perfumes.length.toLocaleString()} fragancias disponibles — Designer y Árabes.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#C9A84C' }} />}
            placeholder="Buscar perfume o marca"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            allowClear
            style={{
              background: '#1A1A1A',
              borderColor: 'rgba(201,168,76,0.3)',
              color: '#F5F0E8',
              borderRadius: 12,
              height: 44,
            }}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 mb-10"
        >
          {/* Category + Type pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category */}
            {['Todos', ...categories].map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilter(setActiveCategory)(cat)}
                className={`px-4 py-2 rounded-full text-xs font-inter font-medium tracking-wider uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gold text-onyx shadow-gold'
                    : 'border border-gold/30 text-cream/70 hover:border-gold/60 hover:text-gold'
                }`}
              >
                {cat}
              </motion.button>
            ))}

            <div className="w-px h-5 bg-gold/20 mx-1" />

            {/* EDP/EDT */}
            {['Todos', 'EDP', 'EDT', 'EDC'].map((t) => (
              <button
                key={t}
                onClick={() => handleFilter(setActiveType)(t)}
                className={`px-3 py-1.5 rounded text-xs font-inter transition-all duration-200 ${
                  activeType === t
                    ? 'bg-gold/20 text-gold border border-gold/50'
                    : 'text-cream/50 hover:text-cream/80 border border-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Gender + Sort */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              {['Todos', 'Hombre', 'Mujer', 'Unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleFilter(setActiveGender)(g)}
                  className={`px-3 py-1.5 rounded text-xs font-inter transition-all duration-200 ${
                    activeGender === g
                      ? 'bg-gold/20 text-gold border border-gold/50'
                      : 'text-cream/50 hover:text-cream/80'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <Select
              value={sortBy}
              onChange={handleFilter(setSortBy)}
              size="small"
              className="w-40"
              options={[
                { value: 'default', label: 'Orden original' },
                { value: 'featured', label: 'Destacados primero' },
                { value: 'price-asc', label: 'Precio ↑' },
                { value: 'price-desc', label: 'Precio ↓' },
                { value: 'name', label: 'Nombre A-Z' },
              ]}
            />
          </div>
        </motion.div>

        {/* Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-cream/40 text-xs font-inter">
            {filtered.length.toLocaleString()} fragancias
            {search && ` · "${search}"`}
          </p>
          {totalPages > 1 && (
            <p className="text-cream/40 text-xs font-inter">
              Página {page} de {totalPages}
            </p>
          )}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${activeGender}-${activeType}-${sortBy}-${search}-${page}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-8 sm:gap-y-14"
          >
            {paginated.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-cream/40">
            <p className="font-playfair text-2xl mb-2" style={{ fontFamily: 'Playfair Display' }}>
              Sin resultados
            </p>
            <p className="font-inter text-sm">Prueba con otro filtro o búsqueda</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-inter border border-gold/30 text-gold rounded-full hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Anterior
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 text-xs font-inter rounded-full transition-all ${
                    page === pageNum
                      ? 'bg-gold text-onyx font-bold'
                      : 'border border-gold/20 text-cream/60 hover:border-gold/50 hover:text-gold'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-inter border border-gold/30 text-gold rounded-full hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
