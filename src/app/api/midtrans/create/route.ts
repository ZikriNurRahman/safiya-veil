// src/app/api/midtrans/create/route.ts
// API endpoint untuk buat Midtrans transaction
// Mendukung QRIS dan Bank Transfer (BCA, BNI, Mandiri, BRI)

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Encode base64 untuk Basic Auth Midtrans
const toBase64 = (str: string) => Buffer.from(str).toString('base64')

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, orderNumber, amount, customerName, customerPhone, paymentMethod, items } = body

        const serverKey = process.env.MIDTRANS_SERVER_KEY!
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
        const baseUrl = isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

        // Build payload Midtrans Snap
        const snapPayload: Record<string, unknown> = {
            transaction_details: {
                order_id: orderNumber,
                gross_amount: amount,
            },
            customer_details: {
                first_name: customerName,
                phone: customerPhone,
            },
            item_details: items.map((i: { id: string; name: string; price: number; quantity: number }) => ({
                id: i.id,
                name: i.name.slice(0, 50), // Midtrans max 50 char
                price: i.price,
                quantity: i.quantity,
            })),
            // Batasi ke QRIS atau Bank Transfer saja
            enabled_payments: paymentMethod === 'QRIS'
                ? ['gopay', 'qris']
                : ['bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va'],
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/shop/cart?status=success`,
            },
        }

        // Request ke Midtrans Snap
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${toBase64(serverKey + ':')}`,
            },
            body: JSON.stringify(snapPayload),
        })

        const data = await response.json()
        if (!response.ok) {
            return NextResponse.json(
                { error: data.error_messages?.[0] ?? 'Midtrans error' },
                { status: 400 }
            )
        }

        // Simpan snap token & payment URL ke order di Supabase
        const supabase = await createServerSupabase()
        await supabase
            .from('orders')
            .update({
                midtrans_snap_token: data.token,
                midtrans_payment_url: data.redirect_url,
            })
            .eq('id', orderId)

        return NextResponse.json({
            snap_token: data.token,
            payment_url: data.redirect_url,
        })

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}