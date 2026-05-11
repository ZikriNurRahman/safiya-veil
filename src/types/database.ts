// src/types/database.ts
// Safiya Veil — tipe data utama aplikasi

// ── SQL Migration (jalankan sekali di Supabase SQL Editor) ─────────────────
// ALTER TABLE public.products
//   ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '[]'::jsonb;
// ──────────────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING_PAYMENT' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'QRIS' | 'TRANSFER' | 'CASH'
export type OrderType = 'PICKUP' | 'DELIVERY'
export type UserRole = 'OWNER'

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  image_url: string | null
  stock: number
  is_available: boolean
  sold: number
  base_sku?: string
  colors: string[]
  color_stocks: ColorStock[]
  color_images: ColorImage[]
  created_at: string
  sale_price?: number | null
  badge?: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  quantity: number
  notes: string
}

export interface ColorStock {
  color: string
  stock: number
  code?: string
}

export interface ColorImage {
  color: string
  image_url: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  order_type: OrderType
  total_price: number
  payment_method: PaymentMethod
  status: OrderStatus
  cash_received: number
  notes: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

// Store settings — phones & socials kini berupa array
export interface StoreSettings {
  id: number
  store_name: string
  store_address: string
  store_phones: string[]  // max 3 nomor WhatsApp/telepon
  store_socials: string[]  // max 5 sosial media
  footer_text: string
  updated_at: string
}

export interface CartItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  notes: string
  selectedColor?: string  // ← baru: warna yang dipilih
}