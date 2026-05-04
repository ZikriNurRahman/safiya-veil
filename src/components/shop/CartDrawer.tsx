'use client'
// src/components/shop/CartDrawer.tsx
// Keranjang belanja slide-in dari kanan — palette baru

import { useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { formatRupiah, generateOrderNumber } from '@/lib/utils'
import type { OrderType, PaymentMethod } from '@/types/database'
import Link from 'next/link'

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

  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<string | null>(null)

  const total = getTotal()

  const handleCheckout = async () => {
    if (!isReadyToCheckout() || submitting) return
    setSubmitting(true)
    try {
      const orderNumber = generateOrderNumber()

      const { data: order, error: e1 } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          order_type: orderType,
          total_price: total,
          payment_method: paymentMethod,
          status: 'PENDING',
          notes: '',
        })
        .select()
        .single()

      if (e1) throw new Error(e1.message)

      const { error: e2 } = await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.productId,
          product_name: i.productName,
          unit_price: i.unitPrice,
          quantity: i.quantity,
          notes: i.notes,
        }))
      )
      if (e2) throw new Error(e2.message)

      for (const item of items) {
        await supabase.rpc('decrement_stock', { p_product_id: item.productId, p_qty: item.quantity })
      }

      setSuccessOrder(orderNumber)
      clearCart()
      toast.success(`Order ${orderNumber} berhasil!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast.error(`Gagal: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #EDCDBB',
    background: '#FFFAF5',
    color: '#2C1810',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    borderRadius: 0,
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ background: 'rgba(44,24,16,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 'min(420px, 100vw)',
          background: '#FFEDDB',
          borderLeft: '1px solid #EDCDBB',
          boxShadow: '-8px 0 40px rgba(44,24,16,0.12)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #EDCDBB' }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#2C1810', fontSize: '1.1rem', fontWeight: 600 }}>
            Keranjang Belanja
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#EDCDBB', color: '#2C1810', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* SUCCESS */}
        {successOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#E3B7A0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, fontSize: '1.8rem',
            }}>✓</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#2C1810', fontSize: '1.3rem', marginBottom: 8 }}>
              Pesanan Diterima!
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#8B6652', marginBottom: 6 }}>Nomor pesanan kamu:</p>
            <p style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
              {successOrder}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#8B6652', marginBottom: 28, lineHeight: 1.7 }}>
              Tim kami akan segera menghubungi kamu untuk konfirmasi pesanan.
            </p>
            <button
              onClick={() => { setSuccessOrder(null); onClose() }}
              style={{
                padding: '0.8rem 2rem',
                background: '#2C1810', color: '#FFEDDB',
                border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              }}
            >
              Kembali Belanja
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#EDCDBB', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, fontSize: '1.8rem',
            }}>🛍️</div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2C1810', marginBottom: 6 }}>
              Keranjang masih kosong
            </p>
            <p style={{ fontSize: '0.75rem', color: '#8B6652' }}>Tambahkan produk yang kamu suka</p>
          </div>
        ) : (
          <>
            {/* DAFTAR ITEM */}
            <div className="flex-1 overflow-y-auto">
              {items.map(item => (
                <div key={`${item.productId}-${item.selectedColor ?? ''}`}
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid #EDCDBB' }}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2C1810', marginBottom: 2 }}>
                        {item.productName}
                      </p>
                      {item.selectedColor && (
                        <p style={{ fontSize: '0.7rem', color: '#BF9270', marginBottom: 2 }}>
                          Warna: {item.selectedColor}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: '#BF9270' }}>{formatRupiah(item.unitPrice)}</p>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => decrementItem(item.productId, item.selectedColor)}
                        style={{ width: 26, height: 26, background: '#EDCDBB', color: '#2C1810', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}
                      >−</button>
                      <span style={{ width: 22, textAlign: 'center', fontSize: '0.88rem', fontWeight: 700, color: '#2C1810' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => useCartStore.getState().setQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                        style={{ width: 26, height: 26, background: '#BF9270', color: '#FFEDDB', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}
                      >+</button>
                      <button
                        onClick={() => removeItem(item.productId, item.selectedColor)}
                        style={{ width: 26, height: 26, background: '#EDCDBB', color: '#8B6652', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginLeft: 4 }}
                      >✕</button>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span style={{ fontSize: '0.7rem', color: '#BF9270' }}>
                      {item.quantity} × {formatRupiah(item.unitPrice)}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2C1810' }}>
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* FORM CHECKOUT */}
            <div
              className="shrink-0 p-5 space-y-3"
              style={{ borderTop: '1px solid #EDCDBB', background: '#FFFAF5' }}
            >
              {/* Total */}
              <div className="flex justify-between items-baseline mb-1">
                <span style={{ fontSize: '0.78rem', color: '#8B6652' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: '1.4rem', fontWeight: 600 }}>
                  {formatRupiah(total)}
                </span>
              </div>

              <input placeholder="Nama lengkap *" value={customerName}
                onChange={e => setCustomerName(e.target.value)} style={inputStyle} />

              <input placeholder="Nomor WhatsApp *" value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)} style={inputStyle} />

              {/* Order type */}
              <div className="grid grid-cols-2 gap-2">
                {([['PICKUP', '🏪 Ambil di Toko'], ['DELIVERY', '🚚 Kirim ke Alamat']] as [OrderType, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setOrderType(v)}
                    style={{
                      padding: '0.6rem',
                      background: orderType === v ? '#2C1810' : '#EDCDBB',
                      color: orderType === v ? '#FFEDDB' : '#8B6652',
                      border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                      fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                    }}
                  >{l}</button>
                ))}
              </div>

              {orderType === 'DELIVERY' && (
                <textarea placeholder="Alamat lengkap *" value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  rows={2} style={{ ...inputStyle, resize: 'none' }} />
              )}

              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2">
                {(['TRANSFER', 'QRIS'] as PaymentMethod[]).map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    style={{
                      padding: '0.6rem',
                      background: paymentMethod === m ? '#2C1810' : '#EDCDBB',
                      color: paymentMethod === m ? '#FFEDDB' : '#8B6652',
                      border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                      fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                    }}
                  >
                    {m === 'TRANSFER' ? '🏦 Transfer' : '📱 QRIS'}
                  </button>
                ))}
              </div>

              {/* Checkout button */}
              <Link
                href="/shop/cart"
                onClick={onClose}
                style={{
                  display: 'block', width: '100%', padding: '0.9rem',
                  background: '#2C1810', color: '#FFEDDB',
                  textAlign: 'center', textDecoration: 'none',
                  fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Lihat Keranjang & Checkout →
              </Link>

              <p style={{ fontSize: '0.63rem', textAlign: 'center', color: '#BF9270' }}>
                Pilih warna & metode bayar di halaman keranjang
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}