'use client'
// src/app/shop/cart/page.tsx
// Halaman keranjang terpisah + checkout dengan Midtrans

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { formatRupiah, generateOrderNumber } from '@/lib/utils'
import { toast } from 'sonner'
import type { OrderType, PaymentMethod, Product } from '@/types/database'

const COLOR_HEX: Record<string, string> = {
    'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
    'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
    'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
    'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
    'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
    'Lavender': '#B39DDB', 'Mustard': '#D4A017', 'Peach': '#FFAB91',
    'Oranye': '#E65100', 'Biru': '#1565C0',
}

export default function CartPage() {
    const router = useRouter()
    const {
        items, customerName, customerPhone, customerAddress,
        orderType, paymentMethod,
        decrementItem, setQuantity, removeItem, setItemColor,
        setCustomerName, setCustomerPhone, setCustomerAddress,
        setOrderType, setPaymentMethod,
        clearCart, getTotal, isReadyToCheckout,
    } = useCartStore()

    const [products, setProducts] = useState<Record<string, Product>>({}) // cache produk
    const [submitting, setSubmitting] = useState(false)
    const [successOrder, setSuccessOrder] = useState<{ number: string; payUrl?: string } | null>(null)

    const total = getTotal()

    // Fetch info produk untuk tampilkan pilihan warna
    useEffect(() => {
        const ids = [...new Set(items.map(i => i.productId))]
        if (ids.length === 0) return
        supabase.from('products').select('id, name, colors, color_stocks, image_url, color_images')
            .in('id', ids)
            .then(({ data }) => {
                if (!data) return
                const map: Record<string, Product> = {}
                data.forEach(p => { map[p.id] = p as Product })
                setProducts(map)
            })
    }, [items])

    // Checkout
    const handleCheckout = async () => {
        if (!isReadyToCheckout() || submitting) return
        setSubmitting(true)

        try {
            const orderNumber = generateOrderNumber()

            // 1. Insert order ke Supabase
            const { data: order, error: e1 } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    order_type: orderType,
                    total_price: total,
                    payment_method: paymentMethod,
                    status: 'PENDING_PAYMENT',
                    cash_received: 0,
                    notes: '',
                })
                .select()
                .single()

            if (e1) throw new Error(e1.message)

            // 2. Insert order items (notes berisi warna yang dipilih)
            const { error: e2 } = await supabase.from('order_items').insert(
                items.map(i => ({
                    order_id: order.id,
                    product_id: i.productId,
                    product_name: i.productName + (i.selectedColor ? ` (${i.selectedColor})` : ''),
                    unit_price: i.unitPrice,
                    quantity: i.quantity,
                    notes: i.selectedColor ?? '',
                }))
            )
            if (e2) throw new Error(e2.message)

            // 3. Buat Midtrans Snap Token
            const midtransRes = await fetch('/api/midtrans/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    orderNumber,
                    amount: total,
                    customerName,
                    customerPhone,
                    paymentMethod, // 'QRIS' | 'TRANSFER'
                    items: items.map(i => ({
                        id: i.productId,
                        name: i.productName + (i.selectedColor ? ` — ${i.selectedColor}` : ''),
                        price: i.unitPrice,
                        quantity: i.quantity,
                    })),
                }),
            })

            const midtransData = await midtransRes.json()
            if (!midtransRes.ok) throw new Error(midtransData.error ?? 'Midtrans error')

            clearCart()

            // 4. Redirect ke halaman Midtrans atau tampilkan sukses
            if (midtransData.payment_url) {
                setSuccessOrder({ number: orderNumber, payUrl: midtransData.payment_url })
            } else {
                setSuccessOrder({ number: orderNumber })
            }

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
            toast.error(`Gagal checkout: ${msg}`)
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '11px 14px', borderRadius: 12,
        border: '1.5px solid #E3CAA5', background: '#FFFBE9',
        color: '#3D2B1F', fontSize: 14, outline: 'none',
        fontFamily: 'var(--font-sans)',
    }

    // ── SUCCESS STATE ──
    if (successOrder) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center max-w-md mx-auto">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{ background: '#E3CAA5' }}>
                    <span className="text-4xl">✓</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', fontSize: '1.6rem', marginBottom: 8 }}>
                    Pesanan Dibuat!
                </h2>
                <p className="text-sm mb-1" style={{ color: '#8C6E5A' }}>Nomor pesanan kamu:</p>
                <p className="text-xl font-bold mb-4" style={{ color: '#AD8B73' }}>
                    {successOrder.number}
                </p>

                {successOrder.payUrl ? (
                    <div className="space-y-3 w-full">
                        <p className="text-sm" style={{ color: '#8C6E5A' }}>
                            Lanjutkan pembayaran:
                        </p>
                        <a
                            href={successOrder.payUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center"
                            style={{ background: '#AD8B73', color: '#FFFBE9' }}
                        >
                            Bayar Sekarang →
                        </a>
                    </div>
                ) : (
                    <p className="text-sm" style={{ color: '#8C6E5A' }}>
                        Tim kami akan menghubungi kamu untuk konfirmasi pembayaran.
                    </p>
                )}

                <button
                    onClick={() => router.push('/shop')}
                    className="mt-6 text-sm"
                    style={{ color: '#AD8B73' }}
                >
                    ← Lanjut Belanja
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', fontSize: '1.8rem' }}>
                    Keranjang Belanja
                </h1>
                <p className="text-sm mt-1" style={{ color: '#8C6E5A' }}>
                    {items.length === 0 ? 'Keranjang kosong' : `${items.length} item`}
                </p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-6xl mb-4">🛍️</p>
                    <p className="text-base font-semibold mb-2" style={{ color: '#3D2B1F' }}>
                        Keranjangmu masih kosong
                    </p>
                    <p className="text-sm mb-6" style={{ color: '#8C6E5A' }}>
                        Yuk, tambahkan produk yang kamu suka
                    </p>
                    <a
                        href="/shop"
                        className="inline-block px-6 py-3 rounded-xl text-sm font-semibold"
                        style={{ background: '#AD8B73', color: '#FFFBE9' }}
                    >
                        Lihat Koleksi
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ── DAFTAR ITEM ── */}
                    <div className="lg:col-span-3 space-y-4">
                        {items.map(item => {
                            const prod = products[item.productId]
                            const availableColors = prod?.colors ?? []
                            const colorStocks = prod?.color_stocks ?? []

                            return (
                                <div
                                    key={`${item.productId}-${item.selectedColor}`}
                                    className="rounded-2xl p-4 flex gap-4"
                                    style={{ background: '#FFFBE9', border: '1px solid #E3CAA5' }}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"
                                        style={{ background: '#E3CAA5' }}>
                                        {(() => {
                                            const imgUrl = item.selectedColor
                                                ? (prod?.color_images?.find(ci => ci.color === item.selectedColor)?.image_url ?? prod?.image_url)
                                                : prod?.image_url
                                            return imgUrl
                                                ? <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center">
                                                    <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: 24, fontStyle: 'italic' }}>S</span>
                                                </div>
                                        })()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: '#3D2B1F' }}>
                                            {item.productName}
                                        </p>

                                        {/* Pilih warna (kalau produk punya warna) */}
                                        {availableColors.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                                                {availableColors.map(color => {
                                                    const stock = colorStocks.find(cs => cs.color === color)?.stock ?? 0
                                                    return (
                                                        <button
                                                            key={color}
                                                            onClick={() => setItemColor(item.productId, item.selectedColor, color)}
                                                            disabled={stock === 0}
                                                            title={`${color} (stok: ${stock})`}
                                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
                                                            style={{
                                                                background: item.selectedColor === color ? '#AD8B73' : '#F5ECD8',
                                                                color: item.selectedColor === color ? '#FFFBE9' : '#8C6E5A',
                                                                opacity: stock === 0 ? 0.4 : 1,
                                                                cursor: stock === 0 ? 'not-allowed' : 'pointer',
                                                            }}
                                                        >
                                                            <span style={{
                                                                width: 8, height: 8, borderRadius: '50%',
                                                                background: COLOR_HEX[color] ?? '#AD8B73',
                                                                flexShrink: 0,
                                                            }} />
                                                            {color}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        <p className="text-xs mb-2" style={{ color: '#AD8B73' }}>
                                            {formatRupiah(item.unitPrice)}
                                        </p>

                                        {/* Qty controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decrementItem(item.productId, item.selectedColor)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                                                    style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                                                >−</button>
                                                <span className="w-6 text-center font-bold text-sm" style={{ color: '#3D2B1F' }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => setQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                                                    style={{ background: '#AD8B73', color: '#FFFBE9' }}
                                                >+</button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold" style={{ color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                                                    {formatRupiah(item.unitPrice * item.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.productId, item.selectedColor)}
                                                    className="text-xs px-2 py-1 rounded-lg"
                                                    style={{ background: '#F8D7DA', color: '#721C24' }}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        <a href="/shop" className="text-sm" style={{ color: '#AD8B73' }}>
                            ← Lanjut Belanja
                        </a>
                    </div>

                    {/* ── RINGKASAN & CHECKOUT ── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl p-5 space-y-4 sticky top-24"
                            style={{ background: '#FFFBE9', border: '1.5px solid #E3CAA5' }}>
                            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', fontSize: '1.1rem' }}>
                                Ringkasan Pesanan
                            </h2>

                            {/* Subtotal */}
                            <div className="space-y-1.5 pb-3" style={{ borderBottom: '1px dashed #E3CAA5' }}>
                                {items.map(i => (
                                    <div key={`${i.productId}-${i.selectedColor}`}
                                        className="flex justify-between text-xs" style={{ color: '#8C6E5A' }}>
                                        <span className="truncate pr-2 max-w-[150px]">
                                            {i.productName}{i.selectedColor ? ` (${i.selectedColor})` : ''} ×{i.quantity}
                                        </span>
                                        <span>{formatRupiah(i.unitPrice * i.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-baseline">
                                <span className="text-sm" style={{ color: '#8C6E5A' }}>Total</span>
                                <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: '1.4rem', fontWeight: 600 }}>
                                    {formatRupiah(total)}
                                </span>
                            </div>

                            {/* Form data diri */}
                            <div className="space-y-2.5">
                                <input placeholder="Nama lengkap *" value={customerName}
                                    onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
                                <input placeholder="Nomor WhatsApp *" value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)} style={inputStyle} />
                            </div>

                            {/* Order type */}
                            <div className="grid grid-cols-2 gap-2">
                                {(['PICKUP', 'DELIVERY'] as OrderType[]).map(v => (
                                    <button key={v} onClick={() => setOrderType(v)}
                                        className="py-2 rounded-xl text-xs font-semibold"
                                        style={{
                                            background: orderType === v ? '#3D2B1F' : '#F5ECD8',
                                            color: orderType === v ? '#FFFBE9' : '#8C6E5A',
                                        }}>
                                        {v === 'PICKUP' ? '🏪 Ambil' : '🚚 Dikirim'}
                                    </button>
                                ))}
                            </div>

                            {orderType === 'DELIVERY' && (
                                <textarea
                                    placeholder="Alamat pengiriman *"
                                    value={customerAddress}
                                    onChange={e => setCustomerAddress(e.target.value)}
                                    rows={2}
                                    style={{ ...inputStyle, resize: 'none' }}
                                />
                            )}

                            {/* Payment method — HANYA QRIS dan TRANSFER */}
                            <div className="grid grid-cols-2 gap-2">
                                {(['QRIS', 'TRANSFER'] as PaymentMethod[]).map(m => (
                                    <button key={m} onClick={() => setPaymentMethod(m)}
                                        className="py-2.5 rounded-xl text-xs font-semibold"
                                        style={{
                                            background: paymentMethod === m ? '#AD8B73' : '#F5ECD8',
                                            color: paymentMethod === m ? '#FFFBE9' : '#8C6E5A',
                                        }}>
                                        {m === 'QRIS' ? '📱 QRIS' : '🏦 Bank Transfer'}
                                    </button>
                                ))}
                            </div>

                            {/* Tombol checkout */}
                            <button
                                onClick={handleCheckout}
                                disabled={!isReadyToCheckout() || submitting}
                                className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide"
                                style={{
                                    background: isReadyToCheckout() && !submitting ? '#3D2B1F' : '#E3CAA5',
                                    color: isReadyToCheckout() && !submitting ? '#FFFBE9' : '#8C6E5A',
                                    cursor: !isReadyToCheckout() || submitting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {submitting ? 'Memproses...' : `🔒 Bayar ${formatRupiah(total)}`}
                            </button>

                            <p className="text-xs text-center" style={{ color: '#CEAB93' }}>
                                Pembayaran aman via Midtrans
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}