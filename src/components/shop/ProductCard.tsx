'use client'
// src/components/shop/ProductCard.tsx
// Starbucks-inspired card design:
// • whisper-soft layered shadow (--shadow-card)
// • 12px border-radius (--card-radius)
// • scale(0.95) active on "Tambah" button
// • Color swatches dengan ring active (analog size-selector ring Starbucks)
// • Full-pill add button

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
  'Lavender': '#B39DDB', 'Mustard': '#D4A017', 'Peach': '#FFAB91',
  'Oranye': '#E65100', 'Biru': '#1565C0',
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const cartItems = useCartStore(s => s.items)

  const firstAvailColor =
    product.color_stocks?.find(cs => cs.stock > 0)?.color ??
    product.colors?.[0]

  const [selectedColor, setSelectedColor] = useState<string | undefined>(firstAvailColor)
  const [pressed, setPressed] = useState(false)

  const inCart = cartItems.some(i => i.productId === product.id && i.selectedColor === selectedColor)

  const selectedStock = selectedColor
    ? (product.color_stocks?.find(cs => cs.color === selectedColor)?.stock ?? product.stock)
    : product.stock

  const isUnavailable = !product.is_available || selectedStock === 0

  const displayImage = selectedColor
    ? (product.color_images?.find(ci => ci.color === selectedColor)?.image_url ?? product.image_url)
    : product.image_url

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (isUnavailable) return
    addItem(product, selectedColor)
    setPressed(true)
    toast.success(`${product.name}${selectedColor ? ` — ${selectedColor}` : ''} ditambahkan!`)
    setTimeout(() => setPressed(false), 1200)
  }

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedColor(color)
  }

  return (
    <Link
      href={`/shop/${product.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      {/* Card wrapper — whisper shadow + 12px radius */}
      <div
        style={{
          background: 'var(--brand-white)',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
          e.currentTarget.style.transform = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-card)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Gambar — 3:4 portrait */}
        <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--brand-secondary)', overflow: 'hidden' }}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="img-fade"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.55s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, var(--brand-secondary), var(--brand-tertiary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-accent)', fontSize: 40, fontStyle: 'italic', opacity: 0.35 }}>
                S
              </span>
            </div>
          )}

          {/* Stok habis overlay */}
          {isUnavailable && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(44,24,16,0.52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                background: 'var(--brand-dark)', color: 'var(--brand-tertiary)',
                padding: '0.3rem 0.8rem',
                fontSize: '0.58rem', fontWeight: 700,
                letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase',
                borderRadius: 50,
              }}>
                Stok Habis
              </span>
            </div>
          )}

          {/* Kategori badge — analog Starbucks PDP breadcrumb label */}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{
              background: 'rgba(255,250,245,0.9)',
              color: 'var(--brand-muted)',
              fontSize: '0.52rem',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              padding: '0.22rem 0.6rem',
              borderRadius: 50,
              backdropFilter: 'blur(4px)',
            }}>
              {product.category}
            </span>
          </div>
        </div>

        {/* Info produk */}
        <div style={{ padding: '0.85rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

          {/* Nama */}
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--brand-dark)',
            fontSize: '0.97rem',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: 'var(--tracking-tight)',
          }}>
            {product.name}
          </h3>

          {/* Deskripsi */}
          {product.description && (
            <p style={{
              fontSize: '0.72rem',
              color: 'var(--brand-muted)',
              lineHeight: 1.5,
              letterSpacing: 'var(--tracking-tight)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}

          {/* Color swatches — analog Starbucks size-selector ring style */}
          {product.colors && product.colors.length > 0 && (
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}
              onClick={e => e.preventDefault()}
            >
              {product.colors.slice(0, 7).map(color => {
                const stock = product.color_stocks?.find(cs => cs.color === color)?.stock ?? product.stock
                const isActive = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={e => handleColorClick(e, color)}
                    disabled={stock === 0}
                    title={`${color}${stock === 0 ? ' — habis' : ''}`}
                    style={{
                      width: 16, height: 16,
                      borderRadius: '50%',
                      background: COLOR_HEX[color] ?? 'var(--brand-accent)',
                      /* Ring aktif — analog Starbucks size-selector 2px solid ring */
                      border: isActive
                        ? '2px solid var(--brand-dark)'
                        : color === 'Putih'
                          ? '1.5px solid var(--brand-secondary)'
                          : '1.5px solid transparent',
                      outline: isActive ? '1.5px solid transparent' : 'none',
                      boxShadow: isActive ? '0 0 0 2px var(--brand-white)' : 'none',
                      cursor: stock === 0 ? 'not-allowed' : 'pointer',
                      opacity: stock === 0 ? 0.3 : 1,
                      transition: 'border 0.15s, box-shadow 0.15s, transform 0.15s',
                      transform: isActive ? 'scale(1.2)' : 'scale(1)',
                      flexShrink: 0,
                      display: stock === 0 ? 'none' : '',
                    }}
                  />
                )
              })}
              {product.colors.length > 7 && (
                <span style={{
                  fontSize: '0.58rem',
                  color: 'var(--brand-accent)',
                  alignSelf: 'center',
                }}>
                  +{product.colors.length - 7}
                </span>
              )}
            </div>
          )}

          {/* Harga + tombol add */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-auto pt-2.5 border-t"
            style={{ borderColor: 'var(--brand-secondary)' }}>
            {/* Harga */}
            <div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--brand-accent)',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}>
                {formatRupiah(product.price)}
              </p>

              {/* Tampilan Sisa Stok */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {selectedColor && selectedStock > 0 && selectedStock <= 5 && (
                  <p style={{ fontSize: '0.58rem', color: '#E65100', fontWeight: 600 }}>
                    Sisa {selectedStock} pcs
                  </p>
                )}
              </div>
            </div>

            {/* Add to cart */}
            {!isUnavailable && (
              <button
                onClick={handleAdd}
                disabled={isUnavailable}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 50,
                  background: pressed
                    ? 'var(--brand-secondary)'
                    : inCart
                      ? 'var(--brand-dark)'
                      : 'var(--brand-accent)',
                  color: 'var(--brand-white)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: 'var(--tracking-caps)',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  transform: 'scale(1)',
                  boxShadow: 'var(--shadow-card)',
                }}
                className="w-full sm:w-auto text-center justify-center flex"
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {pressed ? '✓ Ditambah' : inCart ? '✓ Di Keranjang' : '+ Keranjang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}