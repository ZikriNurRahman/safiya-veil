'use client'

import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'
import { COLOR_HEX } from '@/lib/constant'
import { FeatureBand } from './FeatureBand'
import Link from 'next/link'

interface ProductInfoProps {
    product: Product
    selectedColor: string | undefined
    selectedStock: number
    canAdd: boolean | undefined
    inCart: boolean
    btnPressed: boolean
    handleSelectColor: (color: string) => void
    handleAddToCart: () => void
}

export function ProductInfo({
    product, selectedColor, selectedStock, canAdd, inCart, btnPressed, handleSelectColor, handleAddToCart
}: ProductInfoProps) {
    return (
        <div style={{ paddingTop: 4 }}>
            {/* Kategori label */}
            <span style={{
                display: 'inline-block', fontSize: '0.55rem', fontWeight: 700,
                letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase',
                color: 'var(--brand-accent)', marginBottom: 12,
            }}>
                {product.category}
            </span>

            {/* Nama produk */}
            <h1 style={{
                fontFamily: 'var(--font-heading)', color: 'var(--brand-dark)',
                fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 500,
                letterSpacing: '-0.02em', lineHeight: 1.12, marginBottom: 16,
            }}>
                {product.name}
            </h1>

            {/* Harga */}
            <p style={{
                fontFamily: 'var(--font-heading)', color: 'var(--brand-accent)',
                fontSize: '1.9rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 20,
            }}>
                {formatRupiah(product.price)}
            </p>

            <div style={{ height: 1, background: 'var(--brand-secondary)', marginBottom: 20 }} />

            {/* Deskripsi */}
            {product.description && (
                <p style={{
                    fontSize: '0.85rem', color: 'var(--brand-muted)', lineHeight: 1.85,
                    letterSpacing: 'var(--tracking-tight)', marginBottom: 24,
                }}>
                    {product.description}
                </p>
            )}

            {/* Pilih Warna */}
            {product.colors && product.colors.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <p style={{
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: 'var(--tracking-caps)',
                        textTransform: 'uppercase', color: 'var(--brand-muted)', marginBottom: 12,
                    }}>
                        Pilih Warna
                        {selectedColor && (
                            <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--brand-accent)', textTransform: 'none', letterSpacing: 0 }}>
                                — {selectedColor}
                            </span>
                        )}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {product.colors.map(color => {
                            const stock = product.color_stocks?.find(cs => cs.color === color)?.stock ?? product.stock
                            const isOut = stock === 0
                            const isActive = selectedColor === color
                            return (
                                <button
                                    key={color}
                                    onClick={() => !isOut && handleSelectColor(color)}
                                    title={`${color}${isOut ? ' — habis' : ''}`}
                                    style={{
                                        display: isOut ? 'none' : 'flex', alignItems: 'center', gap: 7,
                                        padding: '0.45rem 0.85rem', borderRadius: 50,
                                        background: isActive ? 'var(--brand-dark)' : 'transparent',
                                        color: isActive ? 'var(--text-light)' : isOut ? 'var(--brand-muted)' : 'var(--brand-dark)',
                                        border: isActive ? '1.5px solid var(--brand-dark)' : '1.5px solid var(--brand-secondary)',
                                        cursor: isOut ? 'not-allowed' : 'pointer',
                                        opacity: isOut ? 0.4 : 1, fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                                        letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-sans)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span style={{
                                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                        background: COLOR_HEX[color] ?? 'var(--brand-accent)',
                                        border: color === 'Putih' ? '1px solid var(--brand-secondary)' : undefined,
                                        boxShadow: isActive ? '0 0 0 1.5px var(--brand-white)' : undefined,
                                    }} />
                                    {color}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stok status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: selectedStock > 5 ? '#2E7D32' : selectedStock > 0 ? '#E67E22' : '#C0392B',
                }} />
                <p style={{ fontSize: '0.72rem', color: 'var(--brand-muted)', letterSpacing: 'var(--tracking-tight)' }}>
                    {selectedStock === 0 ? 'Stok habis' : selectedStock <= 5 ? `Sisa ${selectedStock} pcs` : 'Tersedia'}
                </p>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {canAdd && (
                    <button
                        onClick={handleAddToCart}
                        className="btn-dark"
                        style={{ flex: 1, background: btnPressed ? 'var(--brand-accent)' : inCart ? 'var(--brand-accent)' : undefined }}
                    >
                        {btnPressed ? '✓ Ditambahkan' : inCart ? '✓ Sudah di Keranjang' : '+ Tambah ke Keranjang'}
                    </button>
                )}
                {inCart && (
                    // 🔥 PERBAIKAN: Gunakan <Link> dari Next.js, bukan tag <a>
                    <Link href="/shop/cart" className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                        Lihat Keranjang
                    </Link>
                )}
            </div>

            <FeatureBand />
        </div>
    )
}