'use client'
// src/app/admin/page.tsx
// Dashboard ringkasan — statistik hari ini, produk terlaris, order terbaru

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types/database'

interface Stats {
  totalOrders:    number
  revenue:        number
  pendingOrders:  number
  totalProducts:  number
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: '#FFFBE9', border: '1px solid #E3CAA5' }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
        >
          {value}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: '#8C6E5A' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#CEAB93' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats,        setStats]        = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading,      setLoading]      = useState(true)
  const [reportDate,   setReportDate]   = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const [ordersRes, productsRes, recentRes] = await Promise.all([
        // Order hari ini
        supabase
          .from('orders')
          .select('total_price, status')
          .gte('created_at', `${reportDate}T00:00:00`)
          .lte('created_at', `${reportDate}T23:59:59`),

        // Total produk aktif
        supabase.from('products').select('id', { count: 'exact' }).eq('is_available', true),

        // Order terbaru (5 terakhir)
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const orders = ordersRes.data || []
      setStats({
        totalOrders:   orders.length,
        revenue:       orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total_price), 0),
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        totalProducts: productsRes.count ?? 0,
      })

      if (recentRes.data) setRecentOrders(recentRes.data as Order[])
      setLoading(false)
    }

    fetchData()
  }, [reportDate])

  const statusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], { bg: string; color: string; label: string }> = {
      PENDING:         { bg: '#FFF3CD', color: '#856404', label: 'Menunggu' },
      PENDING_PAYMENT: { bg: '#CCE5FF', color: '#004085', label: 'Belum Bayar' },
      COMPLETED:       { bg: '#D4EDDA', color: '#155724', label: 'Selesai' },
      CANCELLED:       { bg: '#F8D7DA', color: '#721C24', label: 'Dibatalkan' },
    }
    const s = map[status]
    return (
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: s.bg, color: s.color }}
      >
        {s.label}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8C6E5A' }}>
          Selamat datang kembali! Berikut ringkasan hari ini.
        </p>
      </div>

      {/* Date picker laporan */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>
          Laporan tanggal:
        </p>
        <input
          type="date"
          value={reportDate}
          onChange={e => setReportDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
        />
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
          <StatCard icon="📦" label="Total Order" value={`${stats.totalOrders}`} sub="hari ini" />
          <StatCard icon="💰" label="Pendapatan" value={formatRupiah(stats.revenue)} sub="selesai" />
          <StatCard icon="⏳" label="Menunggu" value={`${stats.pendingOrders}`} sub="perlu ditangani" />
          <StatCard icon="🧕" label="Produk Aktif" value={`${stats.totalProducts}`} sub="tersedia" />
        </div>
      ) : null}

      {/* Order terbaru */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E3CAA5' }}
      >
        <div
          className="px-5 py-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid #E3CAA5' }}
        >
          <h2
            className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            Pesanan Terbaru
          </h2>
          <a
            href="/admin/orders"
            className="text-xs font-semibold"
            style={{ color: '#AD8B73' }}
          >
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
              <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#3D2B1F' }}>
                    {order.order_number}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#8C6E5A' }}>
                    {order.customer_name} · {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}
                  >
                    {formatRupiah(order.total_price)}
                  </span>
                  {statusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}