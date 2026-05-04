'use client'
// src/app/shop/page.tsx
// Halaman toko — lozy.id inspired:
// • Fullscreen hero dengan overlay teks
// • Banner fitur horizontal
// • Grid produk portrait 3:4 bersih
// • Category pill filter
// • Floating cart button
// • Testimoni section
// • About section

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart.store'
import { ProductCard } from '@/components/shop/ProductCard'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { formatRupiah } from '@/lib/utils'
import type { Product, Category } from '@/types/database'

function SkeletonCard() {
  return (
    <div>
      <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '65%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 13, width: '85%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  const cartItems = useCartStore(s => s.items)
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = useCartStore(s => s.getTotal())

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

  // Realtime subscription
  useEffect(() => {
    const ch = supabase
      .channel('shop-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchData])

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* ══════════════════════════════════════════════
          HERO — full viewport, teks kiri bawah
      ══════════════════════════════════════════════ */}
      <section
        className="relative flex items-end"
        style={{
          minHeight: '92vh',
          background: 'linear-gradient(155deg, #1A0E08 0%, #2C1810 35%, #5C3020 65%, #BF9270 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Texture overlay dots */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #E3B7A0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Radial glow kiri bawah */}
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3" style={{
          background: 'radial-gradient(ellipse at 0% 100%, rgba(191,146,112,0.25) 0%, transparent 70%)',
        }} />

        {/* Dekorasi lingkaran kanan */}
        <div className="absolute top-16 right-16 hidden lg:block opacity-10">
          <svg width="260" height="260" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="125" fill="none" stroke="#EDCDBB" strokeWidth="0.8" />
            <circle cx="130" cy="130" r="85" fill="none" stroke="#EDCDBB" strokeWidth="0.5" />
            <circle cx="130" cy="130" r="45" fill="none" stroke="#EDCDBB" strokeWidth="0.5" />
            <line x1="5" y1="130" x2="255" y2="130" stroke="#EDCDBB" strokeWidth="0.5" />
            <line x1="130" y1="5" x2="130" y2="255" stroke="#EDCDBB" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Vertikal line dekorasi */}
        <div className="absolute right-40 top-1/4 bottom-1/4 hidden lg:block" style={{
          width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(227,183,160,0.3), transparent)',
        }} />

        {/* Konten hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-40 w-full">
          <div className="max-w-xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-8">
              <div style={{ width: 28, height: 1, background: '#E3B7A0', opacity: 0.6 }} />
              <p style={{
                fontSize: '0.6rem', letterSpacing: '0.45em', textTransform: 'uppercase',
                color: '#E3B7A0', fontFamily: 'var(--font-sans)',
              }}>
                Koleksi Premium Hijab
              </p>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-in-up"
              style={{
                fontFamily: 'var(--font-heading)',
                color: '#FFFAF5',
                fontSize: 'clamp(2.8rem, 7vw, 5rem)',
                lineHeight: 1.08,
                fontWeight: 500,
                marginBottom: '1.5rem',
              }}
            >
              Tampil Anggun
              <br />
              <em style={{ color: '#E3B7A0' }}>Setiap Hari</em>
            </h1>

            <p
              className="animate-fade-in-up stagger-2"
              style={{
                fontSize: '0.9rem', color: 'rgba(237,205,187,0.75)',
                lineHeight: 1.85, marginBottom: '2.5rem', maxWidth: 440,
              }}
            >
              Koleksi hijab premium dengan bahan terpilih, desain elegan,
              dan nilai-nilai islami yang murni.
            </p>

            <div className="flex items-center gap-4 animate-fade-in-up stagger-3">
              <a
                href="#koleksi"
                style={{
                  display: 'inline-block',
                  padding: '0.85rem 2.2rem',
                  background: '#FFEDDB',
                  color: '#2C1810',
                  textDecoration: 'none',
                  fontSize: '0.68rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Lihat Koleksi
              </a>
              <a
                href="#tentang"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(227,183,160,0.7)',
                  textDecoration: 'none',
                }}
              >
                Tentang Kami →
              </a>
            </div>

          </div>

          {/* Stats row */}
          <div
            className="hidden md:flex items-center gap-14 mt-16 pt-8"
            style={{ borderTop: '1px solid rgba(227,183,160,0.12)' }}
          >
            {[['500+', 'Pelanggan Puas'], ['30+', 'Pilihan Warna'], ['100%', 'Bahan Premium']].map(([num, label]) => (
              <div key={label}>
                <p style={{ fontFamily: 'var(--font-heading)', color: '#E3B7A0', fontSize: '2.2rem', fontWeight: 600, lineHeight: 1 }}>
                  {num}
                </p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(237,205,187,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 5 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade ke background */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 120, background: 'linear-gradient(to top, #FFEDDB, transparent)' }}
        />
      </section>

      {/* ══════════════════════════════════════════════
          BANNER FITUR — horizontal strip gelap
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#2C1810' }}>
        <div
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4"
          style={{ borderBottom: '1px solid rgba(191,146,112,0.15)' }}
        >
          {[
            { icon: '◈', title: 'Bahan Premium', desc: 'Nyaman sepanjang hari' },
            { icon: '✦', title: 'Desain Elegan', desc: "Syar'i & stylish" },
            { icon: '❋', title: 'Gratis Ongkir', desc: 'Min. pembelian tertentu' },
            { icon: '◉', title: 'Produk Original', desc: 'Keaslian terjamin' },
          ].map((f, i) => (
            <div
              key={f.title}
              className="text-center"
              style={{
                padding: '2rem 1.2rem',
                borderRight: i < 3 ? '1px solid rgba(191,146,112,0.15)' : 'none',
              }}
            >
              <span style={{ display: 'block', color: '#BF9270', fontSize: '1.3rem', marginBottom: 10 }}>{f.icon}</span>
              <p style={{ fontFamily: 'var(--font-heading)', color: '#FFEDDB', fontSize: '0.88rem', marginBottom: 4 }}>
                {f.title}
              </p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(237,205,187,0.5)', lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          KOLEKSI
      ══════════════════════════════════════════════ */}
      <section id="koleksi" style={{ background: '#FFEDDB', padding: '5rem 1.5rem' }}>
        <div className="max-w-7xl mx-auto">

          {/* Header section */}
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10"
            style={{ borderBottom: '1px solid #EDCDBB', paddingBottom: '1.5rem' }}
          >
            <div>
              <p style={{
                fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase',
                color: '#BF9270', marginBottom: 6,
              }}>
                — Koleksi Kami —
              </p>
              <h2 style={{
                fontFamily: 'var(--font-heading)', color: '#2C1810',
                fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 500,
              }}>
                Semua Produk
              </h2>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="#BF9270" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="outline-none"
                style={{
                  paddingLeft: 34, paddingRight: 16, paddingTop: 9, paddingBottom: 9,
                  border: '1.5px solid #EDCDBB',
                  background: '#FFFAF5',
                  color: '#2C1810', fontSize: '0.83rem', width: 210,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#BF9270')}
                onBlur={e => (e.target.style.borderColor = '#EDCDBB')}
              />
            </div>
          </div>

          {/* Filter kategori — pill style */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-10">
              {['Semua', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.42rem 1.1rem',
                    background: activeCategory === cat ? '#2C1810' : 'transparent',
                    color: activeCategory === cat ? '#FFEDDB' : '#8B6652',
                    border: `1.5px solid ${activeCategory === cat ? '#2C1810' : '#EDCDBB'}`,
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    transition: 'all 0.18s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: '1.6rem', fontStyle: 'italic', marginBottom: 8 }}>
                {searchQuery ? 'Produk tidak ditemukan' : 'Koleksi segera hadir'}
              </p>
              <p style={{ fontSize: '0.83rem', color: '#8B6652' }}>
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Nantikan koleksi terbaru kami'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-7 md:gap-y-12">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              <p style={{ textAlign: 'right', marginTop: '2.5rem', fontSize: '0.7rem', color: '#BF9270', opacity: 0.7 }}>
                {filtered.length} dari {products.length} produk
              </p>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TENTANG KAMI
      ══════════════════════════════════════════════ */}
      <section id="tentang" style={{ background: '#2C1810', padding: '7rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#BF9270', marginBottom: 22 }}>
            Tentang Kami
          </p>
          <h2 style={{
            fontFamily: 'var(--font-heading)', color: '#FFEDDB',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.2,
          }}>
            Dihadirkan dengan Kasih
            <br />
            <em style={{ color: '#E3B7A0' }}>dan Keimanan</em>
          </h2>
          <p style={{ color: 'rgba(237,205,187,0.65)', lineHeight: 1.95, maxWidth: 520, margin: '0 auto 2.5rem', fontSize: '0.88rem' }}>
            Safiya Veil hadir untuk wanita muslimah yang ingin tampil elegan tanpa
            melupakan nilai-nilai syar&apos;i. Setiap produk kami dirancang dengan penuh
            kasih, menggunakan bahan berkualitas premium yang nyaman dipakai sepanjang hari.
          </p>
          <div style={{ width: 36, height: 1, background: '#BF9270', margin: '0 auto 1.5rem', opacity: 0.4 }} />
          <p style={{ fontFamily: 'var(--font-heading)', color: '#E3B7A0', fontSize: '1.05rem', fontStyle: 'italic' }}>
            &ldquo;Grace in Style, Pure in Faith&rdquo;
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONI
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#FFEDDB', padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#BF9270', marginBottom: 12 }}>
              Testimoni
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#2C1810', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 500 }}>
              Kata Mereka
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Aisyah N.', city: 'Jakarta', text: 'Kualitasnya melebihi ekspektasi! Bahannya adem banget, cocok untuk aktivitas seharian. Udah repeat order 3x.', rating: 5 },
              { name: 'Fatimah R.', city: 'Surabaya', text: 'Warnanya cantik banget dan foto sama aslinya sama persis. Packagingnya juga rapi dan ada parfum harumnya 😍', rating: 5 },
              { name: 'Zahra K.', city: 'Bandung', text: "Hijabnya syar'i tapi tetep stylish! Banyak dapat compliment dari temen-temen. Sangat recommended!", rating: 5 },
            ].map((t, i) => (
              <div
                key={i}
                className="animate-fade-in-up flex flex-col gap-4"
                style={{
                  background: '#FFFAF5',
                  padding: '1.75rem',
                  border: '1px solid #EDCDBB',
                  animationDelay: `${i * 0.1}s`,
                  animationFillMode: 'both',
                }}
              >
                <div className="flex gap-0.5">
                  {'★★★★★'.split('').slice(0, t.rating).map((_, si) => (
                    <span key={si} style={{ color: '#BF9270', fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#2C1810', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3" style={{ borderTop: '1px solid #EDCDBB', paddingTop: '1rem' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: '#EDCDBB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: 14 }}>{t.name[0]}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C1810' }}>{t.name}</p>
                    <p style={{ fontSize: '0.68rem', color: '#BF9270' }}>{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FLOATING CART
      ══════════════════════════════════════════════ */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.9rem 1.6rem',
              background: '#2C1810', color: '#FFEDDB',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(44,24,16,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', lineHeight: 1.3 }}>
                {cartCount} item
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', color: '#E3B7A0', fontSize: '0.9rem', lineHeight: 1.2 }}>
                {formatRupiah(cartTotal)}
              </p>
            </div>
          </button>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}