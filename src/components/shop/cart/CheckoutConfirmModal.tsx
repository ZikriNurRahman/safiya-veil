'use client'

import { formatRupiah } from '@/lib/utils'

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    total: number
    submitting: boolean
}

export function CheckoutConfirmModal({ isOpen, onClose, onConfirm, total, submitting }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay gelap */}
            <div
                className="absolute inset-0 transition-opacity"
                style={{ background: 'rgba(44,24,16,0.45)', backdropFilter: 'blur(2px)' }}
                onClick={!submitting ? onClose : undefined}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-fade-in-up"
                style={{ background: '#FFFBE9', border: '1.5px solid #E3CAA5' }}>

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center shrink-0 rounded-t-2xl"
                    style={{ borderBottom: '1px solid #E3CAA5', background: '#FAF5E8' }}>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
                        Konfirmasi Pesanan
                    </h3>
                    <button onClick={!submitting ? onClose : undefined}
                        style={{ color: '#8C6E5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                        ✕
                    </button>
                </div>

                {/* Body - Scrollable S&K */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm mb-4 font-medium" style={{ color: '#3D2B1F' }}>
                        Sebelum melanjutkan pembayaran sebesar <span className="font-bold" style={{ color: '#AD8B73' }}>{formatRupiah(total)}</span>, mohon baca dan setujui Syarat & Ketentuan kami:
                    </p>

                    {/* S&K Box */}
                    <div className="rounded-xl p-5 text-xs space-y-4"
                        style={{ background: '#FAF5E8', border: '1px solid #E3CAA5', color: '#8C6E5A', maxHeight: '240px', overflowY: 'auto' }}>

                        <div>
                            <strong style={{ color: '#3D2B1F' }}>1. Persetujuan Umum</strong>
                            <p className="mt-1">Dengan melanjutkan pesanan ini, Anda menyetujui semua syarat, ketentuan, dan kebijakan yang berlaku di Safiya Veil.</p>
                        </div>

                        <div>
                            <strong style={{ color: '#3D2B1F' }}>2. Deskripsi & Warna Produk</strong>
                            <p className="mt-1">Kami berusaha menampilkan informasi dan warna produk seakurat mungkin. Namun, kami tidak dapat menjamin tampilan warna pada layar monitor/HP Anda akan 100% akurat karena bergantung pada kualitas layar perangkat masing-masing.</p>
                        </div>

                        {/* 🔥 POIN 3 DIUBAH MENJADI DFOD & RISIKO 🔥 */}
                        <div>
                            <strong style={{ color: '#3D2B1F' }}>3. Biaya Pengiriman (DFOD) & Risiko</strong>
                            <p className="mt-1">
                                Sistem pengiriman kami menggunakan metode DFOD (Bayar Ongkir di Tujuan). Total tagihan di website <strong>belum termasuk biaya pengiriman</strong>. Ongkir dibayarkan secara tunai langsung kepada kurir ekspedisi saat paket tiba di alamat Anda. Risiko kehilangan beralih kepada Anda setelah paket kami serahkan ke pihak ekspedisi.
                            </p>
                        </div>

                        <div>
                            <strong style={{ color: '#3D2B1F' }}>4. Kebijakan Retur (Pengembalian)</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Barang harus dikembalikan dalam waktu 3 hari sejak tanggal diterima.</li>
                                <li>Barang harus dalam kondisi asli dan belum dipakai.</li>
                                <li>Semua label (tag) produk harus masih terpasang utuh.</li>
                                <li>Produk diskon (Sale) tidak dapat diretur atau dikembalikan.</li>
                            </ul>
                        </div>

                        <div>
                            <strong style={{ color: '#3D2B1F' }}>5. Kebijakan Privasi</strong>
                            <p className="mt-1">Informasi Anda aman bersama kami. Segala informasi yang Anda berikan tidak akan disalahgunakan atau dijual ke pihak lain. Kami hanya menggunakan data pribadi Anda murni untuk memproses dan menyelesaikan pesanan Anda.</p>
                        </div>
                    </div>
                </div>

                {/* Footer - Actions */}
                <div className="px-6 py-4 shrink-0 rounded-b-2xl flex justify-end gap-3"
                    style={{ borderTop: '1px solid #E3CAA5', background: '#FFFBE9' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ color: '#8C6E5A', background: '#F5ECD8' }}
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: '#3D2B1F', color: '#FFFBE9', opacity: submitting ? 0.7 : 1 }}
                    >
                        {submitting ? 'Memproses...' : 'Saya Setuju & Bayar'}
                    </button>
                </div>
            </div>
        </div>
    )
}