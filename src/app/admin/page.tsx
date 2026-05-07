'use client'
// src/app/admin/page.tsx
// Dashboard ringkasan — realtime, filter range, export CSV, print struk

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/database'

interface Stats {
  totalOrders: number
  revenue: number
  pendingOrders: number
  totalProducts: number
}

type DateRange = 'today' | '7d' | '30d' | '90d'

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: '#FFFBE9', border: '1px solid #E3CAA5' }}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: '#8C6E5A' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#CEAB93' }}>{sub}</p>}
      </div>
    </div>
  )
}

function getDateRange(range: DateRange): { from: string; to: string; label: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (range === 'today') return { from: `${today}T00:00:00`, to: `${today}T23:59:59`, label: 'Hari Ini' }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const from = new Date(now)
  from.setDate(from.getDate() - (days - 1))
  return { from: `${from.toISOString().split('T')[0]}T00:00:00`, to: `${today}T23:59:59`, label: `${days} Hari` }
}

function exportCSV(orders: Order[], label: string) {
  const header = ['No Order', 'Customer', 'Phone', 'Type', 'Payment', 'Total', 'Status', 'Tanggal'].join(',')
  const rows = orders.map(o => [
    o.order_number, `"${o.customer_name}"`, o.customer_phone,
    o.order_type, o.payment_method, o.total_price, o.status, formatDateTime(o.created_at),
  ].join(','))
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `safiya-veil-orders-${label.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

// ── Komponen Print Struk ──────────────────────────────────────────────────────
function PrintReceipt({ order }: { order: Order & { order_items?: OrderItem[] } }) {
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
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #000;
              padding: 16px;
              max-width: 300px;
              margin: 0 auto;
            }
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
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  const payLabel = { TRANSFER: 'Bank Transfer', QRIS: 'QRIS' }[order.payment_method] ?? order.payment_method
  const typeLabel = order.order_type === 'PICKUP' ? 'Ambil di Toko' : 'Pengiriman'

  return (
    <>
      {/* Tombol print */}
      <button
        onClick={handlePrint}
        className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80"
        style={{ background: '#E3CAA5', color: '#3D2B1F' }}
        title="Print struk"
      >
        🖨 Struk
      </button>

      {/* Konten struk — tersembunyi, hanya untuk print */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="center">
          <div className="brand">SAFIYA VEIL</div>
          <div className="tagline">Grace in Style, Pure in Faith</div>
        </div>

        <div className="divider" />

        <div className="row"><span>No. Order</span><span className="bold">{order.order_number}</span></div>
        <div className="row"><span>Tanggal</span><span>{formatDateTime(order.created_at)}</span></div>
        <div className="row"><span>Pelanggan</span><span>{order.customer_name}</span></div>
        <div className="row"><span>WhatsApp</span><span>{order.customer_phone}</span></div>
        <div className="row"><span>Tipe</span><span>{typeLabel}</span></div>
        {order.customer_address && (
          <div className="row"><span>Alamat</span><span style={{ maxWidth: 150, textAlign: 'right' }}>{order.customer_address}</span></div>
        )}
        <div className="row"><span>Pembayaran</span><span>{payLabel}</span></div>

        <div className="divider" />

        {/* Item list */}
        {order.order_items && order.order_items.length > 0 ? (
          <>
            {order.order_items.map(item => (
              <div key={item.id} style={{ marginBottom: 6 }}>
                <div className="bold item-name">
                  {item.product_name}
                  {item.notes ? ` (${item.notes})` : ''}
                </div>
                <div className="row">
                  <span>{item.quantity} × {formatRupiah(item.unit_price)}</span>
                  <span>{formatRupiah(item.unit_price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontSize: 10 }}>— detail item tidak tersedia —</p>
        )}

        <div className="divider" />

        <div className="row total-row">
          <span>TOTAL</span>
          <span>{formatRupiah(order.total_price)}</span>
        </div>

        <div className="divider" />

        <div className="center" style={{ marginTop: 8, fontSize: 10 }}>
          Terima kasih telah berbelanja di Safiya Veil ✨
        </div>
      </div>
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('today')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [realtimePing, setRealtimePing] = useState(false) // animasi indikator realtime

  const fetchData = useCallback(async () => {
    const { from, to } = getDateRange(dateRange)

    const [ordersRes, productsRes, recentRes] = await Promise.all([
      supabase.from('orders')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to),
      supabase.from('products').select('id', { count: 'exact' }).eq('is_available', true),
      // Recent orders dengan items untuk struk
      supabase.from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const orders = ordersRes.data || []
    setAllOrders(orders as Order[])
    setStats({
      totalOrders: orders.length,
      revenue: orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total_price), 0),
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      totalProducts: productsRes.count ?? 0,
    })

    if (recentRes.data) setRecentOrders(recentRes.data as (Order & { order_items?: OrderItem[] })[])
    setLoading(false)
  }, [dateRange])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        // Animasi ping indikator
        setRealtimePing(true)
        setTimeout(() => setRealtimePing(false), 1000)
        // Refresh data
        fetchData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const statusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], [string, string, string]> = {
      PENDING: ['#FFF3CD', '#856404', 'Menunggu'],
      PENDING_PAYMENT: ['#CCE5FF', '#004085', 'Belum Bayar'],
      COMPLETED: ['#D4EDDA', '#155724', 'Selesai'],
      CANCELLED: ['#F8D7DA', '#721C24', 'Dibatalkan'],
    }
    const [bg, color, label] = map[status]
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: bg, color }}>{label}</span>
    )
  }

  const rangeOptions: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: '7d', label: '7 Hari' },
    { key: '30d', label: '30 Hari' },
    { key: '90d', label: '90 Hari' },
  ]

  return (
    <div>
      {/* Header + realtime indicator */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8C6E5A' }}>Ringkasan performa toko Safiya Veil</p>
        </div>
        {/* Indikator realtime */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: '#E3CAA5', fontSize: '0.65rem', color: '#8C6E5A' }}>
          <div
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: realtimePing ? '#2E7D32' : '#AD8B73',
              boxShadow: realtimePing ? '0 0 6px #2E7D32' : 'none',
              transform: realtimePing ? 'scale(1.4)' : 'scale(1)',
            }}
          />
          <span>Realtime</span>
        </div>
      </div>

      {/* Filter range + Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {rangeOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setDateRange(key)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: dateRange === key ? '#AD8B73' : '#E3CAA5',
                color: dateRange === key ? '#FFFBE9' : '#8C6E5A',
              }}>
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => exportCSV(allOrders, rangeOptions.find(r => r.key === dateRange)!.label)}
          disabled={allOrders.length === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            background: allOrders.length === 0 ? '#E3CAA5' : '#3D2B1F',
            color: allOrders.length === 0 ? '#8C6E5A' : '#FFFBE9',
            cursor: allOrders.length === 0 ? 'not-allowed' : 'pointer',
          }}>
          ⬇ Export CSV ({allOrders.length})
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 h-28 skeleton" style={{ border: '1px solid #E3CAA5' }} />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📦" label="Total Order" value={`${stats.totalOrders}`} sub={rangeOptions.find(r => r.key === dateRange)?.label} />
          <StatCard icon="💰" label="Pendapatan" value={formatRupiah(stats.revenue)} sub="order selesai" />
          <StatCard icon="⏳" label="Menunggu" value={`${stats.pendingOrders}`} sub="perlu ditangani" />
          <StatCard icon="🧕" label="Produk Aktif" value={`${stats.totalProducts}`} sub="tersedia" />
        </div>
      ) : null}

      {/* Order terbaru + print struk */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>
        <div className="px-5 py-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid #E3CAA5' }}>
          <h2 className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Pesanan Terbaru
          </h2>
          <a href="/admin/orders" className="text-xs font-semibold" style={{ color: '#AD8B73' }}>
            Lihat semua →
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center" style={{ color: '#CEAB93' }}>
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F5ECD8' }}>
            {recentOrders.map(order => (
              <div key={order.id}>
                {/* Row — klik untuk expand */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF5E8] transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#3D2B1F' }}>
                      {order.order_number}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8C6E5A' }}>
                      {order.customer_name} · {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className="text-sm font-semibold"
                      style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}>
                      {formatRupiah(order.total_price)}
                    </span>
                    {statusBadge(order.status)}

                    {/* ← PRINT STRUK BUTTON */}
                    <div onClick={e => e.stopPropagation()}>
                      <PrintReceipt order={order} />
                    </div>

                    <span className="text-xs" style={{ color: '#CEAB93' }}>
                      {expandedId === order.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Detail expanded */}
                {expandedId === order.id && (
                  <div className="px-5 pb-4 pt-2" style={{ background: '#FAF5E8' }}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3">
                      <p style={{ color: '#8C6E5A' }}>📱 {order.customer_phone}</p>
                      <p style={{ color: '#8C6E5A' }}>
                        {order.order_type === 'PICKUP' ? '🏪 Ambil di Toko' : `🚚 ${order.customer_address}`}
                      </p>
                      <p style={{ color: '#8C6E5A' }}>
                        💳 {order.payment_method === 'TRANSFER' ? 'Bank Transfer' : 'QRIS'}
                      </p>
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="space-y-1">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between text-xs" style={{ color: '#3D2B1F' }}>
                            <span>
                              {item.product_name}
                              {item.notes ? ` (${item.notes})` : ''}
                              {' '}×{item.quantity}
                            </span>
                            <span style={{ color: '#AD8B73' }}>{formatRupiah(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 text-sm font-semibold"
                          style={{ borderTop: '1px dashed #E3CAA5', color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
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
        )}
      </div>
    </div>
  )
}