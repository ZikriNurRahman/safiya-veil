'use client'
// src/app/admin/pos/page.tsx

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Import Logika POS & Komponen UI
import { usePOSCheckout } from '@/hooks/usePOSCheckout'
import { POSSuccess } from '@/components/admin/pos/POSSuccess'
import { POSForm } from '@/components/admin/pos/POSForm'
import { POSCart } from '@/components/admin/pos/POSCart'

export default function ManualSalePage() {
    const [products, setProducts] = useState<any[]>([])

    // Panggil Otak Logika POS
    const { processSale, loading, successOrder, resetPOS } = usePOSCheckout()

    // Form State
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [selectedProductId, setSelectedProductId] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [qty, setQty] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH')

    // Cart Offline State
    const [cart, setCart] = useState<any[]>([])

    // 🔥 2. Fungsi untuk mengubah harga secara manual di keranjang POS
    const handleUpdatePrice = (id: number, newPrice: number) => {
        setCart(cart.map(item => item.id === id ? { ...item, price: newPrice } : item))
    }

    // Ambil data produk saat halaman dimuat
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('*').eq('is_available', true)
            if (data) setProducts(data)
        }
        fetchProducts()
    }, [])

    const activeProduct = products.find(p => p.id === selectedProductId)

    const currentStock = (() => {
        if (!activeProduct) return 0
        if (selectedColor && activeProduct.color_stocks) {
            const variant = activeProduct.color_stocks.find((cs: any) => cs.color === selectedColor)
            return variant ? variant.stock : 0
        }
        return activeProduct.stock || 0
    })()

    const currentInCart = cart
        .filter(c => c.product_id === selectedProductId && c.color === selectedColor)
        .reduce((sum, item) => sum + item.qty, 0)

    const addToCart = () => {
        if (!activeProduct) return toast.error('Pilih produk dulu!')
        if (activeProduct.color_stocks?.length > 0 && !selectedColor) {
            return toast.error('Pilih warna varian terlebih dahulu!')
        }
        if (qty + currentInCart > currentStock) {
            return toast.error(`Stok tidak cukup! Anda hanya bisa menambah ${currentStock - currentInCart} pcs lagi.`)
        }

        const newItem = {
            id: Date.now(),
            product_id: activeProduct.id,
            name: activeProduct.name,
            price: activeProduct.price,
            color: selectedColor,
            qty: qty
        }
        setCart([...cart, newItem])
        toast.success('Ditambahkan ke daftar!')

        // Reset pilihan
        setSelectedProductId('')
        setSelectedColor('')
        setQty(1)
    }

    // Eksekusi fungsi processSale dari Custom Hook
    const handleProcessSale = () => {
        processSale({
            cart,
            customerName,
            paymentMethod,
            customerPhone,
            onSuccess: () => {
                setCart([])
                setCustomerName('')
                setCustomerPhone('')
            }
        })
    }

    const handleResetPOS = () => {
        resetPOS()
        setPaymentMethod('CASH')
    }

    // ── LAYAR SUKSES ──
    if (successOrder) {
        return <POSSuccess successOrder={successOrder} onReset={handleResetPOS} />
    }

    // ── LAYAR UTAMA (POS) ──
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6" style={{ color: '#3D2B1F' }}>Penjualan Offline</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* KOLOM KIRI */}
                <POSForm
                    customerName={customerName} setCustomerName={setCustomerName} setCustomerPhone={setCustomerPhone} customerPhone={customerPhone}
                    products={products}
                    selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId}
                    selectedColor={selectedColor} setSelectedColor={setSelectedColor}
                    qty={qty} setQty={setQty}
                    activeProduct={activeProduct}
                    currentStock={currentStock}
                    currentInCart={currentInCart}
                    onAdd={addToCart}
                />

                {/* KOLOM KANAN */}
                <POSCart
                    cart={cart} setCart={setCart} onUpdatePrice={handleUpdatePrice}
                    paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                    loading={loading}
                    onProcessSale={handleProcessSale} // ← Lempar fungsi yg sudah kita bungkus
                />
            </div>
        </div>
    )
}