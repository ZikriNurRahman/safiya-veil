'use client'

import { useState } from 'react'
import { SectionCard } from '@/components/admin/SectionCard'
import type { Category } from '@/types/database'

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '12px',
    border: '1.5px solid #E3CAA5', background: '#FFFBE9',
    color: '#3D2B1F', fontSize: '14px', outline: 'none',
    fontFamily: 'var(--font-sans)',
}

interface CategoryManagerProps {
    categories: Category[]
    addCategory: (name: string, onSuccess: () => void) => Promise<void>
    deleteCategory: (cat: Category) => Promise<void>
}

export function CategoryManager({ categories, addCategory, deleteCategory }: CategoryManagerProps) {
    const [newCatName, setNewCatName] = useState('')
    const [savingCat, setSavingCat] = useState(false)

    const handleAddCategory = async () => {
        setSavingCat(true)
        await addCategory(newCatName, () => setNewCatName('')) // Callback utk reset input
        setSavingCat(false)
    }

    return (
        <SectionCard title="🏷️ Kategori Produk">
            <div className="flex gap-2 mb-4">
                <input
                    placeholder="Nama kategori baru..."
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    style={{ ...inputStyle, flex: 1 }}
                />
                <button
                    onClick={handleAddCategory}
                    disabled={savingCat || !newCatName.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-opacity"
                    style={{ background: '#AD8B73', color: '#FFFBE9', opacity: savingCat || !newCatName.trim() ? 0.6 : 1 }}
                >
                    {savingCat ? '...' : '+ Tambah'}
                </button>
            </div>

            {categories.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#CEAB93' }}>
                    Belum ada kategori. Tambah kategori pertamamu!
                </p>
            ) : (
                <div className="space-y-2">
                    {categories.map((cat, i) => (
                        <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#FAF5E8', border: '1px solid #E3CAA5' }}>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold w-5 text-center" style={{ color: '#CEAB93' }}>{i + 1}</span>
                                <span className="text-sm font-medium" style={{ color: '#3D2B1F' }}>{cat.name}</span>
                            </div>
                            <button onClick={() => deleteCategory(cat)} className="px-3 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80" style={{ background: '#F8D7DA', color: '#721C24' }}>
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    )
}