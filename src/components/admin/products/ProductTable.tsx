'use client'

import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'

// ... (COLOR_HEX biarkan tetap sama) ...
const COLOR_HEX: Record<string, string> = {
    'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
    'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
    'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
    'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
    'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
    'Lavender': '#B39DDB', 'Mustard': '#D4A017', 'Peach': '#FFAB91',
    'Oranye': '#E65100', 'Biru': '#1565C0',
}

interface ProductTableProps {
    products: Product[]
    filterCat: string
    onEdit: (p: Product) => void
    onDelete: (p: Product) => void
    onToggleAvail: (p: Product) => void
}

export function ProductTable({ products, filterCat, onEdit, onDelete, onToggleAvail }: ProductTableProps) {
    const filtered = products.filter(p => filterCat === 'Semua' || p.category === filterCat)

    return (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E3CAA5' }}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ background: '#E3CAA5' }}>
                            {/* 🔥 TAMBAHAN: Kolom SKU */}
                            {['SKU', 'Produk', 'Kategori', 'Harga', 'Warna', 'Stok', 'Status', 'Aksi'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8C6E5A' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: '#CEAB93' }}>
                                    Belum ada produk
                                </td>
                            </tr>
                        ) : filtered.map((p, i) => (
                            <tr key={p.id} style={{ background: i % 2 === 0 ? '#FFFBE9' : '#FEFDF5', borderBottom: '1px solid #F5ECD8' }}>
                                {/* 🔥 TAMBAHAN: Tampilan SKU */}
                                <td className="px-4 py-3 font-semibold text-xs tracking-wider" style={{ color: '#AD8B73' }}>
                                    {p.base_sku || '-'}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: '#E3CAA5' }}>
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
                                <td className="px-4 py-3 text-xs" style={{ color: '#8C6E5A' }}>{p.category}</td>
                                <td className="px-4 py-3 font-semibold" style={{ color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                                    {formatRupiah(p.price)}
                                </td>
                                <td className="px-4 py-3">
                                    {(p.colors?.length ?? 0) > 0 ? (
                                        <div className="flex items-center gap-1">
                                            {(p.colors ?? []).slice(0, 5).map(c => (
                                                <div key={c} title={c} style={{
                                                    width: 12, height: 12, borderRadius: '50%', background: COLOR_HEX[c] ?? '#AD8B73',
                                                    border: c === 'Putih' ? '1px solid #E3CAA5' : '1px solid rgba(255,255,255,0.3)', flexShrink: 0,
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
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <span className="w-8 text-center text-sm font-semibold" style={{ color: '#3D2B1F' }}>{p.stock}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => onToggleAvail(p)}
                                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all"
                                        style={{ background: p.is_available ? '#D4EDDA' : '#F8D7DA', color: p.is_available ? '#155724' : '#721C24' }}>
                                        {p.is_available ? '✓ Tersedia' : '✗ Disembunyikan'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <button onClick={() => onEdit(p)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#E3CAA5', color: '#3D2B1F' }}>Edit</button>
                                        <button onClick={() => onDelete(p)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#F8D7DA', color: '#721C24' }}>Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}