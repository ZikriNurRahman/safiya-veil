'use client'

import { useState } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/database'
import { PrintReceipt } from '@/components/admin/PrintReceipt'

interface OrderListProps {
    totalProcessed: number
    searchQuery: string
    paginatedOrders: (Order & { order_items?: OrderItem[] })[]
    onUpdateStatus?: (orderId: string, newStatus: any) => void
}

export function OrderList({ totalProcessed, searchQuery, paginatedOrders, onUpdateStatus }: OrderListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Pindahkan helper statusBadge ke sini karena hanya dipakai di tabel ini
    const statusBadge = (status: Order['status']) => {
        const map: Record<Order['status'], [string, string, string]> = {
            PENDING: ['#FFF3CD', '#856404', 'Menunggu'],
            PENDING_PAYMENT: ['#CCE5FF', '#004085', 'Belum Bayar'],
            COMPLETED: ['#D4EDDA', '#155724', 'Selesai'],
            CANCELLED: ['#F8D7DA', '#721C24', 'Dibatalkan'],
        }
        const [bg, color, label] = map[status]
        return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
                {label}
            </span>
        )
    }

    // Jika data kosong
    if (totalProcessed === 0) {
        return (
            <div className="py-12 text-center" style={{ color: '#CEAB93' }}>
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">
                    {searchQuery ? `Tidak ada pesanan cocok dengan "${searchQuery}"` : 'Belum ada pesanan'}
                </p>
            </div>
        )
    }

    // Jika data ada
    return (
        <div className="divide-y" style={{ borderColor: '#F5ECD8' }}>
            {paginatedOrders.map(order => (
                <div key={order.id}>
                    <div
                        className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF5E8] transition-colors"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-bold" style={{ color: '#3D2B1F' }}>{order.order_number}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#8C6E5A' }}>
                                {order.customer_name} · {formatDateTime(order.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}>
                                {formatRupiah(order.total_price)}
                            </span>
                            {statusBadge(order.status)}

                            {onUpdateStatus && order.status === 'PENDING' && (
                                <>
                                    <button onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                                        className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#D4EDDA', color: '#155724' }}>
                                        ✓ Selesai
                                    </button>
                                    <button onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                                        className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#F8D7DA', color: '#721C24' }}>
                                        Batalkan
                                    </button>
                                </>
                            )}

                            <div onClick={e => e.stopPropagation()}>
                                <PrintReceipt order={order} />
                            </div>

                            <span className="text-xs" style={{ color: '#CEAB93' }}>
                                {expandedId === order.id ? '▲' : '▼'}
                            </span>
                        </div>
                    </div>

                    {expandedId === order.id && (
                        <div className="px-5 pb-4 pt-2" style={{ background: '#FAF5E8' }}>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3">
                                <p style={{ color: '#8C6E5A' }}>📱 {order.customer_phone}</p>
                                <p style={{ color: '#8C6E5A' }}>
                                    {order.order_type === 'PICKUP' ? '🏪 Ambil di Toko' : `🚚 ${order.customer_address}`}
                                </p>
                                <p style={{ color: '#8C6E5A' }}>
                                    💳 {order.payment_method === 'TRANSFER' ? 'Bank Transfer' : order.payment_method === 'QRIS' ? 'QRIS' : 'Tunai (Cash)'}
                                </p>
                            </div>

                            {order.order_items && order.order_items.length > 0 && (
                                <div className="space-y-1">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-xs" style={{ color: '#3D2B1F' }}>
                                            <span>
                                                {item.product_name}
                                                {item.notes ? ` (${item.notes})` : ''} ×{item.quantity}
                                            </span>
                                            <span style={{ color: '#AD8B73' }}>{formatRupiah(item.unit_price * item.quantity)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-2 text-sm font-semibold" style={{ borderTop: '1px dashed #E3CAA5', color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                                        <span>Total</span>
                                        <span>{formatRupiah(order.total_price)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}