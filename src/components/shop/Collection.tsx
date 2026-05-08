'use client'

import { ProductCard } from '@/components/shop/ProductCard'
import type { Product, Category } from '@/types/database'

function SkeletonCard() {
    return (
        <div style={{ background: 'var(--brand-white)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div className="skeleton" style={{ aspectRatio: '3/4' }} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 18, width: '45%', borderRadius: 6 }} />
            </div>
        </div>
    )
}

interface CollectionProps {
    products: Product[]
    categories: Category[]
    loading: boolean
    activeCategory: string
    setActiveCategory: (cat: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export function Collection({
    products, categories, loading, activeCategory, setActiveCategory, searchQuery, setSearchQuery
}: CollectionProps) {

    // Filter produk berdasarkan kategori dan pencarian
    const filtered = products.filter(p => {
        const matchCat = activeCategory === 'Semua' || p.category === activeCategory
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <section id="koleksi" style={{ background: 'var(--brand-primary)', padding: 'clamp(3rem, 7vw, 5rem) 1.5rem' }}>
            <div className="max-w-7xl mx-auto">

                {/* ── Section header & Search ── */}
                <div
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
                    style={{ borderBottom: '1px solid var(--brand-secondary)', paddingBottom: '1.25rem' }}
                >
                    <div>
                        <p style={{
                            fontSize: '0.55rem', letterSpacing: 'var(--tracking-wide)',
                            textTransform: 'uppercase', color: 'var(--brand-accent)', marginBottom: 6,
                        }}>
                            — Koleksi Kami —
                        </p>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)', color: 'var(--brand-dark)',
                            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 500, letterSpacing: '-0.02em',
                        }}>
                            Semua Produk
                        </h2>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <svg
                            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                            width="13" height="13" viewBox="0 0 24 24"
                            fill="none" stroke="var(--brand-accent)" strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="outline-none"
                            style={{
                                paddingLeft: 34, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                                border: '1.5px solid var(--brand-secondary)', background: 'var(--brand-white)',
                                color: 'var(--brand-dark)', fontSize: '0.82rem', borderRadius: 50,
                                width: 220, transition: 'border-color 0.2s', letterSpacing: 'var(--tracking-tight)',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'var(--brand-accent)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--brand-secondary)')}
                        />
                    </div>
                </div>

                {/* ── Filter kategori ── */}
                {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        {['Semua', ...categories.map(c => c.name)].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '0.4rem 1.25rem', borderRadius: 50,
                                    background: activeCategory === cat ? 'var(--brand-dark)' : 'transparent',
                                    color: activeCategory === cat ? 'var(--text-light)' : 'var(--brand-muted)',
                                    border: `1.5px solid ${activeCategory === cat ? 'var(--brand-dark)' : 'var(--brand-secondary)'}`,
                                    cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700,
                                    letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase',
                                    transition: 'all 0.18s ease', fontFamily: 'var(--font-sans)',
                                }}
                                onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.borderColor = 'var(--brand-accent)' }}
                                onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.borderColor = 'var(--brand-secondary)' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Product grid ── */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <p style={{
                            fontFamily: 'var(--font-heading)', color: 'var(--brand-accent)',
                            fontSize: '1.6rem', fontStyle: 'italic', marginBottom: 8,
                        }}>
                            {searchQuery ? 'Produk tidak ditemukan' : 'Koleksi segera hadir'}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--brand-muted)', letterSpacing: 'var(--tracking-tight)' }}>
                            {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Nantikan koleksi terbaru kami'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                            {filtered.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))}
                        </div>
                        <p style={{
                            textAlign: 'right', marginTop: '2rem', fontSize: '0.65rem',
                            color: 'var(--brand-accent)', opacity: 0.65, letterSpacing: 'var(--tracking-tight)',
                        }}>
                            {filtered.length} dari {products.length} produk
                        </p>
                    </>
                )}
            </div>
        </section>
    )
}