import { create } from 'zustand'
import { Perfume } from '@/data/catalog'
import { calcPrecioMXN, formatPrecio } from '@/lib/pricing'

export interface CartItem {
  perfume: Perfume
  selectedMl: number
  selectedPriceUSD: number  // costo en USD
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (perfume: Perfume, ml: number) => void
  removeItem: (id: string, ml: number) => void
  updateQuantity: (id: string, ml: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
  getWhatsAppMessage: () => string
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '526141234567'

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (perfume, ml) => {
    const sizeOption = perfume.sizes.find((s) => s.ml === ml)
    if (!sizeOption) return

    set((state) => {
      const existing = state.items.find(
        (i) => i.perfume.id === perfume.id && i.selectedMl === ml
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.perfume.id === perfume.id && i.selectedMl === ml
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          isOpen: true,
        }
      }
      return {
        items: [
          ...state.items,
          {
            // Guarda la foto de la presentación elegida para el carrito
            perfume: { ...perfume, image: sizeOption.image || perfume.image },
            selectedMl: ml,
            selectedPriceUSD: sizeOption.price,
            quantity: 1,
          },
        ],
        isOpen: true,
      }
    })
  },

  removeItem: (id, ml) =>
    set((state) => ({
      items: state.items.filter((i) => !(i.perfume.id === id && i.selectedMl === ml)),
    })),

  updateQuantity: (id, ml, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => !(i.perfume.id === id && i.selectedMl === ml))
          : state.items.map((i) =>
              i.perfume.id === id && i.selectedMl === ml ? { ...i, quantity } : i
            ),
    })),

  clearCart: () => set({ items: [] }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

  // Total en MXN
  totalPrice: () =>
    get().items.reduce(
      (acc, i) => acc + calcPrecioMXN(i.selectedPriceUSD) * i.quantity,
      0
    ),

  getWhatsAppMessage: () => {
    const items = get().items
    if (items.length === 0) return ''

    const lines = items
      .map(
        (i) =>
          `• ${i.perfume.code ? `*${i.perfume.code}* – ` : ''}*${i.perfume.name}*${sizeLabel(i.perfume.name, i.selectedMl)} x${i.quantity}\n📸 ${productUrl(i.perfume.id, i.selectedMl)}`
      )
      .join('\n')

    const total = get().totalPrice()
    const msg =
      `¡Hola! Me interesa cotizar los siguientes perfumes de *Ararat Perfumes*:\n\n` +
      lines +
      `\n\n¿Pueden confirmar disponibilidad y tiempo de entrega? ¡Gracias!`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
  },
}))


// Enlace a la página del perfume (/p/[id]); WhatsApp muestra su foto como vista previa
export function productUrl(id: string, ml: number): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ''
  return `${origin}/p/${encodeURIComponent(id)}?ml=${ml}`
}

// " (100ml)" salvo que el nombre ya traiga el tamaño ("... EDT 100ML")
function sizeLabel(name: string, ml: number): string {
  return new RegExp(`\\b${ml}\\s*ml\\b`, 'i').test(name) ? '' : ` (${ml}ml)`
}

export function getSingleProductWhatsApp(perfume: Perfume, ml: number): string {
  // const sizeOption = perfume.sizes.find((s) => s.ml === ml)
  // const priceMXN = sizeOption ? `$${formatPrecio(sizeOption.price)} MXN` : ''
  const msg =
    `¡Hola! Me interesa el siguiente perfume de *Ararat Perfumes*:\n\n` +
    `• ${perfume.code ? `*${perfume.code}* – ` : ''}*${perfume.name}*${sizeLabel(perfume.name, ml)}\n📸 ${productUrl(perfume.id, ml)}\n\n` +
    `¿Pueden darme más información sobre disponibilidad y tiempo de entrega? ¡Gracias!`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}
