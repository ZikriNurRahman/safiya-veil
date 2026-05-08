'use client'

interface POSCartProps {
    cart: any[]
    setCart: (cart: any[]) => void
    paymentMethod: 'CASH' | 'QRIS'
    setPaymentMethod: (method: 'CASH' | 'QRIS') => void
    loading: boolean
    onProcessSale: () => void
}

export function POSCart({
    cart, setCart, paymentMethod, setPaymentMethod, loading, onProcessSale
}: POSCartProps) {

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="font-semibold mb-4 border-b pb-2 text-[#3D2B1F]">Ringkasan Penjualan</h2>

            <div className="flex-1 overflow-y-auto min-h-[200px]">
                {cart.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-10">Belum ada item ditambahkan.</p>
                ) : (
                    <div className="space-y-3">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                <div>
                                    <p className="font-medium text-sm text-[#3D2B1F]">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {item.color && <span className="mr-2">Warna: {item.color}</span>}
                                        {item.qty} x Rp {item.price.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                                    className="text-red-500 text-sm font-medium hover:underline"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold text-lg mb-4" style={{ color: '#3D2B1F' }}>
                    <span>Total Tagihan:</span>
                    <span>Rp {totalPrice.toLocaleString()}</span>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#8C6E5A' }}>
                        Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['CASH', 'QRIS'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setPaymentMethod(m)}
                                className="py-2.5 rounded-xl text-xs font-bold transition-all border"
                                style={{
                                    background: paymentMethod === m ? '#AD8B73' : '#F5ECD8',
                                    color: paymentMethod === m ? '#FFFBE9' : '#8C6E5A',
                                    borderColor: paymentMethod === m ? '#AD8B73' : 'transparent'
                                }}
                            >
                                {m === 'CASH' ? '💵 Tunai (Cash)' : '📱 QRIS'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onProcessSale}
                    disabled={loading || cart.length === 0}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                    style={{ background: '#2C1810' }}
                >
                    {loading ? 'Memproses...' : paymentMethod === 'QRIS' ? 'Buat Pembayaran QRIS' : 'Simpan Transaksi (Lunas)'}
                </button>
            </div>
        </div>
    )
}