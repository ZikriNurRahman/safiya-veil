// src/hooks/useCheckout.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateOrderNumber } from '@/lib/utils'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'

export function useCheckout() {
    const [submitting, setSubmitting] = useState(false)
    const [successOrder, setSuccessOrder] = useState<{ number: string; payUrl?: string } | null>(null)

    // Tarik data keranjang dari global store
    const {
        items, customerName, customerPhone, customerAddress,
        orderType, paymentMethod, getTotal, clearCart, isReadyToCheckout
    } = useCartStore()

    const handleCheckout = async () => {
        if (!isReadyToCheckout() || submitting) return
        setSubmitting(true)

        try {
            const orderNumber = generateOrderNumber()
            const total = getTotal()

            // 1. Insert order ke Supabase
            const { data: order, error: e1 } = await supabase.from('orders').insert({
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
            }).select().single()

            if (e1) throw new Error(e1.message)

            // 2. Insert order items
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
                    paymentMethod,
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

            // Kosongkan keranjang setelah sukses
            clearCart()

            // 4. Set status sukses
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

    // Kembalikan fungsi dan state agar bisa dipakai di komponen UI
    return { handleCheckout, submitting, successOrder }
}