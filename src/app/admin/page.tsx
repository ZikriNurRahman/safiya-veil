'use client'
// src/app/admin/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import type { Order, OrderItem } from '@/types/database'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

// Import komponen & utils yang sudah dipecah
import { StatCard } from '@/components/admin/StatCard'
import { exportCSV } from '@/lib/exportCSV'
import { useOrderPagination } from '@/hooks/useOrderPagination'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { OrderList } from '@/components/admin/OrderList'

interface Stats {
  totalOrders: number
  revenue: number
  pendingOrders: number
  totalProducts: number
}

type DateRange = 'today' | '7d' | '30d' | '90d'

function getDateRange(range: DateRange): { from: string; to: string; label: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (range === 'today') return { from: `${today}T00:00:00`, to: `${today}T23:59:59`, label: 'Hari Ini' }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const from = new Date(now)
  from.setDate(from.getDate() - (days - 1))
  return { from: `${from.toISOString().split('T')[0]}T00:00:00`, to: `${today}T23:59:59`, label: `${days} Hari` }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [allOrders, setAllOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('today')

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const ITEMS_PER_PAGE = 10

  const {
    currentPage, setCurrentPage, totalPages, paginatedOrders, totalProcessed
  } = useOrderPagination(allOrders, searchQuery, [searchQuery, dateRange], ITEMS_PER_PAGE)

  const [realtimePing, setRealtimePing] = useState(false)

  const fetchData = useCallback(async () => {
    const { from, to } = getDateRange(dateRange)

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders')
        .select('*, order_items(*, products(base_sku, color_stocks))')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false }),
      supabase.from('products').select('id', { count: 'exact' }).eq('is_available', true),
    ])

    const orders = ordersRes.data || []
    setAllOrders(orders as (Order & { order_items?: OrderItem[] })[])

    setStats({
      totalOrders: orders.length,
      revenue: orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total_price), 0),
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      totalProducts: productsRes.count ?? 0,
    })

    setLoading(false)
  }, [dateRange])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        setRealtimePing(true)
        setTimeout(() => setRealtimePing(false), 1000)
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const rangeOptions: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Hari Ini' }, { key: '7d', label: '7 Hari' },
    { key: '30d', label: '30 Hari' }, { key: '90d', label: '90 Hari' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#8C6E5A' }}>Ringkasan performa toko Safiya Veil</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#E3CAA5', fontSize: '0.65rem', color: '#8C6E5A' }}>
          <div className="w-2 h-2 rounded-full transition-all" style={{ background: realtimePing ? '#2E7D32' : '#AD8B73', boxShadow: realtimePing ? '0 0 6px #2E7D32' : 'none', transform: realtimePing ? 'scale(1.4)' : 'scale(1)' }} />
          <span>Realtime</span>
        </div>
      </div>

      {/* Filter dan Export CSV */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {rangeOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setDateRange(key)} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all" style={{ background: dateRange === key ? '#AD8B73' : '#E3CAA5', color: dateRange === key ? '#FFFBE9' : '#8C6E5A' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => exportCSV(allOrders, rangeOptions.find(r => r.key === dateRange)!.label)} disabled={allOrders.length === 0} className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold" style={{ background: allOrders.length === 0 ? '#E3CAA5' : '#3D2B1F', color: allOrders.length === 0 ? '#8C6E5A' : '#FFFBE9', cursor: allOrders.length === 0 ? 'not-allowed' : 'pointer' }}>
          ⬇ Export CSV ({allOrders.length})
        </button>
      </div>

      {/* Ringkasan Info */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl p-5 h-28 skeleton" style={{ border: '1px solid #E3CAA5' }} />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📦" label="Total Order" value={`${stats.totalOrders}`} sub={rangeOptions.find(r => r.key === dateRange)?.label} />
          <StatCard icon="💰" label="Pendapatan" value={formatRupiah(stats.revenue)} sub="order selesai" />
          <StatCard icon="⏳" label="Menunggu" value={`${stats.pendingOrders}`} sub="perlu ditangani" />
          <StatCard icon="🧕" label="Produk Aktif" value={`${stats.totalProducts}`} sub="tersedia" />
        </div>
      ) : null}

      {/* Daftar Tabel */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>

        {/* Header Tabel & Search Bar */}
        <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ borderBottom: '1px solid #E3CAA5' }}>
          <h2 className="text-base font-semibold shrink-0" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Daftar Pesanan ({rangeOptions.find(r => r.key === dateRange)?.label})
          </h2>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari No. Pesanan atau Nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#AD8B73]"
              style={{ borderColor: '#E3CAA5', background: '#FFFBE9' }}
            />
          </div>
        </div>

        {/* 👇 INI DIA KOMPONEN YANG BARU KITA BUAT 👇 */}
        <OrderList
          totalProcessed={totalProcessed}
          searchQuery={searchQuery}
          paginatedOrders={paginatedOrders}
        />

        {/* ── Kontrol Pagination ── */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalProcessed}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  )
}