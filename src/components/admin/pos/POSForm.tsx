'use client'

interface POSFormProps {
    customerName: string
    setCustomerName: (name: string) => void
    setCustomerPhone: (phone: string) => void
    customerPhone: string
    products: any[]
    selectedProductId: string
    setSelectedProductId: (id: string) => void
    selectedColor: string
    setSelectedColor: (color: string) => void
    qty: number
    setQty: (qty: number) => void
    activeProduct: any
    currentStock: number
    currentInCart: number
    onAdd: () => void
}

export function POSForm({
    customerName, setCustomerName, setCustomerPhone, customerPhone,
    products, selectedProductId, setSelectedProductId,
    selectedColor, setSelectedColor,
    qty, setQty, activeProduct, currentStock, currentInCart, onAdd
}: POSFormProps) {
    return (
        <div className="bg-[#AD8B73] p-6 rounded-xl shadow-sm border border-gray-100 ">
            <h2 className="font-semibold mb-4 border-b pb-2 text-[#FFFBE9]">Tambah Item</h2>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-black">Nama Pelanggan (Opsional)</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder='nama pelanggan'
                        className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#AD8B73] bg-[#FFFBE9]"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-black">No. WhatsApp</label>
                    <input
                        placeholder="08..."
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none border-[1.5px] border-[#E3CAA5] bg-[#FFFBE9]"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-black">Pilih Produk</label>
                    <select
                        value={selectedProductId}
                        onChange={(e) => {
                            setSelectedProductId(e.target.value)
                            setSelectedColor('')
                        }}
                        className="w-full mt-1 p-2 border rounded-lg  outline-none focus:ring-2 focus:ring-[#AD8B73] bg-[#FFFBE9]"
                    >
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString()}</option>
                        ))}
                    </select>


                </div>

                {activeProduct && activeProduct.color_stocks && activeProduct.color_stocks.length > 0 && (
                    <div>
                        <label className="text-sm font-medium text-black">Pilih Warna (Varian)</label>
                        <select
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-lg bg-[#FFFBE9] outline-none focus:ring-2 focus:ring-[#AD8B73]"
                        >
                            <option value="">-- Pilih Warna --</option>
                            {activeProduct.color_stocks.map((cs: any) => (
                                <option key={cs.color} value={cs.color}>
                                    {cs.color} (Sisa: {cs.stock})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-black block mb-2">Jumlah (Qty)</label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            disabled={qty <= 1 || !activeProduct || (activeProduct.color_stocks?.length > 0 && !selectedColor)}
                            className="w-10 h-10 bg-[#FFFBE9] rounded-xl flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: '#3D2B1F', fontSize: '1.2rem' }}
                        >−</button>

                        <span className="w-10 text-center font-bold text-lg" style={{ color: '#3D2B1F' }}>
                            {qty}
                        </span>

                        <button
                            onClick={() => {
                                const maxAllowed = currentStock - currentInCart;
                                setQty(Math.min(maxAllowed, qty + 1));
                            }}
                            disabled={
                                !activeProduct ||
                                (activeProduct.color_stocks?.length > 0 && !selectedColor) ||
                                qty >= (currentStock - currentInCart)
                            }
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: qty >= (currentStock - currentInCart) ? '#FFFBE9' : '#FFFBE9',
                                color: qty >= (currentStock - currentInCart) ? '#3D2B1F' : '#3D2B1F',
                                fontSize: '1.2rem'
                            }}
                        >+</button>
                    </div>

                    {activeProduct && (selectedColor || !activeProduct.color_stocks?.length) && (
                        <p className={`text-xs mt-2 font-medium ${qty >= (currentStock - currentInCart) ? 'text-red-200' : 'text-black'}`}>
                            {qty >= (currentStock - currentInCart)
                                ? `Maksimal stok tercapai (${currentStock - currentInCart} pcs)`
                                : `Sisa stok tersedia: ${currentStock - currentInCart} pcs`
                            }
                        </p>
                    )}
                </div>

                <button
                    onClick={onAdd}
                    className="w-full mt-4 py-2 rounded-lg font-medium text-black transition-all hover:opacity-90"
                    style={{ background: '#FFFBE9' }}
                >
                    Tambah ke Daftar
                </button>
            </div>
        </div>
    )
}