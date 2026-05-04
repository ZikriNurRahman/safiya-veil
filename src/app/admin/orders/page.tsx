'use client'
// src/app/admin/orders/page.tsx
// Halaman kelola pesanan — list semua order, update status, detail item

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/types/database'

// Badge status dengan warna yang sesuai
function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; color: string; label: string }> = {
    PENDING: { bg: '#FFF3CD', color: '#856404', label: 'Menunggu' },
    PENDING_PAYMENT: { bg: '#CCE5FF', color: '#004085', label: 'Belum Bayar' },
    COMPLETED: { bg: '#D4EDDA', color: '#155724', label: 'Selesai' },
    CANCELLED: { bg: '#F8D7DA', color: '#721C24', label: 'Dibatalkan' },
  }
  const s = map[status]
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('Semua')
  const [reportDate, setReportDate] = useState('') // kosong = semua tanggal

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    // Filter tanggal kalau ada
    if (reportDate) {
      query = query
        .gte('created_at', `${reportDate}T00:00:00`)
        .lte('created_at', `${reportDate}T23:59:59`)
    }

    const { data } = await query
    if (data) setOrders(data as Order[])
    setLoading(false)
  }, [reportDate])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Update status order
  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      toast.error('Gagal update status')
    } else {
      toast.success(`Status diupdate → ${newStatus}`)
      fetchOrders()
    }
  }

  // Filter berdasarkan status
  const filtered = orders.filter(o =>
    filterStatus === 'Semua' || o.status === filterStatus
  )

  const orderTypeLabel = (t: Order['order_type']) =>
    t === 'PICKUP' ? '🏪 Ambil' : '🚚 Kirim'

  const paymentLabel = (m: Order['payment_method']) => ({
    CASH: '💵 Cash', QRIS: '📱 QRIS', TRANSFER: '🏦 Transfer',
  }[m] || m)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
          Pesanan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>
          Kelola semua pesanan dari pelanggan
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex gap-2">
          {['Semua', 'PENDING', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filterStatus === s ? '#AD8B73' : '#E3CAA5',
                color: filterStatus === s ? '#FFFBE9' : '#8C6E5A',
              }}
            >
              {s === 'Semua' ? 'Semua'
                : s === 'PENDING' ? 'Menunggu'
                  : s === 'COMPLETED' ? 'Selesai'
                    : 'Dibatalkan'}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={reportDate}
          onChange={e => setReportDate(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
        />
        {reportDate && (
          <button
            onClick={() => setReportDate('')}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: '#E3CAA5', color: '#8C6E5A' }}
          >
            × Reset
          </button>
        )}
      </div>

      {/* Daftar order */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-20 skeleton" style={{ border: '1px solid #E3CAA5' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ border: '1px solid #E3CAA5', background: '#FFFBE9' }}>
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-medium" style={{ color: '#3D2B1F' }}>Belum ada pesanan</p>
          <p className="text-xs mt-1" style={{ color: '#8C6E5A' }}>
            {reportDate ? 'Tidak ada pesanan pada tanggal ini' : 'Pesanan akan muncul di sini'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div
              key={order.id}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #E3CAA5', background: '#FFFBE9' }}
            >
              {/* Row utama */}
              <div className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Info kiri */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: '#3D2B1F' }}>
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="text-xs" style={{ color: '#CEAB93' }}>
                        {orderTypeLabel(order.order_type)}
                      </span>
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
                    <span
                      className="text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}
                    >
                      {formatRupiah(order.total_price)}
                    </span>

                    {/* Aksi update status */}
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, 'COMPLETED')}
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: '#D4EDDA', color: '#155724' }}
                          >
                            ✓ Selesai
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'CANCELLED')}
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: '#F8D7DA', color: '#721C24' }}
                          >
                            Batalkan
                          </button>
                        </>
                      )}

                      {/* Tombol expand detail */}
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                      >
                        {expandedId === order.id ? '▲ Tutup' : '▼ Detail'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail items (expanded) */}
              {expandedId === order.id && order.order_items && (
                <div
                  className="px-5 pb-4"
                  style={{ borderTop: '1px solid #F5ECD8' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mt-3 mb-2"
                    style={{ color: '#CEAB93' }}>
                    Item Pesanan
                  </p>
                  <div className="space-y-1.5">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="text-sm" style={{ color: '#3D2B1F' }}>
                            {item.product_name}
                          </span>
                          <span className="text-xs ml-2" style={{ color: '#CEAB93' }}>
                            × {item.quantity}
                          </span>
                          {item.notes && (
                            <span className="text-xs ml-2 italic" style={{ color: '#8C6E5A' }}>
                              ({item.notes})
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#AD8B73' }}>
                          {formatRupiah(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ringkasan pembayaran */}
                  <div
                    className="mt-3 pt-3 flex justify-between items-baseline"
                    style={{ borderTop: '1px dashed #E3CAA5' }}
                  >
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
      )}
    </div>
  )
}