'use client'
// src/app/shop/page.tsx
// Halaman toko utama — publik, semua orang bisa akses
// Menampilkan produk hijab dengan filter kategori + keranjang belanja

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart.store'
import { ProductCard } from '@/components/shop/ProductCard'
import { CartDrawer } from '@/components/shop/CartDrawer'
import type { Product, Category } from '@/types/database'

export default function ShopPage() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [loading,        setLoading]        = useState(true)
  const [cartOpen,       setCartOpen]       = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')

  const cartCount = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0))

  // Fetch produk dan kategori dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      const [{ data: products }, { data: categories }] = await Promise.all([
        supabase.from('products').select('*').order('category').order('name'),
        supabase.from('categories').select('*').order('sort_order'),
      ])

      if (products) setProducts(products as Product[])
      if (categories) setCategories(categories as Category[])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Filter produk berdasarkan kategori dan search
  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Semua' || p.category === activeCategory
    const matchSearch   = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const heroStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #3D2B1F 0%, #AD8B73 60%, #CEAB93 100%)',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="px-6 py-20 md:py-28 text-center" style={heroStyle}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: '#E3CAA5', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: '#FFFBE9', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-2xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#CEAB93' }}
          >
            Koleksi Premium
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold leading-tight mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#FFFBE9' }}
          >
            Temukan Hijab yang
            <br />
            <span style={{ fontStyle: 'italic', color: '#E3CAA5' }}>Sempurna Untukmu</span>
          </h1>
          <p className="text-sm md:text-base mb-8" style={{ color: '#CEAB93' }}>
            Koleksi hijab premium dengan bahan terpilih, desain elegan,
            dan nilai-nilai islami yang murni.
          </p>
          <a
            href="#koleksi"
            className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: '#FFFBE9', color: '#AD8B73' }}
          >
            Lihat Koleksi →
          </a>
        </div>
      </section>

      {/* ── KEUNGGULAN ── */}
      <section className="py-12 px-6" style={{ background: '#E3CAA5' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['🌟', 'Bahan Premium', 'Nyaman sepanjang hari'],
            ['🎨', 'Desain Elegan', 'Tampil anggun & syar\'i'],
            ['🚚', 'Gratis Ongkir', 'Min. pembelian tertentu'],
            ['✅', 'Original', 'Jaminan produk asli'],
          ].map(([icon, title, desc]) => (
            <div key={title}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#3D2B1F' }}>{title}</p>
              <p className="text-xs" style={{ color: '#8C6E5A' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KOLEKSI ── */}
      <section id="koleksi" className="px-6 py-12 max-w-6xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#CEAB93' }}>
              Koleksi Kami
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
            >
              Semua Produk
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#CEAB93' }}>
              🔍
            </span>
            <input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-full md:w-64"
              style={{
                background: '#FFFBE9',
                border: '1.5px solid #E3CAA5',
                color: '#3D2B1F',
                fontFamily: 'var(--font-sans)',
              }}
              onFocus={e => e.target.style.borderColor = '#AD8B73'}
              onBlur={e => e.target.style.borderColor = '#E3CAA5'}
            />
          </div>
        </div>

        {/* Filter kategori */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['Semua', ...categories.map(c => c.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeCategory === cat ? '#AD8B73' : '#E3CAA5',
                color: activeCategory === cat ? '#FFFBE9' : '#8C6E5A',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid produk */}
        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded skeleton w-3/4" />
                  <div className="h-3 rounded skeleton w-full" />
                  <div className="h-5 rounded skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧕</div>
            <p className="text-base font-semibold" style={{ color: '#3D2B1F' }}>
              {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk tersedia'}
            </p>
            <p className="text-sm mt-1" style={{ color: '#8C6E5A' }}>
              {searchQuery ? 'Coba kata kunci lain' : 'Segera hadir produk baru!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── TENTANG KAMI ── */}
      <section
        id="tentang"
        className="px-6 py-16"
        style={{ background: 'linear-gradient(135deg, #E3CAA5, #CEAB93)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#AD8B73' }}>
            Tentang Kami
          </p>
          <h2
            className="text-2xl md:text-3xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            Dihadirkan dengan Kasih dan Keimanan
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#3D2B1F' }}>
            Safiya Veil hadir untuk wanita muslimah yang ingin tampil elegan
            tanpa melupakan nilai-nilai syar&apos;i. Setiap produk kami dirancang
            dengan penuh kasih, menggunakan bahan berkualitas premium yang
            nyaman dipakai sepanjang hari.
          </p>
          <div className="h-px mt-8 mb-2 mx-auto w-12" style={{ background: '#AD8B73' }} />
          <p className="text-sm font-medium italic" style={{ color: '#AD8B73' }}>
            &ldquo;Grace in Style, Pure in Faith&rdquo;
          </p>
        </div>
      </section>

      {/* ── FLOATING CART BUTTON ── */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl transition-all hover:scale-105"
          style={{ background: '#AD8B73', color: '#FFFBE9' }}
        >
          <span className="text-base">🛍️</span>
          <span className="text-sm font-semibold">Keranjang ({cartCount})</span>
        </button>
      )}

      {/* ── CART DRAWER ── */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}