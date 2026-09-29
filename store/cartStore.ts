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
          { perfume, selectedMl: ml, selectedPriceUSD: sizeOption.price, quantity: 1 },
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
          `• ${i.perfume.code ? `*${i.perfume.code}* – ` : ''}*${i.perfume.name}* (${i.selectedMl}ml) x${i.quantity}`
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


// Acorta una URL de imagen con TinyURL (oculta el origen)
export async function shortImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return ''
  try {
    const res = await fetch(
      `/api/shorten?url=${encodeURIComponent(imageUrl)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.short) return data.short
    }
  } catch {}
  return imageUrl // fallback: URL original
}

export function getSingleProductWhatsApp(perfume: Perfume, ml: number, shortUrl?: string): string {
  const sizeOption = perfume.sizes.find((s) => s.ml === ml)
  // const priceMXN = sizeOption ? `$${formatPrecio(sizeOption.price)} MXN` : ''
  const msg =
    `¡Hola! Me interesa el siguiente perfume de *Ararat Perfumes*:\n\n` +
    `• ${perfume.code ? `*${perfume.code}* – ` : ''}*${perfume.name}* (${ml}ml)${shortUrl ? '\n📸 ' + shortUrl : ''}\n\n` +
    `¿Pueden darme más información sobre disponibilidad y tiempo de entrega? ¡Gracias!`
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '526141234567'}?text=${encodeURIComponent(msg)}`
}
