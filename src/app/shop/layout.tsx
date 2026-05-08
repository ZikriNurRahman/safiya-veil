'use client'
// src/app/shop/layout.tsx

import { ShopFooter } from '@/components/shop/ShopFooter'
import { Announcement } from '@/components/shop/Announcement'
import { Header } from '@/components/shop/Header'
import Link from 'next/link'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--brand-primary)' }}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <Announcement />

      {/* ── HEADER — whisper nav shadow, centered brand ── */}
      <Header />

      {/* ── CONTENT ── */}
      <main className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <ShopFooter />

      {/* Admin link tersembunyi */}
      <Link
        href="/login"
        className="fixed bottom-3 left-3 z-10 select-none"
        style={{ color: 'var(--brand-accent)', opacity: 0, transition: 'opacity 0.2s', fontSize: '0.7rem' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.35')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        title="Admin"
      >⚙</Link>
    </div>
  )
}