'use client'
// src/app/shop/[productId]/page.tsx
// Halaman detail produk — palette baru + clean layout

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart.store'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product } from '@/types/database'

const COLOR_HEX: Record<string, string> = {
    'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
    'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
    'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
    'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
    'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
    'Lavender': '#B39DDB', 'Mustard': '#BF9270', 'Peach': '#FFAB91',
    'Oranye': '#E65100', 'Biru': '#1565C0',
}

// Taruh di atas fungsi ProductDetailPage
function CartFloating() {
    const items = useCartStore(s => s.items)
    const total = useCartStore(s => s.getTotal())
    const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

    if (cartCount === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-30">
            <a
                href="/shop/cart"
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.9rem 1.6rem',
                    background: '#2C1810', color: '#FFEDDB',
                    textDecoration: 'none',
                    boxShadow: '0 8px 32px rgba(44,24,16,0.3)',
                    transition: 'transform 0.2s',
                }}
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
                        {formatRupiah(total)}
                    </p>
                </div>
            </a>
        </div>
    )
}

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const router = useRouter()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedColor, setSelectedColor] = useState<string | undefined>()
    const [activeImage, setActiveImage] = useState<string | null>(null)

    const addItem = useCartStore(s => s.addItem)
    const cartItems = useCartStore(s => s.items)

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from('products').select('*').eq('id', productId).single()

            if (error || !data) { setLoading(false); return }
            const p = data as Product
            setProduct(p)

            const firstColor = p.color_stocks?.find(cs => cs.stock > 0)?.color ?? p.colors?.[0]
            setSelectedColor(firstColor)

            const defaultImg = p.color_images?.find(ci => ci.color === (firstColor ?? ''))?.image_url ?? p.image_url
            setActiveImage(defaultImg ?? null)
            setLoading(false)
        }
        fetchProduct()
    }, [productId])

    const handleSelectColor = (color: string) => {
        setSelectedColor(color)
        const img = product?.color_images?.find(ci => ci.color === color)?.image_url ?? product?.image_url
        if (img) setActiveImage(img)
    }

    const handleAddToCart = () => {
        if (!product) return
        addItem(product, selectedColor)
        toast.success(`${product.name}${selectedColor ? ` — ${selectedColor}` : ''} ditambahkan!`)
    }

    const selectedStock = product?.color_stocks?.find(cs => cs.color === selectedColor)?.stock ?? product?.stock ?? 0
    const inCart = cartItems.some(i => i.productId === product?.id && i.selectedColor === selectedColor)

    if (loading) return (
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="skeleton" style={{ aspectRatio: '3/4' }} />
            <div className="space-y-4 pt-4">
                {[['80%', 28], ['100%', 16], ['60%', 20]].map(([w, h], i) => (
                    <div key={i} className="skeleton rounded" style={{ width: w, height: h }} />
                ))}
            </div>
        </div>
    )

    if (!product) return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
            <p style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</p>
            <p style={{ fontFamily: 'var(--font-heading)', color: '#2C1810', fontSize: '1.2rem', marginBottom: 16 }}>
                Produk tidak ditemukan
            </p>
            <button
                onClick={() => router.back()}
                style={{ fontSize: '0.8rem', color: '#BF9270', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                ← Kembali ke Koleksi
            </button>
        </div>
    )

    const allImages = [
        ...(product.image_url ? [{ color: null as string | null, url: product.image_url }] : []),
        ...(product.color_images ?? []).map(ci => ({ color: ci.color as string | null, url: ci.image_url })),
    ]

    return (
        <div style={{ background: '#FFEDDB', minHeight: '80vh' }}>
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-10" style={{ fontSize: '0.68rem', color: '#8B6652' }}>
                    <a href="/shop" style={{ color: '#BF9270', textDecoration: 'none' }}>Koleksi</a>
                    <span style={{ opacity: 0.4 }}>›</span>
                    <span>{product.category}</span>
                    <span style={{ opacity: 0.4 }}>›</span>
                    <span style={{ color: '#2C1810' }}>{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* ── Gallery ── */}
                    <div>
                        {/* Gambar utama */}
                        <div
                            className="overflow-hidden"
                            style={{ aspectRatio: '3/4', background: '#EDCDBB' }}
                        >
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-all duration-400"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #EDCDBB, #E3B7A0)' }}
                                >
                                    <span style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: 56, fontStyle: 'italic', opacity: 0.3 }}>
                                        S
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(img.url)}
                                        className="shrink-0 overflow-hidden"
                                        style={{
                                            width: 64, height: 64,
                                            border: activeImage === img.url ? '2px solid #BF9270' : '2px solid transparent',
                                            background: '#EDCDBB',
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Info Produk ── */}
                    <div style={{ paddingTop: 8 }}>

                        {/* Kategori */}
                        <span style={{
                            display: 'inline-block',
                            fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase',
                            color: '#BF9270', marginBottom: 16,
                        }}>
                            {product.category}
                        </span>

                        {/* Nama */}
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            color: '#2C1810',
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                            fontWeight: 500, lineHeight: 1.15, marginBottom: 16,
                        }}>
                            {product.name}
                        </h1>

                        {/* Harga */}
                        <p style={{
                            fontFamily: 'var(--font-heading)',
                            color: '#BF9270', fontSize: '1.85rem', fontWeight: 600, marginBottom: 20,
                        }}>
                            {formatRupiah(product.price)}
                        </p>

                        {/* Divider */}
                        <div style={{ height: 1, background: '#EDCDBB', marginBottom: 20 }} />

                        {/* Deskripsi */}
                        {product.description && (
                            <p style={{ fontSize: '0.85rem', color: '#8B6652', lineHeight: 1.85, marginBottom: 24 }}>
                                {product.description}
                            </p>
                        )}

                        {/* Pilih Warna */}
                        {product.colors && product.colors.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <p style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8B6652', marginBottom: 12 }}>
                                    Warna{selectedColor && <span style={{ color: '#BF9270', marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>— {selectedColor}</span>}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map(color => {
                                        const stock = product.color_stocks?.find(cs => cs.color === color)?.stock ?? product.stock
                                        const isOut = stock === 0
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => !isOut && handleSelectColor(color)}
                                                title={`${color}${isOut ? ' — habis' : ''}`}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    padding: '0.42rem 0.9rem',
                                                    background: selectedColor === color ? '#2C1810' : 'transparent',
                                                    color: selectedColor === color ? '#FFEDDB' : isOut ? '#BF9270' : '#2C1810',
                                                    border: `1.5px solid ${selectedColor === color ? '#2C1810' : '#EDCDBB'}`,
                                                    cursor: isOut ? 'not-allowed' : 'pointer',
                                                    opacity: isOut ? 0.45 : 1,
                                                    fontSize: '0.75rem',
                                                    textDecoration: isOut ? 'line-through' : 'none',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                <span style={{
                                                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                                    background: COLOR_HEX[color] ?? '#BF9270',
                                                    border: color === 'Putih' ? '1px solid #EDCDBB' : undefined,
                                                }} />
                                                {color}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Status stok */}
                        <div className="flex items-center gap-2" style={{ marginBottom: 24 }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: selectedStock > 5 ? '#2E7D32' : selectedStock > 0 ? '#E67E22' : '#C0392B',
                            }} />
                            <p style={{ fontSize: '0.73rem', color: '#8B6652' }}>
                                {selectedStock === 0 ? 'Stok habis' : selectedStock <= 5 ? `Sisa ${selectedStock} pcs` : 'Tersedia'}
                            </p>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex gap-3" style={{ marginBottom: 24 }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={!product.is_available || selectedStock === 0}
                                style={{
                                    flex: 1, padding: '1rem',
                                    background: !product.is_available || selectedStock === 0 ? '#EDCDBB' : '#2C1810',
                                    color: !product.is_available || selectedStock === 0 ? '#8B6652' : '#FFEDDB',
                                    border: 'none',
                                    cursor: !product.is_available || selectedStock === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {inCart ? '✓ Sudah di Keranjang' : '+ Tambah ke Keranjang'}
                            </button>
                            {inCart && (
                                <a
                                    href="/shop/cart"
                                    style={{
                                        padding: '1rem 1.25rem',
                                        background: '#BF9270', color: '#FFEDDB',
                                        textDecoration: 'none',
                                        fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                                    }}
                                >
                                    Keranjang
                                </a>
                            )}
                        </div>

                        {/* Info tambahan */}
                        <div style={{ borderTop: '1px solid #EDCDBB', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                ['🚚', 'Pengiriman ke seluruh Indonesia'],
                                ['✅', 'Produk original bergaransi'],
                                ['📦', 'Dikemas dengan aman & rapi'],
                            ].map(([icon, text]) => (
                                <p key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem', color: '#8B6652' }}>
                                    <span>{icon}</span><span>{text}</span>
                                </p>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            {/* Floating cart button — muncul kalau ada item */}
            <CartFloating />
        </div>
    )
}