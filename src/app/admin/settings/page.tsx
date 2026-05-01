'use client'
// src/app/admin/settings/page.tsx
// Pengaturan toko: nama, kontak, kategori produk

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface Settings {
  store_name:    string
  store_address: string
  store_phone:   string
  store_social:  string
  footer_text:   string
}

export default function AdminSettingsPage() {
  const [settings,    setSettings]    = useState<Settings>({
    store_name: 'Safiya Veil', store_address: '', store_phone: '',
    store_social: '', footer_text: 'Terima kasih telah berbelanja di Safiya Veil ✨',
  })
  const [categories,  setCategories]  = useState<Category[]>([])
  const [newCatName,  setNewCatName]  = useState('')
  const [savingSet,   setSavingSet]   = useState(false)
  const [savingCat,   setSavingCat]   = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('store_settings').select('*').eq('id', 1).single(),
        supabase.from('categories').select('*').order('sort_order'),
      ])
      if (s) setSettings({
        store_name:    s.store_name    ?? 'Safiya Veil',
        store_address: s.store_address ?? '',
        store_phone:   s.store_phone   ?? '',
        store_social:  s.store_social  ?? '',
        footer_text:   s.footer_text   ?? '',
      })
      if (c) setCategories(c as Category[])
      setLoadingSettings(false)
    }
    fetchAll()
  }, [])

  // Simpan pengaturan toko
  const saveSettings = async () => {
    setSavingSet(true)
    const { error } = await supabase
      .from('store_settings')
      .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })

    if (error) toast.error('Gagal simpan: ' + error.message)
    else toast.success('Pengaturan disimpan!')
    setSavingSet(false)
  }

  // Tambah kategori baru
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

  // Hapus kategori
  const deleteCategory = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk di kategori ini tidak ikut terhapus.`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    toast.success('Kategori dihapus')
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    if (data) setCategories(data as Category[])
  }

  const inputStyle = {
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

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
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

      {/* ─── Pengaturan Toko ─── */}
      <SectionCard title="🏪 Info Toko">
        {loadingSettings ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#8C6E5A' }}>
                Nama Toko
              </label>
              <input
                value={settings.store_name}
                onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#8C6E5A' }}>
                Alamat Toko
              </label>
              <input
                value={settings.store_address}
                onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                placeholder="Alamat lengkap toko"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#8C6E5A' }}>
                  Nomor WhatsApp
                </label>
                <input
                  value={settings.store_phone}
                  onChange={e => setSettings({ ...settings, store_phone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#8C6E5A' }}>
                  Instagram / Social Media
                </label>
                <input
                  value={settings.store_social}
                  onChange={e => setSettings({ ...settings, store_social: e.target.value })}
                  placeholder="@safiyaveil"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#8C6E5A' }}>
                Pesan Footer
              </label>
              <textarea
                value={settings.footer_text}
                onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
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

      {/* ─── Kategori Produk ─── */}
      <SectionCard title="🏷️ Kategori Produk">
        {/* Tambah kategori */}
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

        {/* Daftar kategori */}
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
                  <span className="text-xs font-bold w-5 text-center"
                    style={{ color: '#CEAB93' }}>
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