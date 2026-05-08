'use client'
// src/app/shop/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart.store'
import type { Product, Category } from '@/types/database'

// Import Komponen UI
import { Hero } from '@/components/shop/Hero'
import { FeatureBand } from '@/components/shop/FeatureBand'
import { Collection } from '@/components/shop/Collection'
import { AboutUs } from '@/components/shop/AboutUs'
import { Testimony } from '@/components/shop/Testimony'
import { FloatingCart } from '@/components/shop/FloatingCart'
import { CartDrawer } from '@/components/shop/CartDrawer'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // State UI
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  // Keranjang Global
  const cartItems = useCartStore(s => s.items)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = useCartStore(s => s.getTotal())

  // Fetching Data Produk & Kategori
  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').eq('is_available', true).order('category').order('name'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (prods) setProducts(prods as Product[])
    if (cats) setCategories(cats as Category[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime Update jika produk diubah Admin
  useEffect(() => {
    const ch = supabase.channel('shop-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchData])

  return (
    <>
      <Hero />
      <FeatureBand />

      <Collection
        products={products}
        categories={categories}
        loading={loading}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <AboutUs />
      <Testimony />

      <FloatingCart
        cartCount={cartCount}
        cartTotal={cartTotal}
        setCartOpen={setCartOpen}
      />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}