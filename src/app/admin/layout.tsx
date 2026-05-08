'use client'
// src/app/admin/layout.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/admin/Sidebar'


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [ownerName, setOwnerName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFBE9' }}>
      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen"
        style={{ background: '#FFFBE9', borderRight: '1px solid #E3CAA5' }}
      >
        <Sidebar SidebarOpen={setSidebarOpen} ownerName={ownerName} handleSignOut={handleSignOut} />

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
        <Sidebar SidebarOpen={setSidebarOpen} ownerName={ownerName} handleSignOut={handleSignOut} />

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