'use client'

import { formatRupiah } from '@/lib/utils'

interface FloatingCartProps {
    cartCount: number
    cartTotal: number
    setCartOpen: (open: boolean) => void
}

export function FloatingCart({ cartCount, cartTotal, setCartOpen }: FloatingCartProps) {
    if (cartCount === 0) return null

    return (
        <>
            {/* Extended pill info — muncul di kanan frap untuk desktop */}
            <div
                className="fixed hidden md:flex items-center gap-3 animate-fade-in"
                style={{
                    bottom: '1.5rem',
                    right: 'calc(var(--frap-size) + 1.5rem + 0.75rem)',
                    background: 'var(--brand-dark)',
                    color: 'var(--brand-white)',
                    padding: '0.55rem 1.25rem 0.55rem 1rem',
                    borderRadius: 50,
                    boxShadow: 'var(--shadow-card)',
                    pointerEvents: 'none',
                    animationDuration: '0.4s',
                    animationFillMode: 'both',
                }}
            >
                <div>
                    <p style={{ fontSize: '0.58rem', letterSpacing: 'var(--tracking-caps)', opacity: 0.7, textTransform: 'uppercase' }}>
                        {cartCount} item
                    </p>
                    <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-tertiary)', fontSize: '0.9rem', lineHeight: 1.2 }}>
                        {formatRupiah(cartTotal)}
                    </p>
                </div>
            </div>

            {/* Frap button — circular 56px */}
            <button
                className="frap animate-fade-in"
                onClick={() => setCartOpen(true)}
                aria-label={`Keranjang — ${cartCount} item`}
                title={`${cartCount} item · ${formatRupiah(cartTotal)}`}
                style={{ animationDuration: '0.3s', animationFillMode: 'both' }}
            >
                {/* Badge count */}
                <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--brand-dark)', color: 'var(--brand-white)',
                    fontSize: '0.55rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--brand-white)',
                }}>
                    {cartCount > 9 ? '9+' : cartCount}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                </svg>
            </button>
        </>
    )
}