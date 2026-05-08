'use client'
// src/components/admin/PrintReceipt.tsx

import { useRef } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/database'

export function PrintReceipt({ order }: { order: Order & { order_items?: OrderItem[] } }) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        if (!printRef.current) return
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (!printWindow) return

        const content = printRef.current.innerHTML
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Struk — ${order.order_number}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; padding: 16px; max-width: 300px; margin: 0 auto; }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .row { display: flex; justify-content: space-between; margin: 3px 0; }
                        .brand { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
                        .tagline { font-size: 9px; letter-spacing: 1px; margin-bottom: 4px; }
                        .item-name { flex: 1; padding-right: 8px; }
                        .total-row { font-size: 14px; font-weight: bold; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
    }

    const payLabel = { TRANSFER: 'Bank Transfer', QRIS: 'QRIS', CASH: 'Tunai (Cash)' }[order.payment_method] ?? order.payment_method
    const typeLabel = order.order_type === 'PICKUP' ? 'Ambil di Toko' : 'Pengiriman'

    return (
        <>
            <button onClick={handlePrint} className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80" style={{ background: '#E3CAA5', color: '#3D2B1F' }} title="Print struk">
                🖨 Struk
            </button>
            <div ref={printRef} style={{ display: 'none' }}>
                <div className="center"><div className="brand">SAFIYA VEIL</div><div className="tagline">Grace in Style, Pure in Faith</div></div>
                <div className="divider" />
                <div className="row"><span>No. Order</span><span className="bold">{order.order_number}</span></div>
                <div className="row"><span>Tanggal</span><span>{formatDateTime(order.created_at)}</span></div>
                <div className="row"><span>Pelanggan</span><span>{order.customer_name}</span></div>
                <div className="row"><span>WhatsApp</span><span>{order.customer_phone}</span></div>
                <div className="row"><span>Tipe</span><span>{typeLabel}</span></div>
                {order.customer_address && <div className="row"><span>Alamat</span><span style={{ maxWidth: 150, textAlign: 'right' }}>{order.customer_address}</span></div>}
                <div className="row"><span>Pembayaran</span><span>{payLabel}</span></div>
                <div className="divider" />
                {order.order_items && order.order_items.length > 0 ? (
                    <>{order.order_items.map(item => (
                        <div key={item.id} style={{ marginBottom: 6 }}>
                            <div className="bold item-name">{item.product_name}{item.notes ? ` (${item.notes})` : ''}</div>
                            <div className="row"><span>{item.quantity} × {formatRupiah(item.unit_price)}</span><span>{formatRupiah(item.unit_price * item.quantity)}</span></div>
                        </div>
                    ))}</>
                ) : <p style={{ textAlign: 'center', color: '#666', fontSize: 10 }}>— detail item tidak tersedia —</p>}
                <div className="divider" />
                <div className="row total-row"><span>TOTAL</span><span>{formatRupiah(order.total_price)}</span></div>
                <div className="divider" />
                <div className="center" style={{ marginTop: 8, fontSize: 10 }}>Terima kasih telah berbelanja di Safiya Veil ✨</div>
            </div>
        </>
    )
}