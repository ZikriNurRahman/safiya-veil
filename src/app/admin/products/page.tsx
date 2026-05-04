'use client'
// src/app/admin/products/page.tsx
// Halaman kelola produk — tambah/edit/hapus + warna + stok
//
// FIX BUG: is_available kini dikontrol eksplisit oleh admin (bukan auto dari stok)
//          → produk baru otomatis tersedia (is_available: true) meskipun stok 0
// NEW:     field `colors` — daftar warna tersedia per produk (tag input)

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product, Category } from '@/types/database'

// ── Warna hijab umum untuk quick-pick ──────────────────────────────────────
const PRESET_COLORS = [
  'Hitam', 'Putih', 'Abu-abu', 'Navy', 'Cokelat', 'Krem',
  'Dusty Pink', 'Dusty Blue', 'Dusty Rose', 'Maroon',
  'Merah', 'Ungu', 'Hijau', 'Tosca', 'Sage',
  'Lavender', 'Mustard', 'Peach', 'Oranye', 'Biru',
]

const COLOR_HEX: Record<string, string> = {
  'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
  'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
  'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
  'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
  'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
  'Lavender': '#B39DDB', 'Mustard': '#D4A017', 'Peach': '#FFAB91',
  'Oranye': '#E65100', 'Biru': '#1565C0',
}

type ImageMode = 'upload' | 'url'

interface FormState {
  name: string
  price: string
  category: string
  description: string
  image_url: string
  stock: string
  is_available: boolean
  colors: string[]
  color_stocks: { color: string; stock: number }[]  // ← baru
  color_images: { color: string; image_url: string; file?: File; preview?: string }[]  // ← baru
}

const defaultForm: FormState = {
  name: '', price: '', category: '', description: '',
  image_url: '', stock: '0', is_available: true,
  colors: [],
  color_stocks: [],   // ← baru
  color_images: [],   // ← baru
}

