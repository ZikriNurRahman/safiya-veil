// src/store/cart.store.ts
// State keranjang belanja menggunakan Zustand
// Disederhanakan untuk toko hijab: tidak ada table number, order type = PICKUP/DELIVERY

import { create } from 'zustand'
import type { CartItem, Product, PaymentMethod, OrderType } from '@/types/database'

interface CartStore {
  items:          CartItem[]
  customerName:   string
  customerPhone:  string
  customerAddress: string
  orderType:      OrderType
  paymentMethod:  PaymentMethod

  // Actions
  addItem:          (product: Product) => void
  decrementItem:    (productId: string) => void
  removeItem:       (productId: string) => void
  setQuantity:      (productId: string, qty: number) => void
  setItemNotes:     (productId: string, notes: string) => void
  clearCart:        () => void
  setCustomerName:  (name: string) => void
  setCustomerPhone: (phone: string) => void
  setCustomerAddress: (address: string) => void
  setOrderType:     (t: OrderType) => void
  setPaymentMethod: (m: PaymentMethod) => void
  getTotal:         () => number
  isReadyToCheckout: () => boolean
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items:           [],
  customerName:    '',
  customerPhone:   '',
  customerAddress: '',
  orderType:       'PICKUP',   // default ambil di toko
  paymentMethod:   'TRANSFER', // default transfer

  // Tambah item — kalau sudah ada tinggal naikkan qty
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.productId === product.id)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    }
    return {
      items: [...state.items, {
        productId:   product.id,
        productName: product.name,
        unitPrice:   product.price,
        quantity:    1,
        notes:       '',
      }],
    }
  }),

  // Kurangi qty — kalau sudah 1 maka hapus
  decrementItem: (productId) => set((state) => {
    const item = state.items.find(i => i.productId === productId)
    if (!item) return state
    if (item.quantity <= 1) return { items: state.items.filter(i => i.productId !== productId) }
    return {
      items: state.items.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      ),
    }
  }),

  removeItem: (productId) => set(state => ({
    items: state.items.filter(i => i.productId !== productId),
  })),

  setQuantity: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return }
    set(state => ({
      items: state.items.map(i =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ),
    }))
  },

  setItemNotes: (productId, notes) => set(state => ({
    items: state.items.map(i =>
      i.productId === productId ? { ...i, notes } : i
    ),
  })),

  clearCart: () => set({
    items:           [],
    customerName:    '',
    customerPhone:   '',
    customerAddress: '',
    orderType:       'PICKUP',
    paymentMethod:   'TRANSFER',
  }),

  setCustomerName:    (customerName)    => set({ customerName }),
  setCustomerPhone:   (customerPhone)   => set({ customerPhone }),
  setCustomerAddress: (customerAddress) => set({ customerAddress }),
  setOrderType:       (orderType)       => set({ orderType }),
  setPaymentMethod:   (paymentMethod)   => set({ paymentMethod }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

  // Siap checkout: ada item + nama + nomor HP
  isReadyToCheckout: () => {
    const { items, customerName, customerPhone, orderType, customerAddress } = get()
    const baseValid = items.length > 0 && customerName.trim().length > 0 && customerPhone.trim().length > 0
    // Kalau delivery wajib ada alamat
    if (orderType === 'DELIVERY') return baseValid && customerAddress.trim().length > 0
    return baseValid
  },
}))