// src/app/api/midtrans/webhook/route.ts
// Webhook Midtrans — update status order setelah pembayaran
// Daftarkan URL ini di Midtrans Dashboard: https://yourdomain.com/api/midtrans/webhook

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Gunakan service role untuk bypass RLS di webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            order_id,          // ini adalah order_number (SV-xxx)
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
        } = body

        // Verifikasi signature Midtrans
        const serverKey = process.env.MIDTRANS_SERVER_KEY!
        const expected = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex')

        if (signature_key !== expected) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
        }

        // Map status Midtrans ke status order kita
        let newStatus: string | null = null

        if (transaction_status === 'capture' && fraud_status === 'accept') {
            newStatus = 'PENDING'  // Pembayaran sukses → menunggu proses
        } else if (transaction_status === 'settlement') {
            newStatus = 'PENDING'  // Pembayaran settled → menunggu proses
        } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
            newStatus = 'CANCELLED'
        } else if (transaction_status === 'deny') {
            newStatus = 'CANCELLED'
        }

        if (newStatus) {
            const { error } = await supabaseAdmin
                .from('orders')
                .update({ status: newStatus })
                .eq('order_number', order_id)

            if (error) {
                console.error('Webhook update error:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
        }

        return NextResponse.json({ ok: true })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}