// ── Komponen input tag warna ───────────────────────────────────────────────
function ColorTagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (colors: string[]) => void
}) {
  const [inputVal, setInputVal] = useState('')

  const addColor = (color: string) => {
    const trimmed = color.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInputVal('')
  }

  const removeColor = (color: string) => {
    onChange(value.filter(c => c !== color))
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addColor(inputVal)
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      {/* Chip warna yang dipilih */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map(color => (
            <span
              key={color}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: '#E3CAA5', color: '#3D2B1F' }}
            >
              <span
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: COLOR_HEX[color] ?? '#AD8B73',
                  border: color === 'Putih' ? '1px solid #CEAB93' : undefined,
                  flexShrink: 0,
                }}
              />
              {color}
              <button
                onClick={() => removeColor(color)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C6E5A', lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input teks custom */}
      <input
        placeholder="Ketik nama warna + Enter, atau pilih dari bawah..."
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
      />

      {/* Quick-pick preset */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESET_COLORS.filter(c => !value.includes(c)).map(color => (
          <button
            key={color}
            onClick={() => addColor(color)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:opacity-80"
            style={{ background: '#FAF5E8', border: '1px solid #E3CAA5', color: '#8C6E5A', cursor: 'pointer' }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: COLOR_HEX[color] ?? '#AD8B73',
              border: color === 'Putih' ? '1px solid #CEAB93' : undefined,
            }} />
            {color}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Halaman utama ──────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<FormState>(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('Semua')

  const [imageMode, setImageMode] = useState<ImageMode>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Fetch data ──────────────────────────────────────────────────────────
  const fetchAll = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('category').order('name'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (p) setProducts(p as Product[])
    if (c) setCategories(c as Category[])
  }

  useEffect(() => { fetchAll() }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview(null)
    setImageMode('upload')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Upload gambar ──────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 5MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false })
      if (uploadError) { toast.error('Gagal upload: ' + uploadError.message); return null }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(uploadData.path)
      return publicUrl
    } finally {
      setUploading(false)
    }
  }

  // ── Submit form ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return }
    setSaving(true)

    let finalImageUrl: string | null = null
    if (imageMode === 'upload' && imageFile) {
      finalImageUrl = await uploadImage(imageFile)
      if (!finalImageUrl) { setSaving(false); return }
    } else if (imageMode === 'url') {
      finalImageUrl = form.image_url.trim() || null
    } else if (editId) {
      const existing = products.find(p => p.id === editId)
      finalImageUrl = existing?.image_url ?? null
    }

    const uploadedColorImages: { color: string; image_url: string }[] = []
    for (const ci of form.color_images) {
      if (ci.file) {
        const url = await uploadImage(ci.file)
        if (url) uploadedColorImages.push({ color: ci.color, image_url: url })
      } else if (ci.image_url) {
        uploadedColorImages.push({ color: ci.color, image_url: ci.image_url })
      }
    }

    const payload = {
      name:         form.name.trim(),
      price:        parseFloat(form.price),
      category:     form.category || (categories[0]?.name ?? ''),
      description:  form.description.trim(),
      image_url: finalImageUrl,
      stock: form.color_stocks.length > 0
        ? form.color_stocks.reduce((s, c) => s + c.stock, 0)
        : parseInt(form.stock) || 0,
      color_stocks: form.color_stocks,
      color_images: uploadedColorImages,
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
    resetForm()
    fetchAll()
  }

  const toggleAvail = async (p: Product) => {
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    toast.success(`${p.name} → ${!p.is_available ? 'Tersedia' : 'Tidak tersedia'}`)
    fetchAll()
  }

  const updateStock = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta)
    // Stok mempengaruhi stok saja, is_available tetap dikelola manual
    await supabase.from('products').update({ stock: newStock }).eq('id', p.id)
    fetchAll()
  }

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Hapus "${p.name}"? Ini tidak bisa dibatalkan.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    toast.success('Produk dihapus')
    fetchAll()
  }

  const startEdit = (p: Product) => {
    setEditId(p.id)
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      stock: String(p.stock),
      is_available: p.is_available,
      colors: p.colors ?? [],
      color_stocks: (p.color_stocks ?? []),
      color_images: (p.color_images ?? []).map(ci => ({
        color: ci.color,
        image_url: ci.image_url,
      })),
    })
    setShowForm(true)
  }

  // Sync color_stocks & color_images ketika form.colors berubah
  const syncColorArrays = (newColors: string[], currentColorStocks: FormState['color_stocks'], currentColorImages: FormState['color_images']) => {
    // Hapus warna yang sudah dihapus, pertahankan yang masih ada
    const newStocks = newColors.map(c =>
      currentColorStocks.find(cs => cs.color === c) ?? { color: c, stock: 0 }
    )
    const newImages = newColors.map(c =>
      currentColorImages.find(ci => ci.color === c) ?? { color: c, image_url: '' }
    )
    return { newStocks, newImages }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none'
  const inputStyle = { border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F', fontFamily: 'var(--font-sans)' }

  const filtered = products.filter(p => filterCat === 'Semua' || p.category === filterCat)

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            Kelola Produk
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>{products.length} produk terdaftar</p>
        </div>
        <button
          onClick={() => { setEditId(null); resetForm(); setShowForm(true) }}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#AD8B73', color: '#FFFBE9' }}
        >
          + Tambah Produk
        </button>
      </div>

      {/* ── Form tambah/edit ─────────────────────────────────────────── */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#FFFBE9', border: '1.5px solid #AD8B73' }}>
          <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
            {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Nama */}
            <input
              placeholder="Nama produk *"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className={`${inputCls} md:col-span-2`}
              style={inputStyle}
            />

            {/* Harga */}
            <input
              type="number" placeholder="Harga (Rp) *"
              value={form.price}
              onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
              className={inputCls} style={inputStyle}
            />

            {/* Stok */}
            <input
              type="number" placeholder="Stok" min="0"
              value={form.stock}
              onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
              className={inputCls} style={inputStyle}
            />

            {/* Kategori */}
            <select
              value={form.category || (categories[0]?.name ?? '')}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className={inputCls} style={inputStyle}
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            {/* Status Ketersediaan ← FIX: sekarang eksplisit */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9' }}
            >
              <span className="text-sm" style={{ color: '#3D2B1F' }}>Tampil di Toko?</span>
              <button
                onClick={() => setForm(prev => ({ ...prev, is_available: !prev.is_available }))}
                className="flex items-center gap-2 text-sm font-semibold transition-all"
                style={{ color: form.is_available ? '#2E7D32' : '#8C6E5A' }}
              >
                <div
                  style={{
                    width: 40, height: 22,
                    borderRadius: 11,
                    background: form.is_available ? '#2E7D32' : '#E3CAA5',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 3, left: form.is_available ? 21 : 3,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: '#FFFBE9',
                    transition: 'left 0.2s',
                  }} />
                </div>
                {form.is_available ? 'Tersedia' : 'Disembunyikan'}
              </button>
            </div>

            {/* Deskripsi */}
            <textarea
              placeholder="Deskripsi produk"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className={`${inputCls} md:col-span-2`}
              style={{ ...inputStyle, resize: 'none' }}
            />

            {/* ── Gambar Produk ── */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>
                Gambar Produk
              </p>
              <div className="flex gap-2 mb-3">
                {(['upload', 'url'] as ImageMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setImageMode(mode); setImageFile(null); setImagePreview(null) }}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: imageMode === mode ? '#AD8B73' : '#E3CAA5', color: imageMode === mode ? '#FFFBE9' : '#8C6E5A' }}
                  >
                    {mode === 'upload' ? '📁 Upload File' : '🔗 Masukkan URL'}
                  </button>
                ))}
              </div>

              {imageMode === 'upload' ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl p-6 text-center cursor-pointer transition-all hover:opacity-80"
                    style={{ border: '2px dashed #CEAB93', background: '#FAF5E8' }}
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={imagePreview} alt="preview"
                          className="w-28 h-28 object-cover rounded-xl"
                          style={{ border: '2px solid #E3CAA5' }}
                        />
                        <p className="text-xs" style={{ color: '#8C6E5A' }}>
                          {imageFile?.name ?? 'Gambar saat ini'} · Klik untuk ganti
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-sm font-medium" style={{ color: '#AD8B73' }}>Klik untuk pilih gambar</p>
                        <p className="text-xs mt-1" style={{ color: '#CEAB93' }}>JPG, PNG, WEBP · Maks. 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden" onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div>
                  <input
                      placeholder="https://example.com/gambar.jpg"
                      value={form.image_url}
                    onChange={e => {
                      setForm(prev => ({ ...prev, image_url: e.target.value }))
                      setImagePreview(e.target.value || null)
                    }}
                    className={inputCls} style={inputStyle}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="mt-2 w-28 h-28 object-cover rounded-xl"
                      style={{ border: '2px solid #E3CAA5' }} onError={() => setImagePreview(null)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* ── Warna Tersedia (NEW) ── */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>
                🎨 Warna Tersedia
                <span className="ml-2 font-normal normal-case" style={{ color: '#CEAB93' }}>
                  ({form.colors.length} warna dipilih)
                </span>
              </p>
              <ColorTagInput
                value={form.colors}
                onChange={newColors => {
                  const { newStocks, newImages } = syncColorArrays(newColors, form.color_stocks, form.color_images)
                  setForm({ ...form, colors: newColors, color_stocks: newStocks, color_images: newImages })
                }}
              />
              {/* Stok & Gambar per Warna */}
              {form.colors.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>
                    Stok & Gambar per Warna
                  </p>
                  <div className="space-y-2">
                    {form.colors.map((color, idx) => {
                      const cs = form.color_stocks.find(c => c.color === color) ?? { color, stock: 0 }
                      const ci = form.color_images.find(c => c.color === color) ?? { color, image_url: '', preview: '' }

                      return (
                        <div key={color} className="flex flex-wrap items-center gap-2 p-3 rounded-xl"
                          style={{ background: '#FAF5E8', border: '1px solid #E3CAA5' }}>
                          {/* Dot warna */}
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                            background: COLOR_HEX[color] ?? '#AD8B73',
                            border: color === 'Putih' ? '1px solid #CEAB93' : undefined,
                          }} />
                          <span className="text-xs font-medium min-w-[80px]" style={{ color: '#3D2B1F' }}>
                            {color}
                          </span>

                          {/* Input stok */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: '#8C6E5A' }}>Stok:</span>
                            <input
                              type="number"
                              min="0"
                              value={cs.stock}
                              onChange={e => {
                                const updated = form.color_stocks.map(c =>
                                  c.color === color ? { ...c, stock: parseInt(e.target.value) || 0 } : c
                                )
                                setForm({ ...form, color_stocks: updated })
                              }}
                              className="w-16 px-2 py-1 rounded-lg text-xs text-center outline-none"
                              style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
                            />
                          </div>

                          {/* Input gambar (URL) */}
                          <div className="flex items-center gap-1 flex-1 min-w-[160px]">
                            <span className="text-xs" style={{ color: '#8C6E5A' }}>URL:</span>
                            <input
                              placeholder="URL gambar warna ini"
                              value={ci.image_url}
                              onChange={e => {
                                const updated = form.color_images.map(c =>
                                  c.color === color ? { ...c, image_url: e.target.value } : c
                                )
                                setForm({ ...form, color_images: updated })
                              }}
                              className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                              style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }}
                            />
                          </div>

                          {/* Upload file */}
                          <label className="px-2 py-1 rounded-lg text-xs cursor-pointer"
                            style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
                            📎 Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = ev => {
                                  const updated = form.color_images.map(c =>
                                    c.color === color
                                      ? { ...c, file, preview: ev.target?.result as string }
                                      : c
                                  )
                                  setForm({ ...form, color_images: updated })
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>

                          {/* Preview thumbnail */}
                          {(ci.preview || ci.image_url) && (
                            <img
                              src={ci.preview || ci.image_url}
                              alt={color}
                              className="w-10 h-10 rounded-lg object-cover"
                              style={{ border: '1px solid #E3CAA5' }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#CEAB93' }}>
                    * Stok total akan dihitung otomatis dari jumlah semua warna
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm"
              style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={saving || uploading}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#AD8B73', color: '#FFFBE9', opacity: saving || uploading ? 0.7 : 1 }}>
              {uploading ? 'Mengupload gambar...' : saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter kategori ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['Semua', ...categories.map(c => c.name)].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: filterCat === cat ? '#AD8B73' : '#E3CAA5', color: filterCat === cat ? '#FFFBE9' : '#8C6E5A' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Tabel produk ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#E3CAA5' }}>
                {['Produk', 'Kategori', 'Harga', 'Warna', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8C6E5A' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: '#CEAB93' }}>
                    Belum ada produk
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id}
                  style={{ background: i % 2 === 0 ? '#FFFBE9' : '#FEFDF5', borderBottom: '1px solid #F5ECD8' }}>

                  {/* Produk */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: '#E3CAA5' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: 16, fontStyle: 'italic' }}>S</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#3D2B1F' }}>{p.name}</p>
                        {p.description && (
                          <p className="text-xs truncate max-w-[160px]" style={{ color: '#8C6E5A' }}>{p.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="px-4 py-3 text-xs" style={{ color: '#8C6E5A' }}>{p.category}</td>

                  {/* Harga */}
                  <td className="px-4 py-3 font-semibold" style={{ color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                    {formatRupiah(p.price)}
                  </td>

                  {/* Warna */}
                  <td className="px-4 py-3">
                    {(p.colors?.length ?? 0) > 0 ? (
                      <div className="flex items-center gap-1">
                        {(p.colors ?? []).slice(0, 5).map(c => (
                          <div key={c} title={c} style={{
                            width: 12, height: 12, borderRadius: '50%',
                            background: COLOR_HEX[c] ?? '#AD8B73',
                            border: c === 'Putih' ? '1px solid #E3CAA5' : '1px solid rgba(255,255,255,0.3)',
                            flexShrink: 0,
                          }} />
                        ))}
                        {(p.colors?.length ?? 0) > 5 && (
                          <span className="text-xs" style={{ color: '#CEAB93' }}>+{(p.colors?.length ?? 0) - 5}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: '#E3CAA5' }}>—</span>
                    )}
                  </td>

                  {/* Stok */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateStock(p, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                        style={{ background: '#E3CAA5', color: '#3D2B1F' }}>−</button>
                      <span className="w-8 text-center text-sm font-semibold" style={{ color: '#3D2B1F' }}>
                        {p.stock}
                      </span>
                      <button onClick={() => updateStock(p, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                        style={{ background: '#AD8B73', color: '#FFFBE9' }}>+</button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvail(p)}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: p.is_available ? '#D4EDDA' : '#F8D7DA',
                        color: p.is_available ? '#155724' : '#721C24',
                      }}>
                      {p.is_available ? '✓ Tersedia' : '✗ Disembunyikan'}
                    </button>
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit(p)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(p)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#F8D7DA', color: '#721C24' }}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}