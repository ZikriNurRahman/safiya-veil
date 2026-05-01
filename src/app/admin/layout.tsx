'use client'
// src/app/admin/layout.tsx
// Layout halaman admin — hanya bisa diakses owner
// Berisi sidebar navigasi dan header

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin',          label: 'Dashboard',  icon: '📊' },
  { href: '/admin/products', label: 'Produk',     icon: '🧕' },
  { href: '/admin/orders',   label: 'Pesanan',    icon: '📦' },
  { href: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  const [ownerName,    setOwnerName]    = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(false) // untuk mobile

  useEffect(() => {
    const fetchOwner = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('display_name').eq('id', user.id).single()
      setOwnerName(profile?.display_name || user.email?.split('@')[0] || 'Owner')
    }
    fetchOwner()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 shrink-0" style={{ borderBottom: '1px solid #E3CAA5' }}>
        <div
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
        >
          Safiya Veil
        </div>
        <div className="text-xs mt-0.5 italic" style={{ color: '#8C6E5A' }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          // Halaman dashboard match persis /admin saja
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? '#AD8B73' : 'transparent',
                color: isActive ? '#FFFBE9' : '#8C6E5A',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #E3CAA5' }}>
        <div className="text-xs font-semibold mb-0.5" style={{ color: '#3D2B1F' }}>
          {ownerName}
        </div>
        <div className="text-xs mb-3" style={{ color: '#CEAB93' }}>👑 Owner</div>

        <div className="flex gap-2">
          <Link
            href="/shop"
            className="flex-1 py-1.5 rounded-lg text-xs text-center font-medium transition-colors"
            style={{ background: '#E3CAA5', color: '#3D2B1F' }}
          >
            Lihat Toko
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: '#F5ECD8', color: '#8C6E5A' }}
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFBE9' }}>
      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen"
        style={{ background: '#FFFBE9', borderRight: '1px solid #E3CAA5' }}
      >
        {sidebarContent}
      </aside>

      {/* ── SIDEBAR MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(61,43,31,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR MOBILE DRAWER ── */}
      <aside
        className="fixed left-0 top-0 h-full w-56 z-50 flex flex-col transition-transform duration-300 lg:hidden"
        style={{
          background: '#FFFBE9',
          borderRight: '1px solid #E3CAA5',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── KONTEN UTAMA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header
          className="lg:hidden px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30"
          style={{ background: '#FFFBE9', borderBottom: '1px solid #E3CAA5' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ background: '#E3CAA5' }}
          >
            ☰
          </button>
          <span
            className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            Safiya Veil Admin
          </span>
          <div className="w-8" /> {/* spacer */}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  )
}