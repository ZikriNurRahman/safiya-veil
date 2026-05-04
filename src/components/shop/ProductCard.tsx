'use client'
// src/components/shop/ProductCard.tsx
// Card produk hijab — design premium, klik gambar = ke detail, klik tombol = add to cart

import { useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

interface Props {
  product: Product
  index?: number
}

const COLOR_HEX: Record<string, string> = {
  'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
  'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
  'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
  'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
  'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
  'Lavender': '#B39DDB', 'Mustard': '#BF9270', 'Peach': '#FFAB91',
  'Oranye': '#E65100', 'Biru': '#1565C0',
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const cartItems = useCartStore(s => s.items)

  // Warna default = warna pertama yang stoknya > 0
  const firstAvailColor =
    product.color_stocks?.find(cs => cs.stock > 0)?.color ??
    product.colors?.[0]

  const [selectedColor, setSelectedColor] = useState<string | undefined>(firstAvailColor)
  const [added, setAdded] = useState(false)

  // Cek apakah kombinasi produk+warna ini sudah ada di keranjang
  const inCart = cartItems.some(
    i => i.productId === product.id && i.selectedColor === selectedColor
  )

  // Stok untuk warna yang dipilih
  const selectedStock =
    selectedColor
      ? (product.color_stocks?.find(cs => cs.color === selectedColor)?.stock ?? product.stock)
      : product.stock

  const isUnavailable = !product.is_available || selectedStock === 0

  // ADD TO CART — e.stopPropagation() agar tidak trigger navigasi ke detail
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()  // ← FIX UTAMA: cegah klik bubble ke link parent
    e.preventDefault()

    if (isUnavailable) return

    addItem(product, selectedColor)
    setAdded(true)
    toast.success(`${product.name}${selectedColor ? ` — ${selectedColor}` : ''} ditambahkan!`)
    setTimeout(() => setAdded(false), 1500)
  }

  // Pilih warna — juga stop propagation
  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedColor(color)
  }

  // Gambar yang ditampilkan berdasarkan warna dipilih
  const displayImage =
    selectedColor
      ? (product.color_images?.find(ci => ci.color === selectedColor)?.image_url ?? product.image_url)
      : product.image_url

  // Animasi stagger berdasarkan index
  const staggerDelay = `${Math.min(index * 0.06, 0.36)}s`

  return (
    // Seluruh card = link ke detail produk
    <Link
      href={`/shop/${product.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div
        className="group flex flex-col"
        style={{
          background: '#FFFAF5',
          border: '1px solid #EDCDBB',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          animationDelay: staggerDelay,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(44,24,16,0.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* ── Gambar produk ── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '3/4', background: '#EDCDBB' }}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #EDCDBB, #E3B7A0)' }}>
              <span style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: 40, fontStyle: 'italic' }}>
                S
              </span>
            </div>
          )}

          {/* Badge stok habis */}
          {(!product.is_available || product.stock === 0) && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(44,24,16,0.55)' }}>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{ background: '#2C1810', color: '#E3B7A0' }}>
                Stok Habis
              </span>
            </div>
          )}

          {/* Badge kategori */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 text-xs"
              style={{ background: 'rgba(255,250,245,0.92)', color: '#8B6652' }}>
              {product.category}
            </span>
          </div>
        </div>

        {/* ── Info produk ── */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <div className="flex-1">
            <h3
              className="leading-snug mb-1"
              style={{
                fontFamily: 'var(--font-heading)',
                color: '#2C1810',
                fontSize: '0.97rem',
                fontWeight: 500,
              }}
            >
              {product.name}
            </h3>

            {product.description && (
              <p className="text-xs line-clamp-2" style={{ color: '#8B6652', lineHeight: 1.5 }}>
                {product.description}
              </p>
            )}
          </div>

          {/* Pilih warna — stop propagation supaya tidak navigasi ke detail */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1" onClick={e => e.preventDefault()}>
              {product.colors.slice(0, 6).map(color => {
                const stock = product.color_stocks?.find(cs => cs.color === color)?.stock ?? product.stock
                return (
                  <button
                    key={color}
                    onClick={e => handleColorClick(e, color)}  // ← stop propagation
                    disabled={stock === 0}
                    title={`${color} — stok: ${stock}`}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: COLOR_HEX[color] ?? '#BF9270',
                      border: selectedColor === color
                        ? '2px solid #2C1810'
                        : color === 'Putih' ? '1.5px solid #EDCDBB' : '1.5px solid transparent',
                      cursor: stock === 0 ? 'not-allowed' : 'pointer',
                      opacity: stock === 0 ? 0.3 : 1,
                      transition: 'border 0.15s',
                      flexShrink: 0,
                    }}
                  />
                )
              })}
              {product.colors.length > 6 && (
                <span style={{ fontSize: '0.65rem', color: '#BF9270', alignSelf: 'center' }}>
                  +{product.colors.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Harga + tombol */}
          <div className="flex items-center justify-between mt-auto pt-2"
            style={{ borderTop: '1px solid #EDCDBB' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', color: '#BF9270', fontSize: '1rem', fontWeight: 600 }}>
                {formatRupiah(product.price)}
              </p>
              {selectedColor && selectedStock > 0 && selectedStock <= 5 && (
                <p style={{ fontSize: '0.6rem', color: '#E65100' }}>Sisa {selectedStock} pcs</p>
              )}
            </div>

            {/* Tombol add to cart — WAJIB stopPropagation */}
            <button
              onClick={handleAdd}  // ← sudah ada stopPropagation di dalam handleAdd
              disabled={isUnavailable}
              style={{
                padding: '0.45rem 0.85rem',
                background: added
                  ? '#EDCDBB'
                  : isUnavailable
                    ? '#F0E8DF'
                    : '#2C1810',
                color: isUnavailable ? '#BF9270' : added ? '#8B6652' : '#FFEDDB',
                border: 'none',
                cursor: isUnavailable ? 'not-allowed' : 'pointer',
                fontSize: '0.62rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {added ? '✓ Ditambah' : inCart ? '+ Lagi' : '+ Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}