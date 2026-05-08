'use client'

import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'
import { COLOR_HEX } from '@/lib/constant'

interface CartItem {
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    selectedColor?: string
}

interface CartItemListProps {
    items: CartItem[]
    products: Record<string, Product>
    setItemColor: (productId: string, oldColor: string | undefined, newColor: string) => void
    decrementItem: (productId: string, selectedColor?: string) => void
    setQuantity: (productId: string, quantity: number, selectedColor?: string) => void
    removeItem: (productId: string, selectedColor?: string) => void
}

export function CartItemList({
    items, products, setItemColor, decrementItem, setQuantity, removeItem
}: CartItemListProps) {
    return (
        <div className="lg:col-span-3 space-y-4">
            {items.map(item => {
                const prod = products[item.productId]
                const availableColors = prod?.colors ?? []
                const colorStocks = prod?.color_stocks ?? []

                return (
                    <div
                        key={`${item.productId}-${item.selectedColor}`}
                        className="rounded-2xl p-4 flex gap-4"
                        style={{ background: '#FFFBE9', border: '1px solid #E3CAA5' }}
                    >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"
                            style={{ background: '#E3CAA5' }}>
                            {(() => {
                                const imgUrl = item.selectedColor
                                    ? (prod?.color_images?.find(ci => ci.color === item.selectedColor)?.image_url ?? prod?.image_url)
                                    : prod?.image_url
                                return imgUrl
                                    ? <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center">
                                        <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: 24, fontStyle: 'italic' }}>S</span>
                                    </div>
                            })()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#3D2B1F' }}>
                                {item.productName}
                            </p>

                            {/* Pilih warna (kalau produk punya warna) */}
                            {availableColors.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                                    {availableColors.map(color => {
                                        const stock = colorStocks.find(cs => cs.color === color)?.stock ?? 0
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => setItemColor(item.productId, item.selectedColor, color)}
                                                disabled={stock === 0}
                                                title={`${color} (stok: ${stock})`}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
                                                style={{
                                                    background: item.selectedColor === color ? '#AD8B73' : '#F5ECD8',
                                                    color: item.selectedColor === color ? '#FFFBE9' : '#8C6E5A',
                                                    opacity: stock === 0 ? 0.4 : 1,
                                                    cursor: stock === 0 ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                <span style={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    background: COLOR_HEX[color] ?? '#AD8B73',
                                                    flexShrink: 0,
                                                }} />
                                                {color}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            <p className="text-xs mb-2" style={{ color: '#AD8B73' }}>
                                {formatRupiah(item.unitPrice)}
                            </p>

                            {/* Qty controls */}


                            {(() => {
                                const currentStock = item.selectedColor
                                    ? (colorStocks.find(cs => cs.color === item.selectedColor)?.stock ?? 0)
                                    : (prod?.stock ?? 0)
                                const isMax = item.quantity >= currentStock

                                return (
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decrementItem(item.productId, item.selectedColor)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all"
                                                    style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                                                >−</button>
                                                <span className="w-6 text-center font-bold text-sm" style={{ color: '#3D2B1F' }}>
                                                    {item.quantity}
                                                </span>
                                                {/* PERBAIKAN: Tombol + dimatikan jika mencapai batas stok */}
                                                <button
                                                    onClick={() => setQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                                                    disabled={isMax}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all"
                                                    style={{
                                                        background: isMax ? '#E3CAA5' : '#AD8B73',
                                                        color: isMax ? '#8C6E5A' : '#FFFBE9',
                                                        cursor: isMax ? 'not-allowed' : 'pointer',
                                                        opacity: isMax ? 0.6 : 1
                                                    }}
                                                >+</button>
                                            </div>
                                            {/* TAMBAHAN: Peringatan sisa stok */}
                                            <p className="text-[0.65rem] font-medium" style={{ color: isMax ? '#C0392B' : '#AD8B73' }}>
                                                {isMax ? `Maks. stok: ${currentStock}` : `Sisa stok: ${currentStock}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold" style={{ color: '#AD8B73', fontFamily: 'var(--font-heading)' }}>
                                                {formatRupiah(item.unitPrice * item.quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.productId, item.selectedColor)}
                                                className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-red-200"
                                                style={{ background: '#F8D7DA', color: '#721C24' }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )
            })}

            <a href="/shop" className="text-sm" style={{ color: '#AD8B73' }}>
                ← Lanjut Belanja
            </a>
        </div>
    )
}