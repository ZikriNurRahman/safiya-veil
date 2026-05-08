'use client'

import { useRouter } from 'next/navigation'

interface POSSuccessProps {
    successOrder: { number: string; payUrl?: string }
    onReset: () => void
}

export function POSSuccess({ successOrder, onReset }: POSSuccessProps) {
    const router = useRouter()

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto mt-10">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: '#E3CAA5', color: '#3D2B1F', fontSize: '2.5rem' }}>
                    ✓
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#3D2B1F' }}>Transaksi Berhasil Dibuat</h2>
                <p className="text-gray-500 mb-6">Nomor Pesanan: <span className="font-bold text-[#AD8B73]">{successOrder.number}</span></p>

                {successOrder.payUrl ? (
                    <div className="mb-8 p-6 rounded-xl" style={{ background: '#FFFBE9', border: '1px dashed #AD8B73' }}>
                        <p className="text-sm font-semibold mb-4" style={{ color: '#8C6E5A' }}>
                            Menunggu Pembayaran QRIS Pelanggan
                        </p>
                        <a
                            href={successOrder.payUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-md"
                            style={{ background: '#2E7D32' }}
                        >
                            Tampilkan QRIS 📱
                        </a>
                        <p className="text-xs mt-4 text-gray-500">
                            Klik tombol di atas untuk membuka tab baru berisi layar barcode QRIS yang siap di-scan pelanggan.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-8">Pembayaran tunai (Cash) telah lunas dan stok sudah dipotong.</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onReset}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all border hover:bg-[#F5ECD8]"
                        style={{ borderColor: '#AD8B73', color: '#AD8B73' }}
                    >
                        + Transaksi Baru
                    </button>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all text-white hover:opacity-90"
                        style={{ background: '#AD8B73' }}
                    >
                        Lihat Daftar Pesanan
                    </button>
                </div>
            </div>
        </div>
    )
}