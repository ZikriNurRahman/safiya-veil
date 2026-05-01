'use client'
// src/app/login/page.tsx
// Halaman login untuk owner Safiya Veil
// Design: elegan, warm tone, minimalis

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Pesan error yang lebih ramah
      if (error.message.includes('Invalid login credentials')) {
        setError('Email atau password salah.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Login berhasil → ke dashboard admin
    router.replace('/admin')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFFBE9 0%, #E3CAA5 50%, #CEAB93 100%)' }}
    >
      {/* Decorative circles */}
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full opacity-20"
        style={{ background: '#AD8B73', transform: 'translate(30%, -30%)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: '#AD8B73', transform: 'translate(-30%, 30%)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo + branding */}
        <div className="text-center mb-10">
          {/* Logo ornament */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#AD8B73' }}>
              <span style={{ fontFamily: 'var(--font-heading)', color: '#FFFBE9', fontSize: '28px', fontStyle: 'italic' }}>
                S
              </span>
            </div>
          </div>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', letterSpacing: '0.05em' }}
          >
            Safiya Veil
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8C6E5A', fontStyle: 'italic' }}>
            Grace in Style, Pure in Faith
          </p>
          <div className="h-px mt-4 mx-auto w-16" style={{ background: '#AD8B73' }} />
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ background: 'rgba(255,251,233,0.85)', backdropFilter: 'blur(12px)', border: '1px solid #CEAB93' }}
        >
          <p className="text-xs font-semibold mb-6 text-center uppercase tracking-widest"
            style={{ color: '#8C6E5A' }}>
            Masuk sebagai Owner
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: '#8C6E5A' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@safiyaveil.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: '#FFFBE9',
                  border: '1.5px solid #CEAB93',
                  color: '#3D2B1F',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={e => e.target.style.borderColor = '#AD8B73'}
                onBlur={e => e.target.style.borderColor = '#CEAB93'}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: '#8C6E5A' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: '#FFFBE9',
                  border: '1.5px solid #CEAB93',
                  color: '#3D2B1F',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={e => e.target.style.borderColor = '#AD8B73'}
                onBlur={e => e.target.style.borderColor = '#CEAB93'}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: '#FDE8E8', border: '1px solid #F5A0A0', color: '#C0392B' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all"
              style={{
                background: loading ? '#CEAB93' : '#AD8B73',
                color: '#FFFBE9',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Link ke toko */}
        <p className="text-center mt-6 text-sm" style={{ color: '#8C6E5A' }}>
          <a
            href="/shop"
            className="hover:underline"
            style={{ color: '#AD8B73', fontWeight: 600 }}
          >
            ← Lihat Toko
          </a>
        </p>
      </div>
    </div>
  )
}