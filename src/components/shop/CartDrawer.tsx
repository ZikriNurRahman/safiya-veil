'use client'
// src/components/shop/CartDrawer.tsx
// Keranjang belanja yang muncul dari sisi kanan (drawer/slide-in)
// Berisi daftar produk, form checkout, dan tombol submit order

import { useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { formatRupiah, generateOrderNumber } from '@/lib/utils'
import type { OrderType, PaymentMethod } from '@/types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const {
    items, customerName, customerPhone, customerAddress,
    orderType, paymentMethod,
    decrementItem, removeItem, setCustomerName, setCustomerPhone,
    setCustomerAddress, setOrderType, setPaymentMethod,
    clearCart, getTotal, isReadyToCheckout,
  } = useCartStore()

  const [submitting,   setSubmitting]   = useState(false)
  const [cashReceived, setCashReceived] = useState('')
  const [successOrder, setSuccessOrder] = useState<string | null>(null) // nomor order

  const total   = getTotal()
  const cashNum = parseFloat(cashReceived) || 0
  const change  = cashNum - total

  // Submit order ke Supabase
  const handleCheckout = async () => {
    if (!isReadyToCheckout() || submitting) return
    if (paymentMethod === 'CASH' && cashNum > 0 && cashNum < total) {
      toast.error('Uang yang diterima kurang dari total!')
      return
    }

    setSubmitting(true)
    try {
      const orderNumber = generateOrderNumber()

      // Insert order
      const { data: order, error: e1 } = await supabase
        .from('orders')
        .insert({
          order_number:     orderNumber,
          customer_name:    customerName,
          customer_phone:   customerPhone,
          customer_address: customerAddress,
          order_type:       orderType,
          total_price:      total,
          payment_method:   paymentMethod,
          status:           'PENDING',
          cash_received:    paymentMethod === 'CASH' ? cashNum : 0,
          notes:            '',
        })
        .select()
        .single()

      if (e1) throw new Error(e1.message)

      // Insert order items
      const { error: e2 } = await supabase.from('order_items').insert(
        items.map(i => ({
          order_id:     order.id,
          product_id:   i.productId,
          product_name: i.productName,
          unit_price:   i.unitPrice,
          quantity:     i.quantity,
          notes:        i.notes,
        }))
      )

      if (e2) throw new Error(e2.message)

      // Kurangi stok produk
      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.productId,
          p_qty:        item.quantity,
        })
      }

      setSuccessOrder(orderNumber)
      clearCart()
      setCashReceived('')
      toast.success(`Order ${orderNumber} berhasil dibuat!`)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast.error(`Gagal: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Reset setelah order berhasil
  const handleReset = () => {
    setSuccessOrder(null)
    onClose()
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E3CAA5',
    background: '#FFFBE9',
    color: '#3D2B1F',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ background: 'rgba(61,43,31,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 'min(420px, 100vw)',
          background: '#FFFBE9',
          borderLeft: '1px solid #E3CAA5',
          boxShadow: '-8px 0 32px rgba(173,139,115,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #E3CAA5' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            Keranjang Belanja
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ background: '#E3CAA5', color: '#3D2B1F' }}
          >
            ✕
          </button>
        </div>

        {/* SUCCESS STATE */}
        {successOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: '#E3CAA5' }}>
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-semibold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
              Pesanan Diterima!
            </h3>
            <p className="text-sm mb-1" style={{ color: '#8C6E5A' }}>
              Nomor pesanan kamu:
            </p>
            <p className="text-lg font-bold mb-4" style={{ color: '#AD8B73' }}>
              {successOrder}
            </p>
            <p className="text-xs mb-6" style={{ color: '#8C6E5A' }}>
              Tim kami akan segera menghubungi kamu untuk konfirmasi pesanan.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#AD8B73', color: '#FFFBE9' }}
            >
              Kembali Belanja
            </button>
          </div>
        ) : (
          <>
            {/* EMPTY STATE */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{ background: '#E3CAA5' }}>
                  <span className="text-3xl">🛍️</span>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#3D2B1F' }}>
                  Keranjang masih kosong
                </p>
                <p className="text-xs" style={{ color: '#8C6E5A' }}>
                  Tambahkan produk yang kamu suka
                </p>
              </div>
            ) : (
              <>
                {/* DAFTAR ITEM */}
                <div className="flex-1 overflow-y-auto py-2">
                  {items.map(item => (
                    <div
                      key={item.productId}
                      className="px-5 py-3"
                      style={{ borderBottom: '1px solid #F5ECD8' }}
                    >
                      <div className="flex justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#3D2B1F' }}>
                            {item.productName}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#AD8B73' }}>
                            {formatRupiah(item.unitPrice)}
                          </p>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => decrementItem(item.productId)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-bold" style={{ color: '#3D2B1F' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => useCartStore.getState().setQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ background: '#AD8B73', color: '#FFFBE9' }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs ml-1"
                            style={{ background: '#F5ECD8', color: '#8C6E5A' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: '#CEAB93' }}>
                          {item.quantity} × {formatRupiah(item.unitPrice)}
                        </span>
                        <span className="text-xs font-bold" style={{ color: '#AD8B73' }}>
                          {formatRupiah(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FORM CHECKOUT */}
                <div
                  className="shrink-0 p-5 space-y-3"
                  style={{ borderTop: '1px solid #E3CAA5', background: '#FFFBE9' }}
                >
                  {/* Total */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm" style={{ color: '#8C6E5A' }}>Total</span>
                    <span
                      className="text-xl font-semibold"
                      style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}
                    >
                      {formatRupiah(total)}
                    </span>
                  </div>

                  {/* Nama */}
                  <input
                    placeholder="Nama lengkap *"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    style={inputStyle}
                  />

                  {/* No HP */}
                  <input
                    placeholder="Nomor WhatsApp *"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    style={inputStyle}
                  />

                  {/* Order type */}
                  <div className="grid grid-cols-2 gap-2">
                    {([['PICKUP', '🏪 Ambil di Toko'], ['DELIVERY', '🚚 Kirim ke Alamat']] as [OrderType, string][]).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setOrderType(v)}
                        className="py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: orderType === v ? '#AD8B73' : '#F5ECD8',
                          color: orderType === v ? '#FFFBE9' : '#8C6E5A',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Alamat (conditional) */}
                  {orderType === 'DELIVERY' && (
                    <textarea
                      placeholder="Alamat lengkap pengiriman *"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  )}

                  {/* Payment method */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['TRANSFER', 'QRIS', 'CASH'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className="py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: paymentMethod === m ? '#AD8B73' : '#F5ECD8',
                          color: paymentMethod === m ? '#FFFBE9' : '#8C6E5A',
                        }}
                      >
                        {m === 'TRANSFER' ? '🏦 Transfer' : m === 'QRIS' ? '📱 QRIS' : '💵 Cash'}
                      </button>
                    ))}
                  </div>

                  {/* Cash received */}
                  {paymentMethod === 'CASH' && (
                    <div>
                      <input
                        type="number"
                        placeholder="Uang yang dibayarkan (Rp)"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        style={inputStyle}
                      />
                      {cashNum > 0 && total > 0 && (
                        <p className="text-xs font-bold text-right mt-1"
                          style={{ color: change >= 0 ? '#2E7D32' : '#C0392B' }}>
                          {change >= 0 ? `Kembalian: ${formatRupiah(change)}` : `Kurang: ${formatRupiah(-change)}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tombol checkout */}
                  <button
                    onClick={handleCheckout}
                    disabled={!isReadyToCheckout() || submitting}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all"
                    style={{
                      background: isReadyToCheckout() && !submitting ? '#AD8B73' : '#E3CAA5',
                      color: isReadyToCheckout() && !submitting ? '#FFFBE9' : '#8C6E5A',
                      cursor: !isReadyToCheckout() || submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Memproses...' : '✓ Buat Pesanan'}
                  </button>

                  <p className="text-xs text-center" style={{ color: '#CEAB93' }}>
                    Tim kami akan menghubungi kamu untuk konfirmasi
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}