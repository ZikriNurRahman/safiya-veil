// src/hooks/usePOSCheckout.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { generateOrderNumber } from '@/lib/utils'

interface POSCheckoutParams {
    cart: any[]
    customerName: string
    customerPhone: string
    paymentMethod: 'CASH' | 'QRIS'
    onSuccess: () => void
}

export function usePOSCheckout() {
    const [loading, setLoading] = useState(false)
    const [successOrder, setSuccessOrder] = useState<{ number: string; payUrl?: string } | null>(null)

    const processSale = async ({ cart, customerName, customerPhone, paymentMethod, onSuccess }: POSCheckoutParams) => {
        if (cart.length === 0) return toast.error('Daftar belanja kosong!')
        setLoading(true)

        try {
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
            const orderNumber = generateOrderNumber()

            const isQris = paymentMethod === 'QRIS'
            const initialStatus = isQris ? 'PENDING_PAYMENT' : 'COMPLETED'

            // 1. Simpan ke tabel orders
            const { data: orderData, error: orderError } = await supabase.from('orders').insert({
                order_number: orderNumber,
                customer_name: customerName || 'Pelanggan Offline',
                customer_phone: customerPhone || '-',
                order_type: 'PICKUP',
                payment_method: paymentMethod,
                status: initialStatus,
                total_price: totalPrice,
                notes: `Penjualan Offline (${paymentMethod})`
            }).select().single()

            if (orderError) throw orderError

            // 2. Simpan Item & POTONG STOK
            for (const item of cart) {
                await supabase.from('order_items').insert({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    product_name: item.name,
                    unit_price: item.price,
                    quantity: item.qty,
                    notes: item.color || ''
                })

                await supabase.rpc('reduce_product_stock', {
                    p_product_id: item.product_id,
                    p_color: item.color || '',
                    p_qty: item.qty
                })
            }

            // 3. Generate QRIS Midtrans
            if (isQris) {
                const midtransRes = await fetch('/api/midtrans/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderData.id,
                        orderNumber,
                        amount: totalPrice,
                        customerName: customerName || 'Pelanggan Offline',
                        customerPhone: '-',
                        paymentMethod: 'QRIS',
                        items: cart.map(i => ({
                            id: i.product_id,
                            name: i.name + (i.color ? ` — ${i.color}` : ''),
                            price: i.price,
                            quantity: i.qty,
                        })),
                    }),
                })

                const midtransData = await midtransRes.json()
                if (!midtransRes.ok) throw new Error(midtransData.error ?? 'Gagal membuat QRIS Midtrans')

                setSuccessOrder({ number: orderNumber, payUrl: midtransData.payment_url })
                toast.success('Pesanan QRIS berhasil dibuat!')
            } else {
                toast.success('Penjualan offline berhasil dicatat!')
                setSuccessOrder({ number: orderNumber })
            }

            // Eksekusi fungsi sukses (misal: kosongkan keranjang di komponen utama)
            onSuccess()

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const resetPOS = () => {
        setSuccessOrder(null)
    }

    return { processSale, loading, successOrder, resetPOS }
}