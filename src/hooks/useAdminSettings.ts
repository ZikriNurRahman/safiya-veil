// src/hooks/useAdminSettings.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

export interface Settings {
    store_name: string
    store_address: string
    store_phones: string[]
    store_socials: string[]
    footer_text: string
}

export function useAdminSettings() {
    const [settings, setSettings] = useState<Settings>({
        store_name: 'Safiya Veil',
        store_address: '',
        store_phones: [''],
        store_socials: [''],
        footer_text: 'Terima kasih telah berbelanja di Safiya Veil ✨',
    })
    const [categories, setCategories] = useState<Category[]>([])
    const [savingSet, setSavingSet] = useState(false)
    const [loadingSettings, setLoadingSettings] = useState(true)

    // ── Fetch Data Awal ──
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

    // ── Simpan Pengaturan (Toko) ──
    const saveSettings = async () => {
        setSavingSet(true)
        const { error } = await supabase.from('store_settings').upsert({
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

    // ── Simpan/Hapus Kategori ──
    const addCategory = async (newCatName: string, onSuccess: () => void) => {
        if (!newCatName.trim()) return

        const { error } = await supabase.from('categories').insert({
            name: newCatName.trim(),
            sort_order: categories.length + 1,
        })

        if (error) {
            toast.error('Gagal: ' + error.message)
        } else {
            toast.success('Kategori ditambahkan!')
            onSuccess() // Callback untuk reset input text
            const { data } = await supabase.from('categories').select('*').order('sort_order')
            if (data) setCategories(data as Category[])
        }
    }

    const deleteCategory = async (cat: Category) => {
        if (!confirm(`Hapus kategori "${cat.name}"?`)) return
        await supabase.from('categories').delete().eq('id', cat.id)
        toast.success('Kategori dihapus')
        const { data } = await supabase.from('categories').select('*').order('sort_order')
        if (data) setCategories(data as Category[])
    }

    return {
        settings, setSettings,
        categories,
        loadingSettings,
        savingSet,
        saveSettings,
        addCategory,
        deleteCategory
    }
}