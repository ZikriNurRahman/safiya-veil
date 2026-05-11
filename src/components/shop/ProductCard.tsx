'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Check, Loader2, Star } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'
import Link from 'next/link'
import { toast } from 'sonner'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const COLOR_HEX: Record<string, string> = {
  'Hitam': '#1C1C1C', 'Putih': '#F5F5F5', 'Abu-abu': '#9CA3AF',
  'Navy': '#1E3A5F', 'Cokelat': '#795548', 'Krem': '#F5E6C8',
  'Dusty Pink': '#D4A5A5', 'Dusty Blue': '#7BA7BC', 'Dusty Rose': '#C9848E',
  'Merah': '#C0392B', 'Ungu': '#7B2D8B', 'Hijau': '#2E7D32',
  'Tosca': '#00897B', 'Maroon': '#800000', 'Sage': '#87AE73',
  'Lavender': '#B39DDB', 'Mustard': '#D4A017', 'Peach': '#FFAB91',
  'Oranye': '#E65100', 'Biru': '#1565C0',
}

interface Props {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const cartItems = useCartStore(s => s.items)
  const router = useRouter()

  const firstAvailColor = product.color_stocks?.find(cs => cs.stock > 0)?.color ?? product.colors?.[0]
  const [selectedColor, setSelectedColor] = useState<string | undefined>(firstAvailColor)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const allImages = [
    product.image_url,
    ...(product.color_images?.map(ci => ci.image_url) || [])
  ].filter(Boolean) as string[]

  const uniqueImages = Array.from(new Set(allImages))
  if (uniqueImages.length === 0) uniqueImages.push('')

  const selectedStock = selectedColor
    ? (product.color_stocks?.find(cs => cs.color === selectedColor)?.stock ?? product.stock)
    : product.stock

  const isUnavailable = !product.is_available || selectedStock === 0
  const inCart = cartItems.some(i => i.productId === product.id && i.selectedColor === selectedColor)

