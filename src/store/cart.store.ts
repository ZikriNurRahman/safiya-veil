// src/store/cart.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, PaymentMethod, OrderType } from '@/types/database'

interface CartStore {
  items: CartItem[]
  customerName: string
  customerPhone: string
  customerAddress: string
  orderType: OrderType
  paymentMethod: PaymentMethod

  addItem: (product: Product, color?: string) => void
  decrementItem: (productId: string, color?: string) => void
  removeItem: (productId: string, color?: string) => void
  setQuantity: (productId: string, qty: number, color?: string) => void
  setItemColor: (productId: string, oldColor: string | undefined, newColor: string) => void
  setItemNotes: (productId: string, notes: string, color?: string) => void
  clearCart: () => void
  setCustomerName: (name: string) => void
  setCustomerPhone: (phone: string) => void
  setCustomerAddress: (address: string) => void
  setOrderType: (t: OrderType) => void
  setPaymentMethod: (m: PaymentMethod) => void
  getTotal: () => number
  isReadyToCheckout: () => boolean
}

const itemKey = (productId: string, color?: string) =>
  `${productId}::${color ?? ''}`

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      orderType: 'PICKUP' as OrderType,
      paymentMethod: 'TRANSFER' as PaymentMethod,

      addItem: (product, color) => set((state) => {
        const key = itemKey(product.id, color)
        const existing = state.items.find(i => itemKey(i.productId, i.selectedColor) === key)
        if (existing) {
          return {
            items: state.items.map(i =>
              itemKey(i.productId, i.selectedColor) === key
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }
        }
        return {
          items: [...state.items, {
            productId: product.id,
            productName: product.name,
            // 🔥 UPDATE: Gunakan sale_price jika ada, jika tidak gunakan harga normal
            unitPrice: product.sale_price ?? product.price,
            quantity: 1,
            notes: '',
            selectedColor: color,
          }],
        }
      }),

      decrementItem: (productId, color) => set((state) => {
        const key = itemKey(productId, color)
        const item = state.items.find(i => itemKey(i.productId, i.selectedColor) === key)
        if (!item) return state
        if (item.quantity <= 1)
          return { items: state.items.filter(i => itemKey(i.productId, i.selectedColor) !== key) }
        return {
          items: state.items.map(i =>
            itemKey(i.productId, i.selectedColor) === key ? { ...i, quantity: i.quantity - 1 } : i
          ),
        }
      }),

      removeItem: (productId, color) => set(state => ({
        items: state.items.filter(i =>
          itemKey(i.productId, i.selectedColor) !== itemKey(productId, color)
        ),
      })),

      setQuantity: (productId, qty, color) => {
        const key = itemKey(productId, color)
        if (qty <= 0) { get().removeItem(productId, color); return }
        set(state => ({
          items: state.items.map(i =>
            itemKey(i.productId, i.selectedColor) === key ? { ...i, quantity: qty } : i
          ),
        }))
      },

      setItemColor: (productId, oldColor, newColor) => set(state => ({
        items: state.items.map(i =>
          itemKey(i.productId, i.selectedColor) === itemKey(productId, oldColor)
            ? { ...i, selectedColor: newColor }
            : i
        ),
      })),

      setItemNotes: (productId, notes, color) => set(state => ({
        items: state.items.map(i =>
          itemKey(i.productId, i.selectedColor) === itemKey(productId, color)
            ? { ...i, notes }
            : i
        ),
      })),

      clearCart: () => set({
        items: [],
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        orderType: 'PICKUP',
        paymentMethod: 'TRANSFER',
      }),

      setCustomerName: (customerName) => set({ customerName }),
      setCustomerPhone: (customerPhone) => set({ customerPhone }),
      setCustomerAddress: (customerAddress) => set({ customerAddress }),
      setOrderType: (orderType) => set({ orderType }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      isReadyToCheckout: () => {
        const { items, customerName, customerPhone, orderType, customerAddress } = get()
        const base = items.length > 0 && customerName.trim() !== '' && customerPhone.trim() !== ''
        if (orderType === 'DELIVERY') return base && customerAddress.trim() !== ''
        return base
      },
    }),
    {
      name: 'safiya-cart',
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerAddress: state.customerAddress,
        orderType: state.orderType,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
)