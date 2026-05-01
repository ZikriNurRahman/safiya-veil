'use client'
// src/app/admin/products/page.tsx
// Halaman kelola produk hijab — CRUD lengkap dengan kategori, stok, gambar URL

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product, Category } from '@/types/database'

type FormState = {
  name: string; price: string; category: string
  description: string; image_url: string; stock: string
}

const defaultForm: FormState = {
  name: '', price: '', category: '', description: '', image_url: '', stock: '0',
}

export default function AdminProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([])
  const [categories,   setCategories]   = useState<Category[]>([])
  const [form,         setForm]         = useState<FormState>(defaultForm)
  const [editId,       setEditId]       = useState<string | null>(null)
  const [showForm,     setShowForm]     = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [filterCat,    setFilterCat]    = useState('Semua')

  // Fetch produk dan kategori
  const fetchAll = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('category').order('name'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (p) setProducts(p as Product[])
    if (c) setCategories(c as Category[])
  }

  useEffect(() => { fetchAll() }, [])

  // Submit form (create atau update)
  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return }
    setSaving(true)

    const payload = {
      name:         form.name.trim(),
      price:        parseFloat(form.price),
      category:     form.category || (categories[0]?.name ?? ''),
      description:  form.description.trim(),
      image_url:    form.image_url.trim() || null,
      stock:        parseInt(form.stock) || 0,
      is_available: parseInt(form.stock) > 0,
    }

    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId)
      if (error) toast.error('Gagal update: ' + error.message)
      else toast.success('Produk diupdate!')
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) toast.error('Gagal tambah: ' + error.message)
      else toast.success('Produk ditambahkan!')
    }

    setSaving(false)
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
    fetchAll()
  }

  // Toggle ketersediaan produk
  const toggleAvail = async (p: Product) => {
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    toast.success(`${p.name} → ${!p.is_available ? 'Tersedia' : 'Tidak tersedia'}`)
    fetchAll()
  }

  // Ubah stok ±
  const updateStock = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta)
    await supabase.from('products')
      .update({ stock: newStock, is_available: newStock > 0 })
      .eq('id', p.id)
    fetchAll()
  }

  // Hapus produk
  const deleteProduct = async (p: Product) => {
    if (!confirm(`Hapus "${p.name}"? Ini tidak bisa dibatalkan.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    toast.success('Produk dihapus')
    fetchAll()
  }

  // Edit produk — isi form dengan data yang ada
  const startEdit = (p: Product) => {
    setEditId(p.id)
    setForm({
      name:        p.name,
      price:       String(p.price),
      category:    p.category,
      description: p.description ?? '',
      image_url:   p.image_url ?? '',
      stock:       String(p.stock),
    })
    setShowForm(true)
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none"
  const inputStyle = {
    border: '1.5px solid #E3CAA5',
    background: '#FFFBE9',
    color: '#3D2B1F',
    fontFamily: 'var(--font-sans)',
  }

  const filtered = products.filter(p =>
    filterCat === 'Semua' || p.category === filterCat
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Kelola Produk
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>
            {products.length} produk terdaftar
          </p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm(defaultForm); setShowForm(true) }}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#AD8B73', color: '#FFFBE9' }}
        >
          + Tambah Produk
        </button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: '#FFFBE9', border: '1.5px solid #AD8B73' }}
        >
          <h3
            className="text-base font-semibold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Nama */}
            <input
              placeholder="Nama produk *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={`${inputCls} md:col-span-2`}
              style={inputStyle}
            />
            {/* Harga */}
            <input
              type="number"
              placeholder="Harga (Rp) *"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
            {/* Stok */}
            <input
              type="number"
              placeholder="Stok"
              value={form.stock}
              min="0"
              onChange={e => setForm({ ...form, stock: e.target.value })}
              className={inputCls}
              style={inputStyle}
            />
            {/* Kategori */}
            <select
              value={form.category || (categories[0]?.name ?? '')}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className={`${inputCls} md:col-span-2`}
              style={inputStyle}
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {/* Deskripsi */}
            <textarea
              placeholder="Deskripsi produk"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className={`${inputCls} md:col-span-2`}
              style={{ ...inputStyle, resize: 'none' }}
            />
            {/* URL Gambar */}
            <input
              placeholder="URL gambar (opsional)"
              value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
              className={`${inputCls} md:col-span-2`}
              style={inputStyle}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm) }}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: '#E3CAA5', color: '#3D2B1F' }}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#AD8B73', color: '#FFFBE9', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Filter kategori */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['Semua', ...categories.map(c => c.name)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filterCat === cat ? '#AD8B73' : '#E3CAA5',
              color: filterCat === cat ? '#FFFBE9' : '#8C6E5A',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tabel produk */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#E3CAA5' }}>
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8C6E5A' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: '#CEAB93' }}>
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      background: i % 2 === 0 ? '#FFFBE9' : '#FEFDF5',
                      borderBottom: '1px solid #F5ECD8',
                    }}
                  >
                    {/* Nama + deskripsi singkat */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: '#E3CAA5' }}
                        >
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: '16px', fontStyle: 'italic' }}>S</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#3D2B1F' }}>{p.name}</p>
                          {p.description && (
                            <p className="text-xs truncate max-w-[160px]" style={{ color: '#8C6E5A' }}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8C6E5A' }}>{p.category}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                      {formatRupiah(p.price)}
                    </td>
                    {/* Stok control */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateStock(p, -1)}
                          className="w-6 h-6 rounded-lg text-xs font-bold"
                          style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
                          −
                        </button>
                        <span
                          className="w-7 text-center font-bold text-sm"
                          style={{ color: p.stock === 0 ? '#C0392B' : p.stock <= 5 ? '#E67E22' : '#2E7D32' }}
                        >
                          {p.stock}
                        </span>
                        <button onClick={() => updateStock(p, +1)}
                          className="w-6 h-6 rounded-lg text-xs font-bold"
                          style={{ background: '#AD8B73', color: '#FFFBE9' }}>
                          +
                        </button>
                      </div>
                    </td>
                    {/* Toggle status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAvail(p)}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: p.is_available ? '#D4EDDA' : '#F8D7DA',
                          color: p.is_available ? '#155724' : '#721C24',
                        }}
                      >
                        {p.is_available ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>
                    {/* Aksi */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(p)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ background: '#F8D7DA', color: '#721C24' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}