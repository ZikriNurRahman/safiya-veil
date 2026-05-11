'use client'
// src/app/admin/products/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Product, Category } from '@/types/database'
import { ProductTable } from '@/components/admin/products/ProductTable'
import { ProductForm, type FormState, defaultForm } from '@/components/admin/products/ProductForm'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // State UI
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formInitialData, setFormInitialData] = useState<FormState>(defaultForm)
  const [filterCat, setFilterCat] = useState('Semua')
  const [realtimePing, setRealtimePing] = useState(false)

  const fetchAll = useCallback(async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('category').order('name'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (p) setProducts(p as Product[])
    if (c) setCategories(c as Category[])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        setRealtimePing(true)
        setTimeout(() => setRealtimePing(false), 1000)
        fetchAll()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  const toggleAvail = async (p: Product) => {
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    toast.success(`${p.name} → ${!p.is_available ? 'Tersedia' : 'Tidak tersedia'}`)
  }

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Hapus "${p.name}"? Ini tidak bisa dibatalkan.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    toast.success('Produk dihapus')
  }

  const startEdit = (p: Product) => {
    setEditId(p.id)
    setFormInitialData({
      name: p.name,
      base_sku: p.base_sku ?? '',
      price: String(p.price),

      // 🔥 TAMBAHAN: Masukkan data diskon dan badge saat mode Edit
      sale_price: p.sale_price ? String(p.sale_price) : '',
      badge: p.badge || '',

      category: p.category,
      description: p.description || '',
      image_url: p.image_url || '',
      stock: String(p.stock),
      is_available: p.is_available,
      colors: p.colors || [],
      color_stocks: p.color_stocks || [],
      color_images: p.color_images || [],
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormInitialData(defaultForm)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Kelola Produk
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>{products.length} produk terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: '#E3CAA5', fontSize: '0.65rem', color: '#8C6E5A' }}>
            <div className="w-2 h-2 rounded-full transition-all"
              style={{ background: realtimePing ? '#2E7D32' : '#AD8B73', boxShadow: realtimePing ? '0 0 6px #2E7D32' : 'none', transform: realtimePing ? 'scale(1.4)' : 'scale(1)' }}
            />
            <span>Realtime</span>
          </div>
          <button
            onClick={() => { setEditId(null); setFormInitialData(defaultForm); setShowForm(true) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#AD8B73', color: '#FFFBE9' }}
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      {showForm && (
        <ProductForm editId={editId} initialData={formInitialData} categories={categories} products={products} onClose={handleCloseForm} />
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {['Semua', ...categories.map(c => c.name)].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            style={{ background: filterCat === cat ? '#AD8B73' : '#E3CAA5', color: filterCat === cat ? '#FFFBE9' : '#8C6E5A' }}>
            {cat}
          </button>
        ))}
      </div>

      <ProductTable products={products} filterCat={filterCat} onEdit={startEdit} onDelete={deleteProduct} onToggleAvail={toggleAvail} />
    </div>
  )
}