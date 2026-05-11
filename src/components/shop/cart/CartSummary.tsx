'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import type { OrderType, PaymentMethod } from '@/types/database'
import { CheckoutConfirmModal } from './CheckoutConfirmModal'

interface CartItem {
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    selectedColor?: string
}

interface CartSummaryProps {
    items: CartItem[]
    total: number
    customerName: string
    setCustomerName: (name: string) => void
    customerPhone: string
    setCustomerPhone: (phone: string) => void
    customerAddress: string
    setCustomerAddress: (addr: string) => void
    orderType: OrderType
    setOrderType: (type: OrderType) => void
    paymentMethod: PaymentMethod
    setPaymentMethod: (method: PaymentMethod) => void
    isReadyToCheckout: () => boolean
    submitting: boolean
    handleCheckout: () => void
}

export function CartSummary({
    items, total, customerName, setCustomerName, customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress, orderType, setOrderType,
    paymentMethod, setPaymentMethod, isReadyToCheckout, submitting, handleCheckout
}: CartSummaryProps) {

    // State untuk mengontrol kemunculan Modal S&K
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '11px 14px', borderRadius: 12,
        border: '1.5px solid #E3CAA5', background: '#FFFBE9',
        color: '#3D2B1F', fontSize: 14, outline: 'none',
        fontFamily: 'var(--font-sans)',
    }

    const triggerCheckout = () => {
        if (!isReadyToCheckout() || submitting) return
        setIsConfirmOpen(true)
    }

    const executeCheckout = () => {
        handleCheckout()
    }

    return (
        <div className="lg:col-span-2">
            <div className="rounded-2xl p-5 space-y-4 sticky top-24"
                style={{ background: '#FFFBE9', border: '1.5px solid #E3CAA5' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', fontSize: '1.1rem' }}>
                    Ringkasan Pesanan
                </h2>

                {/* Subtotal */}
                <div className="space-y-1.5 pb-3" style={{ borderBottom: '1px dashed #E3CAA5' }}>
                    {items.map(i => (
                        <div key={`${i.productId}-${i.selectedColor}`}
                            className="flex justify-between text-xs" style={{ color: '#8C6E5A' }}>
                            <span className="truncate pr-2 max-w-[150px]">
                                {i.productName}{i.selectedColor ? ` (${i.selectedColor})` : ''} ×{i.quantity}
                            </span>
                            <span>{formatRupiah(i.unitPrice * i.quantity)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-baseline">
                    <span className="text-sm" style={{ color: '#8C6E5A' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73', fontSize: '1.4rem', fontWeight: 600 }}>
                        {formatRupiah(total)}
                    </span>
                </div>

                {/* Form data diri */}
                <div className="space-y-2.5">
                    <input placeholder="Nama lengkap *" value={customerName}
                        onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
                    <input placeholder="Nomor WhatsApp *" value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)} style={inputStyle} />
                </div>

                {/* Order type */}
                <div className="grid grid-cols-2 gap-2">
                    {(['PICKUP', 'DELIVERY'] as OrderType[]).map(v => (
                        <button key={v} onClick={() => setOrderType(v)}
                            className="py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                background: orderType === v ? '#3D2B1F' : '#F5ECD8',
                                color: orderType === v ? '#FFFBE9' : '#8C6E5A',
                            }}>
                            {v === 'PICKUP' ? '🏪 Ambil di Toko' : '🚚 Dikirim (Delivery)'}
                        </button>
                    ))}
                </div>

                {/* Textarea jika Delivery HILANGKAN ALERT KUNING */}
                {orderType === 'DELIVERY' && (
                    <div className="animate-fade-in">
                        <textarea
                            placeholder="Alamat pengiriman lengkap (Jalan, RT/RW, Kel, Kec, Kota, Kode Pos) *"
                            value={customerAddress}
                            onChange={e => setCustomerAddress(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, resize: 'none' }}
                        />
                    </div>
                )}

                {/* Payment method */}
                <div className="mb-2 mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8C6E5A' }}>
                        Metode Pembayaran
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['QRIS'] as PaymentMethod[]).map(m => (
                            <button key={m} onClick={() => setPaymentMethod(m)}
                                className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                    background: paymentMethod === m ? '#AD8B73' : '#F5ECD8',
                                    color: paymentMethod === m ? '#FFFBE9' : '#8C6E5A',
                                }}>
                                {m === 'QRIS' ? '📱 QRIS' : '🏦 Bank Transfer'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tombol checkout (Buka Modal) */}
                <button
                    onClick={triggerCheckout}
                    disabled={!isReadyToCheckout() || submitting}
                    className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-opacity"
                    style={{
                        background: isReadyToCheckout() && !submitting ? '#3D2B1F' : '#E3CAA5',
                        color: isReadyToCheckout() && !submitting ? '#FFFBE9' : '#8C6E5A',
                        cursor: !isReadyToCheckout() || submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1
                    }}
                >
                    {submitting ? 'Memproses...' : `🔒 Bayar ${formatRupiah(total)}`}
                </button>

                <p className="text-xs text-center" style={{ color: '#CEAB93' }}>
                    Pembayaran aman via Midtrans
                </p>
            </div>

            <CheckoutConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeCheckout}
                total={total}
                submitting={submitting}
            />
        </div>
    )
}