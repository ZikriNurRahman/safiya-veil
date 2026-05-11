'use client'

import { useState } from 'react'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

// ── IMPORT KOMPONEN TERPISAH ──
import { PrintReceipt } from './PrintReceipt'
import { SendWAButton } from './SendWAButton'

interface OrderListProps {
    totalProcessed: number
    searchQuery: string
    paginatedOrders: any[]
    onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void
}

export function OrderList({ paginatedOrders, onUpdateStatus }: OrderListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const orderTypeLabel = (t: string) => t === 'PICKUP' ? '🏪 Ambil' : '🚚 Kirim'
    const paymentLabel = (m: string) => ({ CASH: '💵 Cash', QRIS: '📱 QRIS', TRANSFER: '🏦 Transfer' }[m] || m)

    const StatusBadge = ({ status }: { status: string }) => {
        const map: Record<string, { bg: string; color: string; label: string }> = {
            PENDING: { bg: '#FFF3CD', color: '#856404', label: 'Menunggu' },
            PENDING_PAYMENT: { bg: '#CCE5FF', color: '#004085', label: 'Belum Bayar' },
            COMPLETED: { bg: '#D4EDDA', color: '#155724', label: 'Selesai' },
            CANCELLED: { bg: '#F8D7DA', color: '#721C24', label: 'Dibatalkan' },
        }
        const s = map[status] || map.PENDING
        return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
                {s.label}
            </span>
        )
    }

    return (
        <div className="space-y-3 p-4">
            {paginatedOrders.map(order => (
                <div key={order.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5', background: '#FFFBE9' }}>

                    {/* Row utama */}
                    <div className="px-5 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            {/* Info kiri */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold" style={{ color: '#3D2B1F' }}>{order.order_number}</span>
                                    <StatusBadge status={order.status} />
                                    <span className="text-xs" style={{ color: '#CEAB93' }}>{orderTypeLabel(order.order_type)}</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: '#8C6E5A' }}>
                                    {order.customer_name} · {order.customer_phone}
                                </p>
                                {order.customer_address && (
                                    <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#CEAB93' }}>
                                        📍 {order.customer_address}
                                    </p>
                                )}
                                <p className="text-xs mt-0.5" style={{ color: '#CEAB93' }}>
                                    {formatDateTime(order.created_at)} · {paymentLabel(order.payment_method)}
                                </p>
                            </div>

                            {/* Info kanan */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}>
                                    {formatRupiah(order.total_price)}
                                </span>

                                <div className="flex gap-1.5 flex-wrap justify-end">

                                    {/* ── PAKAI KOMPONEN TERPISAH ── */}
                                    <PrintReceipt order={order} />
                                    <SendWAButton order={order} />

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

                                    <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                        className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
                                        {expandedId === order.id ? '▲ Tutup' : '▼ Detail'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail items (expanded) */}
                    {expandedId === order.id && order.order_items && (
                        <div className="px-5 pb-4" style={{ borderTop: '1px solid #F5ECD8' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mt-3 mb-2" style={{ color: '#CEAB93' }}>
                                Item Pesanan
                            </p>
                            <div className="space-y-1.5">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-baseline">
                                        <div>
                                            <span className="text-sm" style={{ color: '#3D2B1F' }}>{item.product_name}</span>
                                            <span className="text-xs ml-2" style={{ color: '#CEAB93' }}>× {item.quantity}</span>
                                            {item.notes && <span className="text-xs ml-2 italic" style={{ color: '#8C6E5A' }}>({item.notes})</span>}
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: '#AD8B73' }}>
                                            {formatRupiah(item.unit_price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 flex justify-between items-baseline" style={{ borderTop: '1px dashed #E3CAA5' }}>
                                <span className="text-xs" style={{ color: '#8C6E5A' }}>Total</span>
                                <span className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}>
                                    {formatRupiah(order.total_price)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}