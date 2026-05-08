'use client'

import { useRouter } from 'next/navigation'

interface CheckoutSuccessProps {
    successOrder: {
        number: string
        payUrl?: string
    }
}

export function CheckoutSuccess({ successOrder }: CheckoutSuccessProps) {
    const router = useRouter()

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#E3CAA5' }}>
                <span className="text-4xl">✓</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', fontSize: '1.6rem', marginBottom: 8 }}>
                Pesanan Dibuat!
            </h2>
            <p className="text-sm mb-1" style={{ color: '#8C6E5A' }}>Nomor pesanan kamu:</p>
            <p className="text-xl font-bold mb-4" style={{ color: '#AD8B73' }}>
                {successOrder.number}
            </p>

            {successOrder.payUrl ? (
                <div className="space-y-3 w-full">
                    <p className="text-sm" style={{ color: '#8C6E5A' }}>Lanjutkan pembayaran:</p>
                    <a href={successOrder.payUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center" style={{ background: '#AD8B73', color: '#FFFBE9' }}>
                        Bayar Sekarang →
                    </a>
                </div>
            ) : (
                <p className="text-sm" style={{ color: '#8C6E5A' }}>
                    Tim kami akan menghubungi kamu untuk konfirmasi pembayaran.
                </p>
            )}

            <button onClick={() => router.push('/shop')} className="mt-6 text-sm" style={{ color: '#AD8B73' }}>
                ← Lanjut Belanja
            </button>
        </div>
    )
}