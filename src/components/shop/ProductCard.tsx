'use client'
// src/components/shop/ProductCard.tsx
// Card produk hijab untuk halaman toko publik
// Design: clean, elegant, image-first

import { useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'
import { toast } from 'sonner'

interface Props {
  product: Product
  index?: number // untuk stagger animation delay
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem     = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  // Animasi feedback sesaat setelah add to cart
  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    toast.success(`${product.name} ditambahkan ke keranjang`)
    setTimeout(() => setAdded(false), 1500)
  }

  // Stagger delay berdasarkan index
  const delays = ['0ms', '60ms', '120ms', '180ms', '240ms', '300ms']
  const delay = delays[index % delays.length]

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{
        background: '#FFFBE9',
        border: '1px solid #E3CAA5',
        boxShadow: '0 2px 12px rgba(173,139,115,0.08)',
        animationDelay: delay,
        opacity: 0, // akan di-animate oleh CSS
        animationFillMode: 'forwards',
      }}
    >
      {/* Gambar produk */}
      <div
        className="relative overflow-hidden aspect-square"
        style={{ background: '#E3CAA5' }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Placeholder elegan kalau belum ada gambar
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #E3CAA5, #CEAB93)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(173,139,115,0.3)' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                color: '#AD8B73',
                fontSize: '28px',
                fontStyle: 'italic',
              }}>
                S
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: '#AD8B73' }}>
              Safiya Veil
            </span>
          </div>
        )}

        {/* Badge stok habis */}
        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(61,43,31,0.6)' }}>
            <span
              className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{ background: '#3D2B1F', color: '#E3CAA5' }}
            >
              Stok Habis
            </span>
          </div>
        )}

        {/* Badge kategori */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(255,251,233,0.9)', color: '#AD8B73' }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Info produk */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1">
          <h3
            className="text-base font-semibold leading-snug mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#8C6E5A' }}>
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Harga */}
          <div>
            <p
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: '#AD8B73' }}
            >
              {formatRupiah(product.price)}
            </p>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs" style={{ color: '#C0392B' }}>
                Sisa {product.stock} pcs
              </p>
            )}
          </div>

          {/* Tombol tambah */}
          <button
            onClick={handleAdd}
            disabled={!product.is_available || product.stock === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: added
                ? '#CEAB93'
                : !product.is_available || product.stock === 0
                ? '#E3CAA5'
                : '#AD8B73',
              color: !product.is_available || product.stock === 0
                ? '#8C6E5A'
                : '#FFFBE9',
              cursor: !product.is_available || product.stock === 0 ? 'not-allowed' : 'pointer',
              transform: added ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            {added ? '✓ Ditambah' : '+ Keranjang'}
          </button>
        </div>
      </div>
    </div>
  )
}