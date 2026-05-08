'use client'

import { SectionCard } from '@/components/admin/SectionCard'
import type { Settings } from '@/hooks/useAdminSettings'

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '12px',
    border: '1.5px solid #E3CAA5', background: '#FFFBE9',
    color: '#3D2B1F', fontSize: '14px', outline: 'none',
    fontFamily: 'var(--font-sans)',
}

interface StoreInfoFormProps {
    settings: Settings
    setSettings: React.Dispatch<React.SetStateAction<Settings>>
    loadingSettings: boolean
    savingSet: boolean
    saveSettings: () => void
}

export function StoreInfoForm({ settings, setSettings, loadingSettings, savingSet, saveSettings }: StoreInfoFormProps) {

    // ── Helper UI: Array Updaters (Phone) ──
    const updatePhone = (i: number, val: string) => {
        const updated = [...settings.store_phones]; updated[i] = val;
        setSettings(prev => ({ ...prev, store_phones: updated }))
    }
    const addPhone = () => {
        if (settings.store_phones.length < 3) setSettings(prev => ({ ...prev, store_phones: [...prev.store_phones, ''] }))
    }
    const removePhone = (i: number) => {
        if (settings.store_phones.length > 1) setSettings(prev => ({ ...prev, store_phones: prev.store_phones.filter((_, idx) => idx !== i) }))
    }

    // ── Helper UI: Array Updaters (Social) ──
    const updateSocial = (i: number, val: string) => {
        const updated = [...settings.store_socials]; updated[i] = val;
        setSettings(prev => ({ ...prev, store_socials: updated }))
    }
    const addSocial = () => {
        if (settings.store_socials.length < 5) setSettings(prev => ({ ...prev, store_socials: [...prev.store_socials, ''] }))
    }
    const removeSocial = (i: number) => {
        if (settings.store_socials.length > 1) setSettings(prev => ({ ...prev, store_socials: prev.store_socials.filter((_, idx) => idx !== i) }))
    }

    return (
        <SectionCard title="🏪 Info Toko">
            {loadingSettings ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 rounded-xl skeleton" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Nama Toko */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>Nama Toko</label>
                        <input value={settings.store_name} onChange={e => setSettings(prev => ({ ...prev, store_name: e.target.value }))} style={inputStyle} />
                    </div>

                    {/* Alamat */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>Alamat Toko</label>
                        <input value={settings.store_address} onChange={e => setSettings(prev => ({ ...prev, store_address: e.target.value }))} placeholder="Alamat lengkap toko" style={inputStyle} />
                    </div>

                    {/* Nomor WhatsApp */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>Nomor WhatsApp / Telepon</label>
                            {settings.store_phones.length < 3 && (
                                <button onClick={addPhone} className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-80" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>+ Tambah</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {settings.store_phones.map((phone, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={phone} onChange={e => updatePhone(i, e.target.value)} placeholder={`Nomor ${i + 1} (e.g. 0812-xxxx-xxxx)`} style={{ ...inputStyle, flex: 1 }} />
                                    {settings.store_phones.length > 1 && (
                                        <button onClick={() => removePhone(i)} className="px-3 rounded-xl text-xs font-bold shrink-0 transition-opacity hover:opacity-80" style={{ background: '#F8D7DA', color: '#721C24' }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#CEAB93' }}>Maksimal 3 nomor · {settings.store_phones.length}/3</p>
                    </div>

                    {/* Sosial Media */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>Sosial Media</label>
                            {settings.store_socials.length < 5 && (
                                <button onClick={addSocial} className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-80" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>+ Tambah</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {settings.store_socials.map((social, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={social} onChange={e => updateSocial(i, e.target.value)} placeholder={`Sosmed ${i + 1} (e.g. Instagram: @safiyaveil)`} style={{ ...inputStyle, flex: 1 }} />
                                    {settings.store_socials.length > 1 && (
                                        <button onClick={() => removeSocial(i)} className="px-3 rounded-xl text-xs font-bold shrink-0 transition-opacity hover:opacity-80" style={{ background: '#F8D7DA', color: '#721C24' }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#CEAB93' }}>Maksimal 5 sosmed · {settings.store_socials.length}/5</p>
                    </div>

                    {/* Footer Text */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8C6E5A' }}>Pesan Footer</label>
                        <textarea value={settings.footer_text} onChange={e => setSettings(prev => ({ ...prev, footer_text: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'none' }} />
                    </div>

                    <div className="flex justify-end mt-4">
                        <button onClick={saveSettings} disabled={savingSet} className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: '#AD8B73', color: '#FFFBE9', opacity: savingSet ? 0.7 : 1 }}>
                            {savingSet ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </div>
            )}
        </SectionCard>
    )
}