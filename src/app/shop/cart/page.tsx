'use client'
// src/app/shop/cart/page.tsx

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

// Import Otak Logika & Komponen UI
import { useCheckout } from '@/hooks/useCheckout'
import { CartItemList } from '@/components/shop/cart/CartItemList'
import { CartSummary } from '@/components/shop/cart/CartSummary'
import { CheckoutSuccess } from '@/components/shop/cart/CheckoutSuccess'

export default function CartPage() {
    // 1. Panggil Otak Logika Checkout yang sudah kita pisah
    const { handleCheckout, submitting, successOrder } = useCheckout()

    // 2. Tarik fungsi & data UI dari Store
    const {
        items, customerName, customerPhone, customerAddress,
        orderType, paymentMethod,
        decrementItem, setQuantity, removeItem, setItemColor,
        setCustomerName, setCustomerPhone, setCustomerAddress,
        setOrderType, setPaymentMethod,
        getTotal, isReadyToCheckout,
    } = useCartStore()

    const [products, setProducts] = useState<Record<string, Product>>({})
    const total = getTotal()

    // 3. Fetch info produk (hanya untuk baca gambar & sisa stok)
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

    // ── LAYAR SUKSES ──
    if (successOrder) {
        return <CheckoutSuccess successOrder={successOrder} />
    }

    // ── LAYAR KERANJANG UTAMA ──
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
                    <p className="text-base font-semibold mb-2" style={{ color: '#3D2B1F' }}>Keranjangmu masih kosong</p>
                    <p className="text-sm mb-6" style={{ color: '#8C6E5A' }}>Yuk, tambahkan produk yang kamu suka</p>
                    <a href="/shop" className="inline-block px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: '#AD8B73', color: '#FFFBE9' }}>
                        Lihat Koleksi
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* BAGIAN KIRI: DAFTAR ITEM */}
                    <CartItemList
                        items={items}
                        products={products}
                        setItemColor={setItemColor}
                        decrementItem={decrementItem}
                        setQuantity={setQuantity}
                        removeItem={removeItem}
                    />

                    {/* BAGIAN KANAN: RINGKASAN & FORM */}
                    <CartSummary
                        items={items}
                        total={total}
                        customerName={customerName} setCustomerName={setCustomerName}
                        customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
                        customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
                        orderType={orderType} setOrderType={setOrderType}
                        paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                        isReadyToCheckout={isReadyToCheckout}
                        submitting={submitting}
                        handleCheckout={handleCheckout}
                    />
                </div>
            )}
        </div>
    )
}