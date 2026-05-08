'use client'

import Link from 'next/link'
import { useState } from 'react'

export const NAV_LINKS = [
    { label: 'Beranda', href: '/shop#beranda' },
    { label: 'Koleksi', href: '/shop#koleksi' },
    { label: 'Tentang', href: '/shop#tentang' },
]

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    return (
        <header
            className="sticky top-0 z-40"
            style={{
                background: 'var(--brand-primary)',
                boxShadow: 'var(--shadow-nav)',
            }}
        >
            {/* Progressive height: 64px → 72px → 83px (md) → 99px (lg) */}
            <div
                className="relative max-w-7xl mx-auto px-5 flex items-center justify-between"
                style={{ height: 'clamp(64px, 8vw, 83px)' }}
            >

                {/* ─ Nav kiri — desktop ─ */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.label}
                            href={l.href}
                            style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                letterSpacing: 'var(--tracking-caps)',
                                textTransform: 'uppercase',
                                color: 'var(--text-dark)',
                                textDecoration: 'none',
                                opacity: 0.8,
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* ─ Mobile burger ─ */}
                <button
                    className="md:hidden flex items-center justify-center p-1"
                    onClick={() => setMobileOpen(v => !v)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--brand-dark)', fontSize: '1.2rem', padding: 4,
                    }}
                    aria-label="Menu"
                >
                    {mobileOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
                        </svg>
                    )}
                </button>

                {/* ─ BRAND — absolute center (analog Starbucks wordmark) ─ */}
                <Link
                    href="/shop"
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ textDecoration: 'none', textAlign: 'center', userSelect: 'none' }}
                >
                    {/* Ornamen */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
                        <div style={{ width: 18, height: 1, background: 'var(--brand-accent)', opacity: 0.5 }} />
                        <div
                            style={{
                                width: 6, height: 6, borderRadius: '50%',
                                border: '1px solid var(--brand-accent)',
                                opacity: 0.6,
                            }}
                        />
                        <div style={{ width: 18, height: 1, background: 'var(--brand-accent)', opacity: 0.5 }} />
                    </div>

                    {/* Brand name */}
                    <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        fontWeight: 600,
                        color: 'var(--brand-dark)',
                        letterSpacing: '0.16em',
                        lineHeight: 1,
                    }}>
                        SAFIYA VEIL
                    </div>

                    {/* Tagline */}
                    <div style={{
                        fontSize: '0.48rem',
                        letterSpacing: 'var(--tracking-wide)',
                        textTransform: 'uppercase',
                        color: 'var(--brand-accent)',
                        marginTop: 3,
                        opacity: 0.85,
                    }}>
                        Grace in Style, Pure in Faith
                    </div>
                </Link>

                {/* ─ Aksi kanan ─ */}
                <div className="flex items-center gap-5">
                    {/* Cart icon — menuju /shop/cart */}
                    <Link
                        href="/shop/cart"
                        style={{
                            color: 'var(--brand-dark)', opacity: 0.75,
                            display: 'flex', transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
                        aria-label="Keranjang"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ─ Mobile menu dropdown ─ */}
            <div
                className="md:hidden overflow-hidden"
                style={{
                    maxHeight: mobileOpen ? 240 : 0,
                    transition: 'max-height var(--duration-base) var(--ease-expander)',
                    background: 'var(--brand-primary)',
                    borderTop: mobileOpen ? '1px solid var(--brand-secondary)' : 'none',
                }}
            >
                <nav style={{ padding: '1.5rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.label}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                fontSize: '0.82rem', fontWeight: 600,
                                letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase',
                                color: 'var(--brand-dark)', textDecoration: 'none', opacity: 0.8,
                            }}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}