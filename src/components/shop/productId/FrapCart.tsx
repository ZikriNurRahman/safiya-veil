'use client'

import { useCartStore } from '@/store/cart.store'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'

export function FrapCart() {
    const items = useCartStore(s => s.items)
    const total = useCartStore(s => s.getTotal())
    const count = items.reduce((s, i) => s + i.quantity, 0)
    if (count === 0) return null
    return (
        <Link
            href="/shop/cart"
            className="frap animate-fade-in"
            style={{ textDecoration: 'none', animationFillMode: 'both', animationDuration: '0.3s' }}
            title={`${count} item · ${formatRupiah(total)}`}
        >
            {count > 0 && (
                <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--brand-dark)', color: 'var(--brand-white)',
                    fontSize: '0.55rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--brand-white)',
                }}>
                    {count > 9 ? '9+' : count}
                </span>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
            </svg>
        </Link>
    )
}