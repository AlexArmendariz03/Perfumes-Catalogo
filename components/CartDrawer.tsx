'use client'

import { Drawer, Button, Empty, Badge, InputNumber, Popconfirm, Space, Tooltip } from 'antd'
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
// import { calcPrecioMXN } from '@/lib/pricing'  // precios ocultos

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    // totalPrice,  // precios ocultos
    getWhatsAppMessage,
  } = useCartStore()

  const handleWhatsAppCheckout = async () => {
    const url = await getWhatsAppMessage()
    if (url) window.open(url, '_blank')
  }

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <Badge count={totalItems()} size="small" offset={[2, -2]}>
            <ShoppingCartOutlined style={{ color: '#C9A84C', fontSize: 20 }} />
          </Badge>
          <span className="font-playfair text-lg font-semibold text-cream">Tu cotización</span>
          {totalItems() > 0 && (
            <span className="ml-auto text-xs text-cream/50 font-inter font-normal">
              {totalItems()} {totalItems() === 1 ? 'pieza' : 'piezas'}
            </span>
          )}
        </div>
      }
      placement="right"
      onClose={closeCart}
      open={isOpen}
      width="min(400px, 100vw)"
      styles={{
        body: { padding: 0, background: '#111111', display: 'flex', flexDirection: 'column' },
        header: { background: '#0A0A0A', borderBottom: '1px solid rgba(201,168,76,0.2)' },
        footer: { background: '#0A0A0A', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '16px 20px' },
      }}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            {/* total oculto — descomentar para mostrar
            <div className="flex items-center justify-between">
              <span className="text-cream/60 text-sm font-inter">Total estimado</span>
              <span className="font-inter font-bold text-xl gold-text">
                ${totalPrice().toLocaleString('es-MX')}
                <span className="text-cream/40 text-xs font-normal ml-1">MXN</span>
              </span>
            </div>
            */}

            <p className="text-cream/50 text-xs font-inter text-center">
              Te respondemos con precio, disponibilidad y tiempo de entrega.
            </p>

            {/* WhatsApp CTA */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(37,211,102,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppCheckout}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-inter font-semibold text-sm transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar cotización por WhatsApp
            </motion.button>

            {/* Vaciar, con confirmación para no perder la lista por accidente */}
            <Popconfirm
              title="¿Vaciar la cotización?"
              description="Se quitarán todos los perfumes."
              okText="Vaciar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              onConfirm={clearCart}
            >
              <Button type="text" size="small" block className="!text-cream/40 hover:!text-red-400">
                Vaciar cotización
              </Button>
            </Popconfirm>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="flex flex-col gap-1">
                <span className="font-playfair text-lg text-cream/80">Tu cotización está vacía</span>
                <span className="text-cream/40 text-sm">Agrega perfumes desde el catálogo para empezar.</span>
              </span>
            }
          >
            <Button href="#catalogo" onClick={closeCart} shape="round">
              Ver catálogo
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.perfume.id}-${item.selectedMl}`}
                layout
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-card rounded-xl p-3 flex gap-3"
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                  <Image
                    src={item.perfume.image}
                    alt={item.perfume.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-cream/50 text-[10px] font-inter tracking-wider uppercase">
                        {item.perfume.brand}
                        {item.perfume.code ? ` · ${item.perfume.code}` : ''}
                      </p>
                      <p className="text-cream text-sm font-inter font-medium truncate">
                        {item.perfume.name}
                      </p>
                      <p className="text-gold/70 text-xs font-inter">{item.selectedMl}ml</p>
                    </div>
                    <Tooltip title="Quitar">
                      <Button
                        type="text"
                        size="small"
                        aria-label={`Quitar ${item.perfume.name}`}
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.perfume.id, item.selectedMl)}
                        className="!text-cream/40 hover:!text-red-400 flex-shrink-0"
                      />
                    </Tooltip>
                  </div>

                  {/* Quantity + price */}
                  <div className="flex items-center justify-between mt-2">
                    <Space.Compact size="small">
                      <Button
                        aria-label="Quitar una pieza"
                        icon={<MinusOutlined />}
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.perfume.id, item.selectedMl, item.quantity - 1)}
                      />
                      <InputNumber
                        aria-label="Cantidad"
                        min={1}
                        max={99}
                        controls={false}
                        value={item.quantity}
                        onChange={(v) => v && updateQuantity(item.perfume.id, item.selectedMl, v)}
                        className="!w-12 [&_input]:!text-center"
                      />
                      <Button
                        aria-label="Agregar una pieza"
                        icon={<PlusOutlined />}
                        disabled={item.quantity >= 99}
                        onClick={() => updateQuantity(item.perfume.id, item.selectedMl, item.quantity + 1)}
                      />
                    </Space.Compact>
                    {/* precio oculto — descomentar para mostrar
                    <p className="text-gold font-inter font-bold text-sm">
                      ${(calcPrecioMXN(item.selectedPriceUSD) * item.quantity).toLocaleString('es-MX')}
                    </p>
                    */}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Drawer>
  )
}
