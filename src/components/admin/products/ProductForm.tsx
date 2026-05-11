'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category, Product } from '@/types/database'

// ── CONSTANTS & TYPES ──
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

export interface FormState {
    name: string; base_sku: string; price: string; sale_price: string; badge: string; category: string; description: string;
    image_url: string; stock: string; is_available: boolean; colors: string[];
    color_stocks: { color: string; stock: number; code?: string; hex?: string }[];
    color_images: { color: string; image_url: string; file?: File; preview?: string }[];
}

export const defaultForm: FormState = {
    name: '', base_sku: '', price: '', sale_price: '', badge: '', category: '', description: '', image_url: '', stock: '0',
    is_available: true, colors: [], color_stocks: [], color_images: [],
}

type ImageMode = 'upload' | 'url'

// ── COLOR TAG INPUT COMPONENT ──
function ColorTagInput({ value, onChange }: { value: string[]; onChange: (colors: string[]) => void }) {
    const [inputVal, setInputVal] = useState('')
    const addColor = (color: string) => {
        const trimmed = color.trim()
        if (!trimmed || value.includes(trimmed)) return
        onChange([...value, trimmed])
        setInputVal('')
    }
    const removeColor = (color: string) => onChange(value.filter(c => c !== color))
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addColor(inputVal) }
        else if (e.key === 'Backspace' && !inputVal && value.length > 0) onChange(value.slice(0, -1))
    }

    return (
        <div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {value.map(color => (
                        <span key={color} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLOR_HEX[color] ?? '#AD8B73', border: color === 'Putih' ? '1px solid #CEAB93' : undefined, flexShrink: 0 }} />
                            {color}
                            <button onClick={() => removeColor(color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C6E5A', lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                    ))}
                </div>
            )}
            <input placeholder="Ketik nama warna + Enter, atau pilih dari bawah..." value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={handleKey} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F' }} />
            <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_COLORS.filter(c => !value.includes(c)).map(color => (
                    <button key={color} onClick={() => addColor(color)} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:opacity-80" style={{ background: '#FAF5E8', border: '1px solid #E3CAA5', color: '#8C6E5A', cursor: 'pointer' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_HEX[color] ?? '#AD8B73', border: color === 'Putih' ? '1px solid #CEAB93' : undefined }} />
                        {color}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── MAIN FORM COMPONENT ──
interface ProductFormProps {
    editId: string | null
    initialData: FormState
    categories: Category[]
    products: Product[]
    onClose: () => void
}

export function ProductForm({ editId, initialData, categories, products, onClose }: ProductFormProps) {
    const [form, setForm] = useState<FormState>(initialData)
    const [saving, setSaving] = useState(false)
    const [imageMode, setImageMode] = useState<ImageMode>('upload')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { setForm(initialData) }, [initialData])

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
            const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(filename, file, { cacheControl: '3600', upsert: false })
            if (uploadError) { toast.error('Gagal upload: ' + uploadError.message); return null }
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(uploadData.path)
            return publicUrl
        } finally { setUploading(false) }
    }

    const handleSubmit = async () => {
        if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return }
        setSaving(true)

        let finalImageUrl: string | null = null
        if (imageMode === 'upload' && imageFile) {
            finalImageUrl = await uploadImage(imageFile)
            if (!finalImageUrl) { setSaving(false); return }
        } else if (imageMode === 'url') {
            finalImageUrl = form.image_url?.trim() || null
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
            name: form.name.trim(),
            base_sku: form.base_sku?.trim() || null,
            price: parseFloat(form.price),
            sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
            badge: form.badge?.trim() || null,
            category: form.category || (categories[0]?.name ?? ''),
            description: form.description?.trim() || '',
            image_url: finalImageUrl,
            is_available: form.is_available,
            colors: form.colors,
            stock: form.color_stocks.length > 0 ? form.color_stocks.reduce((s, c) => s + c.stock, 0) : parseInt(form.stock) || 0,
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
        onClose()
    }

    const syncColorArrays = (newColors: string[], currentColorStocks: FormState['color_stocks'], currentColorImages: FormState['color_images']) => {
        const newStocks = newColors.map(c => currentColorStocks.find(cs => cs.color === c) ?? { color: c, stock: 0, code: c.substring(0, 3).toUpperCase() })
        const newImages = newColors.map(c => currentColorImages.find(ci => ci.color === c) ?? { color: c, image_url: '' })
        return { newStocks, newImages }
    }

    const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none'
    const inputStyle = { border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#3D2B1F', fontFamily: 'var(--font-sans)' }

    return (
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#FFFBE9', border: '1.5px solid #AD8B73' }}>
            {/* header */}
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
                {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            {/* form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* nama produk */}
                <input placeholder="Nama produk *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className={`${inputCls} md:col-span-2`} style={inputStyle} />

                {/* sku */}
                <div className="md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8C6E5A' }}>Base SKU Produk</label>
                        <input
                            placeholder="Contoh: HJB-PSM"
                            value={form.base_sku || ''}
                            onChange={e => setForm({ ...form, base_sku: e.target.value.toUpperCase().replace(/\s/g, '-') })}
                            className={inputCls} style={inputStyle}
                        />
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            const cat = form.category || (categories[0]?.name ?? '')
                            const catCode = cat.substring(0, 3).toUpperCase()
                            const nameWords = form.name?.split(' ').filter(Boolean) || []
                            let nameCode = ''
                            if (nameWords.length >= 2) nameCode = (nameWords[0].substring(0, 2) + nameWords[1][0]).toUpperCase()
                            else if (nameWords.length === 1) nameCode = nameWords[0].substring(0, 3).toUpperCase()
                            if (catCode && nameCode) setForm({ ...form, base_sku: `${catCode}-${nameCode}` })
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all hover:opacity-90"
                        style={{ background: '#E3CAA5', color: '#3D2B1F', height: '42px' }}
                    >
                        ✨ Generate
                    </button>
                </div>

                {/* harga normal dan diskon*/}
                <input type="number" placeholder="Harga Normal (Rp) *" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} style={inputStyle} />
                <input type="number" placeholder="Harga Diskon / Coret (Rp) - Opsional" value={form.sale_price || ''} onChange={e => setForm({ ...form, sale_price: e.target.value })} className={inputCls} style={{ ...inputStyle, borderColor: form.sale_price ? '#C0392B' : '#E3CAA5' }} />

                {/* kategori */}
                <select value={form.category || (categories[0]?.name ?? '')} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} style={inputStyle}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                {/* badge */}
                <input placeholder="Label (cth: Best Seller) - Opsional" value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} maxLength={20} className={inputCls} style={inputStyle} />

                {/* tersedia atau draft */}
                <div className="md:col-span-2 flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9' }}>
                    <span className="text-sm" style={{ color: '#3D2B1F' }}>Tampil di Toko?</span>
                    <button onClick={() => setForm({ ...form, is_available: !form.is_available })} className="flex items-center gap-2 text-sm font-semibold transition-all" style={{ color: form.is_available ? '#2E7D32' : '#8C6E5A' }}>
                        <div style={{ width: 40, height: 22, borderRadius: 11, background: form.is_available ? '#2E7D32' : '#E3CAA5', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ position: 'absolute', top: 3, left: form.is_available ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFBE9', transition: 'left 0.2s' }} />
                        </div>
                        {form.is_available ? 'Tersedia' : 'Disembunyikan'}
                    </button>
                </div>

                {/* deskripsi */}
                <textarea placeholder="Deskripsi produk" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} md:col-span-2`} style={{ ...inputStyle, resize: 'none' }} />

                {/* Gambar Produk */}
                <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>Gambar Produk</p>
                    <div className="flex gap-2 mb-3">
                        {(['upload', 'url'] as ImageMode[]).map(mode => (
                            <button key={mode} onClick={() => { setImageMode(mode); setImageFile(null); setImagePreview(null) }} className="px-4 py-1.5 rounded-xl text-xs font-semibold" style={{ background: imageMode === mode ? '#AD8B73' : '#E3CAA5', color: imageMode === mode ? '#FFFBE9' : '#8C6E5A' }}>
                                {mode === 'upload' ? '📁 Upload File' : '🔗 Masukkan URL'}
                            </button>
                        ))}
                    </div>
                    {imageMode === 'upload' ? (
                        <div>
                            <div onClick={() => fileInputRef.current?.click()} className="rounded-xl p-6 text-center cursor-pointer hover:opacity-80" style={{ border: '2px dashed #CEAB93', background: '#FAF5E8' }}>
                                {imagePreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={imagePreview} alt="preview" className="w-28 h-28 object-cover rounded-xl border-2" style={{ borderColor: '#E3CAA5' }} />
                                        <p className="text-xs" style={{ color: '#8C6E5A' }}>{imageFile?.name ?? 'Gambar saat ini'} · Klik ganti</p>
                                    </div>
                                ) : <div><div className="text-3xl mb-2">🖼️</div><p className="text-sm font-medium" style={{ color: '#AD8B73' }}>Klik pilih gambar</p></div>}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <input placeholder="https://example.com/gambar.jpg" value={form.image_url || ''} onChange={e => { setForm({ ...form, image_url: e.target.value }); setImagePreview(e.target.value || null) }} className={inputCls} style={inputStyle} />
                    )}
                </div>

                {/* Warna */}
                <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>
                        🎨 Warna Tersedia <span className="ml-2 font-normal normal-case" style={{ color: '#CEAB93' }}>({form.colors.length} warna)</span>
                    </p>
                    <ColorTagInput value={form.colors} onChange={newColors => {
                        const { newStocks, newImages } = syncColorArrays(newColors, form.color_stocks, form.color_images)
                        setForm({ ...form, colors: newColors, color_stocks: newStocks, color_images: newImages })
                    }} />
                    {form.colors.length > 0 && (
                        <div className="md:col-span-2 mt-3 space-y-2">
                            {form.colors.map(color => {
                                const cs = form.color_stocks.find(c => c.color === color) ?? { color, stock: 0, code: '' }
                                const ci = form.color_images.find(c => c.color === color) ?? { color, image_url: '', preview: '' }
                                return (
                                    <div key={color} className="flex flex-wrap items-center gap-2 p-3 rounded-xl" style={{ background: '#FAF5E8', border: '1px solid #E3CAA5' }}>
                                        <div className="relative overflow-hidden shrink-0" style={{ width: 18, height: 18, borderRadius: '50%', background: cs.hex || COLOR_HEX[color] || '#AD8B73', border: color === 'Putih' ? '1px solid #CEAB93' : undefined, boxShadow: '0 0 0 1.5px #E3CAA5' }}>
                                            <input
                                                type="color"
                                                value={cs.hex || COLOR_HEX[color] || '#AD8B73'}
                                                onChange={e => setForm({ ...form, color_stocks: form.color_stocks.map(c => c.color === color ? { ...c, hex: e.target.value } : c) })}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                title="Klik untuk ubah warna"
                                            />
                                        </div>
                                        <span className="text-xs font-medium min-w-[70px]" style={{ color: '#3D2B1F' }}>{color}</span>

                                        <div className="flex items-center gap-1">
                                            <span className="text-xs" style={{ color: '#8C6E5A' }}>Kode:</span>
                                            <input
                                                maxLength={3}
                                                placeholder="XXX"
                                                value={cs.code || ''}
                                                onChange={e => setForm({ ...form, color_stocks: form.color_stocks.map(c => c.color === color ? { ...c, code: e.target.value.toUpperCase() } : c) })}
                                                className="w-12 px-1 py-1 rounded-lg text-xs text-center outline-none uppercase font-bold"
                                                style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9', color: '#AD8B73' }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span className="text-xs" style={{ color: '#8C6E5A' }}>Stok:</span>
                                            <input type="number" min="0" value={cs.stock} onChange={e => setForm({ ...form, color_stocks: form.color_stocks.map(c => c.color === color ? { ...c, stock: parseInt(e.target.value) || 0 } : c) })} className="w-16 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9' }} />
                                        </div>
                                        <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                                            <span className="text-xs" style={{ color: '#8C6E5A' }}>URL:</span>
                                            <input placeholder="URL gambar" value={ci.image_url || ''} onChange={e => setForm({ ...form, color_images: form.color_images.map(c => c.color === color ? { ...c, image_url: e.target.value } : c) })} className="flex-1 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1.5px solid #E3CAA5', background: '#FFFBE9' }} />
                                        </div>
                                        <label className="px-2 py-1 rounded-lg text-xs cursor-pointer" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>📎 Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                                                const file = e.target.files?.[0]; if (!file) return;
                                                const reader = new FileReader(); reader.onload = ev => setForm({ ...form, color_images: form.color_images.map(c => c.color === color ? { ...c, file, preview: ev.target?.result as string } : c) }); reader.readAsDataURL(file)
                                            }} />
                                        </label>
                                        {(ci.preview || ci.image_url) && <img src={ci.preview || ci.image_url} alt={color} className="w-10 h-10 rounded-lg object-cover" style={{ border: '1px solid #E3CAA5' }} />}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* button batal || upload */}
            <div className="flex gap-2 justify-end mt-4">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>Batal</button>
                <button onClick={handleSubmit} disabled={saving || uploading} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#AD8B73', color: '#FFFBE9', opacity: saving || uploading ? 0.7 : 1 }}>
                    {uploading ? 'Mengupload...' : saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </div>
    )
}