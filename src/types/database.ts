// src/types/database.ts
// Safiya Veil — tipe data utama aplikasi
// Disederhanakan dari kasir-dapur: tidak ada Branch, tidak ada role pegawai
// Hanya OWNER yang bisa akses admin

export type OrderStatus   = 'PENDING_PAYMENT' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER'
export type OrderType     = 'PICKUP' | 'DELIVERY'

// Hanya dua role: OWNER (admin) atau tidak login sama sekali (publik)
export type UserRole = 'OWNER'

// Profile owner — hanya satu atau dua akun
export interface Profile {
  id:           string
  role:         UserRole
  display_name: string
  created_at:   string
}

// Kategori produk hijab
export interface Category {
  id:         string
  name:       string
  sort_order: number
  created_at: string
}

// Produk hijab
export interface Product {
  id:           string
  name:         string
  price:        number
  category:     string
  description:  string
  image_url:    string | null
  stock:        number
  is_available: boolean
  created_at:   string
}

// Item dalam order
export interface OrderItem {
  id:         string
  order_id:   string
  product_id: string | null
  product_name: string
  unit_price: number
  quantity:   number
  notes:      string
}

// Order dari customer
export interface Order {
  id:             string
  order_number:   string
  customer_name:  string
  customer_phone: string
  customer_address: string
  order_type:     OrderType
  total_price:    number
  payment_method: PaymentMethod
  status:         OrderStatus
  cash_received:  number
  notes:          string
  created_at:     string
  updated_at:     string
  order_items?:   OrderItem[]
}

// Setting toko
export interface StoreSettings {
  id:            number
  store_name:    string
  store_address: string
  store_phone:   string
  store_social:  string
  footer_text:   string
  updated_at:    string
}

// Item di keranjang belanja (client-side only)
export interface CartItem {
  productId:   string
  productName: string
  unitPrice:   number
  quantity:    number
  notes:       string
}