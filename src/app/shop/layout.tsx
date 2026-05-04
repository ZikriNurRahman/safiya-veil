// src/app/shop/layout.tsx
// Layout toko — lozy.id style:
// • Announcement bar scrolling
// • Header centered logo, nav kiri, aksi kanan
// • Footer dinamis

import { ShopFooter } from '@/components/shop/ShopFooter'
import Link from 'next/link'

const ANNOUNCEMENTS = [
  '✦ Gratis ongkir min. pembelian Rp 150.000',
  '✦ Bahan premium pilihan, nyaman sepanjang hari',
  '✦ NEW ARRIVAL — Koleksi terbaru sudah tersedia!',
  '✦ Pesan via WhatsApp tersedia 24 jam',
]

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFEDDB' }}>

      {/* ─────────────── ANNOUNCEMENT BAR ─────────────── */}
      <div
        className="overflow-hidden"
        style={{ background: '#2C1810', height: 34, display: 'flex', alignItems: 'center' }}
      >
        <div className="marquee-track">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((txt, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#EDCDBB',
                padding: '0 2.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              {txt}
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────── HEADER ─────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{ background: '#FFEDDB', borderBottom: '1px solid #EDCDBB' }}
      >
        <div
          className="relative max-w-7xl mx-auto px-5 flex items-center justify-between"
          style={{ height: 66 }}
        >
          {/* Nav kiri — desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Beranda', href: '/shop' },
              { label: 'Koleksi', href: '/shop#koleksi' },
              { label: 'Tentang', href: '/shop#tentang' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={navStyle}>{l.label}</Link>
            ))}
          </nav>

          {/* Mobile: burger */}
          <div className="md:hidden" style={{ color: '#2C1810', fontSize: '1.3rem', cursor: 'pointer' }}>
            &#9776;
          </div>

          {/* Logo — tengah absolut */}
          <Link href="/shop" className="absolute left-1/2 -translate-x-1/2" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 600, color: '#2C1810', letterSpacing: '0.14em', lineHeight: 1 }}>
              SAFIYA VEIL
            </div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#BF9270', marginTop: 4 }}>
              Grace in Style, Pure in Faith
            </div>
          </Link>

          {/* Aksi kanan */}
          <div className="flex items-center gap-4">


            {/* ← Cart button: ganti div kosong jadi Link ke /shop/cart */}
            <Link href="/shop/cart" style={{ position: 'relative', color: '#2C1810', display: 'flex', alignItems: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────── CONTENT ─────────────── */}
      <main className="flex-1">{children}</main>

      {/* ─────────────── FOOTER ─────────────── */}
      <ShopFooter />

      {/* Admin link tersembunyi */}
      <a
        href="/login"
        className="fixed bottom-3 left-3 z-10 opacity-0 hover:opacity-25 transition-opacity select-none text-xs"
        style={{ color: '#BF9270' }}
        title="Admin"
      >⚙</a>
    </div>
  )
}

const navStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#2C1810',
  textDecoration: 'none',
  fontWeight: 500,
}