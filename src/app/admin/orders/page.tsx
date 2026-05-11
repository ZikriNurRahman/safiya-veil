'use client'
// src/app/admin/orders/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/types/database'
import { Search } from 'lucide-react'

// Import Hooks & Components Terpisah
import { useOrderPagination } from '@/hooks/useOrderPagination'
import { OrderList } from '@/components/admin/OrderList'
import { EmptyState } from '@/components/admin/EmptyState'
import { PaginationControls } from '@/components/admin/PaginationControls'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimePing, setRealtimePing] = useState(false)

  // Filters & Search State
  const [filterStatus, setFilterStatus] = useState<string>('Semua')
  const [reportDate, setReportDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const ITEMS_PER_PAGE = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

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

  // ── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        setRealtimePing(true)
        setTimeout(() => setRealtimePing(false), 1000)
        fetchOrders()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) toast.error('Gagal update status')
    else toast.success(`Status diupdate → ${newStatus}`)
    fetchOrders()
  }

  // 1. Filter data berdasarkan Status (Dropdown)
  const filteredByStatus = orders.filter(order => {
    return filterStatus === 'Semua' || order.status === filterStatus
  })

  // 2. Lempar data yang sudah di-filter status ke Mesin Pagination & Search
  const {
    currentPage, setCurrentPage, totalPages, paginatedOrders, totalProcessed
  } = useOrderPagination(filteredByStatus, searchQuery, [searchQuery, filterStatus, reportDate], ITEMS_PER_PAGE)


  return (
    <div>
      {/* Header + indikator realtime */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Pesanan
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>
            Kelola semua pesanan dari pelanggan
          </p>
        </div>
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

      {/* ── KONTROL PANEL: Filter & Search ── */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-start xl:items-center justify-between">
        {/* Filter Status & Tanggal */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            {['Semua', 'PENDING', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: filterStatus === s ? '#AD8B73' : '#E3CAA5',
                  color: filterStatus === s ? '#FFFBE9' : '#8C6E5A',
                }}>
                {s === 'Semua' ? 'Semua' : s === 'PENDING' ? 'Menunggu' : s === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs outline-none"
              style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
            />
            {reportDate && (
              <button onClick={() => setReportDate('')} className="text-xs px-2 py-1 rounded-lg"
                style={{ background: '#E3CAA5', color: '#8C6E5A' }}>
                × Reset
              </button>
            )}
          </div>
        </div>

        {/* Kotak Pencarian */}
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Cari No. Pesanan / Nama..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#AD8B73] outline-none shadow-sm"
          />
        </div>
      </div>

      {/* ── DAFTAR ORDER ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-20 skeleton" style={{ border: '1px solid #E3CAA5' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">

          {/* TABEL LIST */}
          {totalProcessed === 0 ? (
            <EmptyState
              title={searchQuery ? `Tidak ada pesanan cocok dengan "${searchQuery}"` : 'Belum ada pesanan'}
              description={reportDate ? 'Tidak ada pesanan pada tanggal ini' : 'Pesanan akan muncul di sini'}
            />
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5', background: '#FFFBE9' }}>
              <OrderList
                totalProcessed={totalProcessed}
                searchQuery={searchQuery}
                paginatedOrders={paginatedOrders}
                onUpdateStatus={updateStatus}
              />
            </div>
          )}

          {/* KONTROL PAGINATION (KOMPONEN TERPISAH) */}
          <div className="pt-2">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProcessed}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>

        </div>
      )}
    </div>
  )
}