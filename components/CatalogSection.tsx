'use client'

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Select, Input, Segmented, Tag, Button, Pagination, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { catalog as perfumes } from '@/data/catalog'
import PerfumeCard from './PerfumeCard'

const PAGE_SIZE = 24

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const COLECCIONES = [
  { label: 'Todas', value: 'Todos' },
  { label: 'Designer', value: 'Designer' },
  { label: 'Árabes', value: 'Arabian' },
]
const GENEROS = ['Todos', 'Hombre', 'Mujer', 'Unisex']
const CONCENTRACIONES = [
  { label: 'Todas', value: 'Todos' },
  { label: 'EDP', value: 'EDP' },
  { label: 'EDT', value: 'EDT' },
  { label: 'Parfum', value: 'Parfum' },
  { label: 'EDC', value: 'EDC' },
]
const ORDEN = [
  { value: 'default', label: 'Destacados' },
  { value: 'name', label: 'Nombre A–Z' },
  { value: 'brand', label: 'Marca A–Z' },
]

// Marcas con cuántos perfumes tiene cada una, para el filtro
const BRAND_OPTIONS = Array.from(
  perfumes.reduce((m, p) => m.set(p.brand, (m.get(p.brand) ?? 0) + 1), new Map<string, number>()),
)
  .sort(([a], [b]) => a.localeCompare(b, 'es'))
  .map(([brand, n]) => ({ value: brand, label: brand, count: n }))

export default function CatalogSection() {
  const [coleccion, setColeccion] = useState('Todos')
  const [genero, setGenero] = useState('Todos')
  const [tipo, setTipo] = useState('Todos')
  const [marcas, setMarcas] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('default')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const gridTop = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const brandSet = new Set(marcas)
    const list = perfumes
      .filter((p) => coleccion === 'Todos' || p.category === coleccion)
      .filter((p) => genero === 'Todos' || p.gender === genero)
      .filter((p) => tipo === 'Todos' || p.type === tipo)
      .filter((p) => brandSet.size === 0 || brandSet.has(p.brand))
      .filter((p) => !q || `${p.brand} ${p.name}`.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    if (sortBy === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    if (sortBy === 'brand') return [...list].sort((a, b) => a.brand.localeCompare(b.brand, 'es') || a.name.localeCompare(b.name, 'es'))
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }, [coleccion, genero, tipo, marcas, sortBy, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Cualquier cambio de filtro regresa a la primera página
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }

  const clearAll = () => {
    setColeccion('Todos')
    setGenero('Todos')
    setTipo('Todos')
    setMarcas([])
    setSearch('')
    setPage(1)
  }

  const changePage = (p: number) => {
    setPage(p)
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Filtros activos como etiquetas que se pueden quitar
  const activeTags = [
    search.trim() && { key: 'q', label: `“${search.trim()}”`, clear: () => withReset(setSearch)('') },
    coleccion !== 'Todos' && { key: 'col', label: COLECCIONES.find((c) => c.value === coleccion)!.label, clear: () => withReset(setColeccion)('Todos') },
    genero !== 'Todos' && { key: 'gen', label: genero, clear: () => withReset(setGenero)('Todos') },
    tipo !== 'Todos' && { key: 'tipo', label: tipo, clear: () => withReset(setTipo)('Todos') },
    ...marcas.map((m) => ({ key: `m-${m}`, label: m, clear: () => withReset(setMarcas)(marcas.filter((x) => x !== m)) })),
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

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

        {/* Búsqueda + marca */}
        <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] mb-5">
          <Input
            size="large"
            prefix={<SearchOutlined className="text-gold" />}
            placeholder="Buscar perfume o marca"
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            allowClear
            aria-label="Buscar perfume o marca"
          />
          <Select
            mode="multiple"
            size="large"
            allowClear
            showSearch
            placeholder="Filtrar por marca"
            aria-label="Filtrar por marca"
            value={marcas}
            onChange={withReset(setMarcas)}
            options={BRAND_OPTIONS}
            maxTagCount="responsive"
            optionFilterProp="value"
            notFoundContent="Sin marcas con ese nombre"
            optionRender={(o) => (
              <span className="flex justify-between gap-3">
                {o.label}
                <span className="text-cream/40">{o.data.count}</span>
              </span>
            )}
          />
        </div>

        {/* Colección, género y concentración */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 mb-6">
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <Segmented aria-label="Colección" options={COLECCIONES} value={coleccion} onChange={(v) => withReset(setColeccion)(String(v))} />
          </div>
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <Segmented aria-label="Género" options={GENEROS} value={genero} onChange={(v) => withReset(setGenero)(String(v))} />
          </div>
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <Segmented aria-label="Concentración" options={CONCENTRACIONES} value={tipo} onChange={(v) => withReset(setTipo)(String(v))} />
          </div>
        </div>

        {/* Resultados, filtros activos y orden */}
        <div ref={gridTop} className="scroll-mt-28 flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-cream/60 text-sm font-inter mr-1">
              {filtered.length.toLocaleString()} fragancias
            </span>
            {activeTags.map((t) => (
              <Tag
                key={t.key}
                closable
                onClose={(e) => { e.preventDefault(); t.clear() }}
                className="!m-0 !px-3 !py-1 !rounded-full !border-gold/40 text-[13px]"
              >
                {t.label}
              </Tag>
            ))}
            {activeTags.length > 1 && (
              <Button type="link" size="small" onClick={clearAll}>
                Limpiar filtros
              </Button>
            )}
          </div>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={ORDEN}
            className="w-44"
            aria-label="Ordenar"
            prefix={<span className="text-cream/50 text-xs">Orden:</span>}
          />
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${coleccion}-${genero}-${tipo}-${marcas.join(',')}-${sortBy}-${search}-${page}`}
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
          <Empty
            className="py-16"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-cream/60">No encontramos fragancias con esos filtros</span>}
          >
            <Button type="primary" onClick={clearAll}>Limpiar filtros</Button>
          </Empty>
        )}

        {/* Paginación */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex justify-center mt-14">
            <Pagination
              current={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={changePage}
              showSizeChanger={false}
              showQuickJumper={filtered.length > PAGE_SIZE * 10}
              responsive
            />
          </div>
        )}
      </div>
    </section>
  )
}