  const hasDiscount = product.sale_price && product.sale_price < product.price
  const discountPercent = hasDiscount ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isUnavailable || isAddedToCart) return

    setIsAddingToCart(true)
    setTimeout(() => {
      addItem(product, selectedColor)
      setIsAddingToCart(false)
      setIsAddedToCart(true)
      toast.success(`${product.name} dimasukkan keranjang!`)
      setTimeout(() => setIsAddedToCart(false), 2000)
    }, 600)
  }

  const handleToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Penting: biar gak malah masuk ke halaman detail produk
    router.push('/shop/cart')
  }

  return (
    <Link href={`/shop/${product.id}`} className="block group h-full">
      {/* PASTIKAN CARD TIDAK PUNYA PADDING DEFAULT (p-0) */}
      <Card className="w-full max-w-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col h-full border-[#E3CAA5] bg-[#FFFBE9] p-0">

        {/* 🔥 PERBAIKAN UTAMA: Tambah rounded-t-2xl, w-full, shrink-0 */}
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-[#FAF5E8] rounded-t-2xl">
          <AnimatePresence mode="wait">
            {uniqueImages[currentImageIndex] ? (
              <motion.img
                key={currentImageIndex}
                src={uniqueImages[currentImageIndex]}
                alt={`${product.name} view ${currentImageIndex + 1}`}
                // 🔥 KUNCI RAHASIA: absolute inset-0 memaksa foto nempel ujung ke ujung
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E3CAA5] to-[#CEAB93]">
                <span className="text-4xl font-serif italic text-[#FFFBE9] opacity-50">S</span>
              </div>
            )}
          </AnimatePresence>

          {isUnavailable && (
            <div className="absolute inset-0 bg-[#2C1810]/50 flex items-center justify-center z-10">
              <Badge className="bg-[#3D2B1F] hover:bg-[#3D2B1F] text-[#FFFBE9] font-bold tracking-widest uppercase border-none">
                Stok Habis
              </Badge>
            </div>
          )}

          {uniqueImages.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button variant="secondary" size="icon" onClick={prevImage} className="h-8 w-8 rounded-full bg-[#FFFBE9]/80 backdrop-blur-sm text-[#3D2B1F] hover:bg-[#FFFBE9] shadow-sm border-none">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={nextImage} className="h-8 w-8 rounded-full bg-[#FFFBE9]/80 backdrop-blur-sm text-[#3D2B1F] hover:bg-[#FFFBE9] shadow-sm border-none">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {uniqueImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {uniqueImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); setCurrentImageIndex(index); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-[#3D2B1F] w-4" : "bg-[#3D2B1F]/30 w-1.5"}`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 items-start">
            <Badge variant="secondary" className="bg-[#FFFBE9]/90 hover:bg-[#FFFBE9] text-[#8C6E5A] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm border-none">
              {product.category}
            </Badge>
            {product.badge && (
              <Badge className="bg-[#AD8B73] hover:bg-[#8C6E5A] text-[#FFFBE9] text-[10px] font-bold uppercase tracking-wider shadow-sm border-none">
                {product.badge}
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-[#C0392B] hover:bg-[#A93226] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm border-none">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Tombol like -- masukin ke wishlist */}
          {/* <Button
            variant="secondary"
            size="icon"
            onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-[#FFFBE9]/80 hover:bg-[#FFFBE9] backdrop-blur-sm shadow-sm z-20 transition-transform hover:scale-110 border-none"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-[#C0392B] text-[#C0392B]" : "text-[#8C6E5A]"}`} />
          </Button> */}
        </div>

        <CardContent className="p-4 flex flex-col flex-1 gap-4 border-none">
          <div>
            <h3 className="font-semibold line-clamp-1 text-lg" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
              {product.name}
            </h3>

          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: hasDiscount ? '#C0392B' : '#AD8B73' }}>
              {formatRupiah(product.sale_price || product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#8C6E5A] line-through font-medium">
                {formatRupiah(product.price)}
              </span>
            )}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2 mt-auto">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#8C6E5A]">
                Pilih Warna
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color
                  const cs = product.color_stocks?.find(c => c.color === color)
                  const stock = product.color_stocks?.find(cs => cs.color === color)?.stock ?? product.stock
                  const outOfStock = stock === 0

                  const dotColor = cs?.hex || COLOR_HEX[color] || '#AD8B73'

                  if (outOfStock) return null

                  return (
                    <button
                      key={color}
                      onClick={(e) => { e.preventDefault(); if (!outOfStock) setSelectedColor(color); }}
                      title={`${color}${outOfStock ? ' (Habis)' : ''}`}
                      className={`w-6 h-6 rounded-full transition-all duration-300 ${isSelected ? "ring-2 ring-[#3D2B1F] ring-offset-2 ring-offset-[#FFFBE9] scale-110" : "ring-1 ring-[#E3CAA5] hover:ring-[#AD8B73]"
                        } ${outOfStock ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: dotColor }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 border-none">
          <Button
            onClick={inCart ? handleToCart : handleAddToCart}
            // 🔥 Tombol hanya mati jika sedang loading, atau barang benar-benar habis dan belum ada di keranjang
            disabled={isAddingToCart || (!inCart && isUnavailable)}
            className={`w-full h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 ${isAddedToCart ? 'bg-[#2E7D32] hover:bg-[#276a2b]' :
              inCart ? 'bg-[#3D2B1F] hover:bg-[#2a1d15]' :
                'bg-[#AD8B73] hover:bg-[#8C6E5A]'
              } text-[#FFFBE9] border-none`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : isAddedToCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Berhasil Ditambah
              </>
            ) : inCart ? (
              <>
                {/* 🔥 Jika sudah di keranjang */}
                <ShoppingBag className="mr-2 h-4 w-4" />
                Pergi ke Keranjang
              </>
            ) : (
              <>
                {/* 🔥 Jika belum ada di keranjang */}
                <ShoppingBag className="mr-2 h-4 w-4" />
                Masukkan Keranjang
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}