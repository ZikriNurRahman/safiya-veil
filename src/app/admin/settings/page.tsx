'use client'
// src/app/admin/settings/page.tsx

// Import Hook
import { useAdminSettings } from '@/hooks/useAdminSettings'

// Import Components Terpisah
import { StoreInfoForm } from '@/components/admin/settings/StoreInfoForm'
import { CategoryManager } from '@/components/admin/settings/CategoryManager'

export default function AdminSettingsPage() {
  // Panggil logika data dari Custom Hook
  const {
    settings, setSettings, categories,
    loadingSettings, savingSet,
    saveSettings, addCategory, deleteCategory
  } = useAdminSettings()

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
          Pengaturan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8C6E5A' }}>
          Konfigurasi toko Safiya Veil
        </p>
      </div>

      {/* ── KOTAK INFO TOKO ── */}
      <StoreInfoForm
        settings={settings}
        setSettings={setSettings}
        loadingSettings={loadingSettings}
        savingSet={savingSet}
        saveSettings={saveSettings}
      />

      {/* ── KOTAK KATEGORI PRODUK ── */}
      <CategoryManager
        categories={categories}
        addCategory={addCategory}
        deleteCategory={deleteCategory}
      />
    </div>
  )
}