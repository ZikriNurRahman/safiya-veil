'use client'
// src/app/shop/[productId]/page.tsx

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart.store'
import { toast } from 'sonner'
import type { Product } from '@/types/database'
import { FrapCart } from '@/components/shop/productId/FrapCart'
import { ProductGallery } from '@/components/shop/productId/ProductGallery'
import { ProductInfo } from '@/components/shop/productId/ProductInfo'

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const router = useRouter()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedColor, setSelectedColor] = useState<string | undefined>()
    const [activeImage, setActiveImage] = useState<string | null>(null)
    const [btnPressed, setBtnPressed] = useState(false)

    const addItem = useCartStore(s => s.addItem)
    const cartItems = useCartStore(s => s.items)

    useEffect(() => {
        if (!productId) return;

        let isMounted = true; // Mencegah memory leak saat user bolak-balik halaman dengan cepat

        const loadProduct = async () => {
            try {
                if (isMounted) setLoading(true);

                const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();

                if (error || !data) {
                    console.error("Produk tidak ditemukan:", error);
                    return; // Berhenti di sini, tapi blok 'finally' di bawah tetap akan jalan!
                }

                if (isMounted) {
                    const p = data as Product;
                    setProduct(p);
                    const firstColor = p.color_stocks?.find(cs => cs.stock > 0)?.color ?? p.colors?.[0];
                    setSelectedColor(firstColor);
                    const img = p.color_images?.find(ci => ci.color === (firstColor ?? ''))?.image_url ?? p.image_url;
                    setActiveImage(img ?? null);
                }
            } catch (err) {
                console.error("Terjadi kesalahan sistem:", err);
            } finally {
                // 🔥 KUNCI 2: Apapun yang terjadi (Sukses/Gagal/Error), LOADING WAJIB DIMATIKAN!
                if (isMounted) setLoading(false);
            }
        }

        loadProduct();

        return () => { isMounted = false; }
    }, [productId])

    const handleSelectColor = (color: string) => {
        setSelectedColor(color)
        const img = product?.color_images?.find(ci => ci.color === color)?.image_url ?? product?.image_url
        if (img) setActiveImage(img)
    }

    const handleAddToCart = () => {
        if (!product || btnPressed) return
        addItem(product, selectedColor)
        setBtnPressed(true)
        toast.success(`${product.name}${selectedColor ? ` — ${selectedColor}` : ''} ditambahkan!`)
        setTimeout(() => setBtnPressed(false), 1500)
    }

    const selectedStock = product?.color_stocks?.find(cs => cs.color === selectedColor)?.stock ?? product?.stock ?? 0
    const inCart = cartItems.some(i => i.productId === product?.id && i.selectedColor === selectedColor)
    const canAdd = product?.is_available && selectedStock > 0

    if (loading) return (
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2" style={{ gap: '3rem' }}>
            <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--card-radius)' }} />
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[[' 80%', 28], ['100%', 14], ['60%', 20]].map(([w, h], i) => (
                    <div key={i} className="skeleton" style={{ width: w, height: h, borderRadius: 8 }} />
                ))}
            </div>
        </div>
    )

    if (!product) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</p>
            <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-dark)', fontSize: '1.2rem', marginBottom: 20 }}>
                Produk tidak ditemukan
            </p>
            <button onClick={() => router.back()} className="btn-outline">
                ← Kembali
            </button>
        </div>
    )

    const allImages = [
        ...(product.image_url ? [{ color: null as string | null, url: product.image_url }] : []),
        ...(product.color_images ?? []).map(ci => ({ color: ci.color as string | null, url: ci.image_url })),
    ]

    return (
        <div style={{ background: 'var(--brand-primary)', minHeight: '80vh' }}>
            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.5rem' }}>

                {/* ── Breadcrumb ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginBottom: '2rem',
                    fontSize: '0.68rem', letterSpacing: 'var(--tracking-tight)',
                    color: 'var(--brand-muted)',
                }}>
                    <a href="/shop" style={{ color: 'var(--brand-accent)', textDecoration: 'none', fontWeight: 600 }}>Koleksi</a>
                    <span style={{ opacity: 0.4 }}>›</span>
                    <span>{product.category}</span>
                    <span style={{ opacity: 0.4 }}>›</span>
                    <span style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'start' }}>

                    {/* ── Gallery ── */}
                    <ProductGallery
                        activeImage={activeImage}
                        allImages={allImages}
                        setActiveImage={setActiveImage}
                        productName={product.name}
                    />

                    {/* ── Info Produk ── */}
                    <ProductInfo
                        product={product}
                        selectedColor={selectedColor}
                        selectedStock={selectedStock}
                        canAdd={canAdd}
                        inCart={inCart}
                        btnPressed={btnPressed}
                        handleSelectColor={handleSelectColor}
                        handleAddToCart={handleAddToCart}
                    />
                </div>
            </div>

            {/* Frap cart */}
            <FrapCart />
        </div>
    )
}