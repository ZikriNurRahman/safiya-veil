'use client'
// src/app/admin/settings/page.tsx
// BUG FIX: SectionCard dipindahkan ke luar komponen utama
// agar React tidak unmount/remount saat state berubah (cursor hilang)

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface Settings {
  store_name:    string
  store_address: string
  store_phones: string[]   // max 3
  store_socials: string[]   // max 5
  footer_text:   string
}

// ─────────────────────────────────────────────────────────────
// PENTING: SectionCard didefinisikan DI LUAR komponen utama.
// Kalau didefinisikan di dalam, React membuat tipe komponen baru
// setiap render → unmount/remount → cursor input hilang setiap ketik.
// ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid #E3CAA5' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #E3CAA5', background: '#FAF5E8' }}>
        <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
          {title}
        </h2>
      </div>
      <div className="p-5" style={{ background: '#FFFBE9' }}>
        {children}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1.5px solid #E3CAA5',
  background: '#FFFBE9',
  color: '#3D2B1F',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    store_name: 'Safiya Veil',
    store_address: '',
    store_phones: [''],
    store_socials: [''],
    footer_text: 'Terima kasih telah berbelanja di Safiya Veil ✨',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [savingSet, setSavingSet] = useState(false)
  const [savingCat, setSavingCat] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('store_settings').select('*').eq('id', 1).single(),
        supabase.from('categories').select('*').order('sort_order'),
      ])
      if (s) {
        setSettings({
          store_name: s.store_name ?? 'Safiya Veil',
          store_address: s.store_address ?? '',
          store_phones: Array.isArray(s.store_phones) && s.store_phones.length > 0 ? s.store_phones : [''],
          store_socials: Array.isArray(s.store_socials) && s.store_socials.length > 0 ? s.store_socials : [''],
          footer_text: s.footer_text ?? 'Terima kasih telah berbelanja di Safiya Veil ✨',
        })
      }
      if (c) setCategories(c as Category[])
      setLoadingSettings(false)
    }
    fetchAll()
  }, [])

  // ── Helper: update phone item ──
  const updatePhone = (i: number, val: string) => {
    const updated = [...settings.store_phones]
    updated[i] = val
    setSettings(prev => ({ ...prev, store_phones: updated }))
  }
  const addPhone = () => {
    if (settings.store_phones.length < 3)
      setSettings(prev => ({ ...prev, store_phones: [...prev.store_phones, ''] }))
  }
  const removePhone = (i: number) => {
    if (settings.store_phones.length <= 1) return
    setSettings(prev => ({ ...prev, store_phones: prev.store_phones.filter((_, idx) => idx !== i) }))
  }

  // ── Helper: update social item ──
  const updateSocial = (i: number, val: string) => {
    const updated = [...settings.store_socials]
    updated[i] = val
    setSettings(prev => ({ ...prev, store_socials: updated }))
  }
  const addSocial = () => {
    if (settings.store_socials.length < 5)
      setSettings(prev => ({ ...prev, store_socials: [...prev.store_socials, ''] }))
  }
  const removeSocial = (i: number) => {
    if (settings.store_socials.length <= 1) return
    setSettings(prev => ({ ...prev, store_socials: prev.store_socials.filter((_, idx) => idx !== i) }))
  }

  // ── Simpan pengaturan ──
  const saveSettings = async () => {
    setSavingSet(true)
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        id: 1,
        store_name: settings.store_name,
        store_address: settings.store_address,
        store_phones: settings.store_phones.filter(Boolean),
        store_socials: settings.store_socials.filter(Boolean),
        footer_text: settings.footer_text,
        updated_at: new Date().toISOString(),
      })
    if (error) toast.error('Gagal simpan: ' + error.message)
    else toast.success('Pengaturan disimpan!')
    setSavingSet(false)
  }

  // ── Kategori ──
  const addCategory = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    const { error } = await supabase.from('categories').insert({
      name: newCatName.trim(),
      sort_order: categories.length + 1,
    })
    if (error) toast.error('Gagal: ' + error.message)
    else {
      toast.success('Kategori ditambahkan!')
      setNewCatName('')
      const { data } = await supabase.from('categories').select('*').order('sort_order')
      if (data) setCategories(data as Category[])
    }
    setSavingCat(false)
  }

  const deleteCategory = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    toast.success('Kategori dihapus')
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    if (data) setCategories(data as Category[])
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
          Pengaturan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>
          Konfigurasi toko Safiya Veil
        </p>
      </div>

      {/* ─── Info Toko ─── */}
      <SectionCard title="🏪 Info Toko">
        {loadingSettings ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl skeleton" />
            ))}
          </div>
        ) : (
            <div className="space-y-4">
              {/* Nama Toko */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>
                Nama Toko
              </label>
              <input
                value={settings.store_name}
                  onChange={e => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                style={inputStyle}
              />
            </div>

              {/* Alamat */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>
                Alamat Toko
              </label>
              <input
                value={settings.store_address}
                  onChange={e => setSettings(prev => ({ ...prev, store_address: e.target.value }))}
                placeholder="Alamat lengkap toko"
                style={inputStyle}
              />
            </div>

              {/* ── Nomor WhatsApp/Telepon (max 3) ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>
                    Nomor WhatsApp / Telepon
                </label>
                  {settings.store_phones.length < 3 && (
                    <button
                      onClick={addPhone}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                    >
                      + Tambah
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {settings.store_phones.map((phone, i) => (
                    <div key={i} className="flex gap-2">
                    <input
                      value={phone}
                      onChange={e => updatePhone(i, e.target.value)}
                      placeholder={`Nomor ${i + 1} (e.g. 0812-xxxx-xxxx)`}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {settings.store_phones.length > 1 && (
                      <button
                        onClick={() => removePhone(i)}
                        className="px-3 rounded-xl text-xs font-bold shrink-0"
                        style={{ background: '#F8D7DA', color: '#721C24' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                </div>
                <p className="text-xs mt-1" style={{ color: '#CEAB93' }}>
                  Maksimal 3 nomor · {settings.store_phones.length}/3
                </p>
              </div>

              {/* ── Sosial Media (max 5) ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>
                    Sosial Media
                </label>
                  {settings.store_socials.length < 5 && (
                    <button
                      onClick={addSocial}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                    >
                      + Tambah
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {settings.store_socials.map((social, i) => (
                    <div key={i} className="flex gap-2">
                    <input
                      value={social}
                      onChange={e => updateSocial(i, e.target.value)}
                      placeholder={`Sosmed ${i + 1} (e.g. Instagram: @safiyaveil)`}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {settings.store_socials.length > 1 && (
                      <button
                        onClick={() => removeSocial(i)}
                        className="px-3 rounded-xl text-xs font-bold shrink-0"
                        style={{ background: '#F8D7DA', color: '#721C24' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                </div>
                <p className="text-xs mt-1" style={{ color: '#CEAB93' }}>
                  Maksimal 5 sosmed · {settings.store_socials.length}/5
                </p>
              </div>

              {/* Footer text */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>
                Pesan Footer
              </label>
              <textarea
                value={settings.footer_text}
                  onChange={e => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={saveSettings}
                disabled={savingSet}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#AD8B73', color: '#FFFBE9', opacity: savingSet ? 0.7 : 1 }}
              >
                {savingSet ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─── Kategori ─── */}
      <SectionCard title="🏷️ Kategori Produk">
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Nama kategori baru..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addCategory}
            disabled={savingCat || !newCatName.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
            style={{
              background: '#AD8B73', color: '#FFFBE9',
              opacity: savingCat || !newCatName.trim() ? 0.6 : 1,
            }}
          >
            + Tambah
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#CEAB93' }}>
            Belum ada kategori. Tambah kategori pertamamu!
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: '#FAF5E8', border: '1px solid #E3CAA5' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5 text-center" style={{ color: '#CEAB93' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium" style={{ color: '#3D2B1F' }}>
                    {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => deleteCategory(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ background: '#F8D7DA', color: '#721C24' }}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}