'use client'

interface ProductGalleryProps {
    activeImage: string | null
    allImages: { color: string | null; url: string }[]
    setActiveImage: (url: string) => void
    productName: string
}

export function ProductGallery({ activeImage, allImages, setActiveImage, productName }: ProductGalleryProps) {


    return (
        <div>
            {/* Gambar utama */}
            <div style={{
                aspectRatio: '3/4',
                background: 'var(--brand-secondary)',
                borderRadius: 'var(--card-radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card-hover)',
            }}>
                {activeImage ? (
                    <img
                        src={activeImage}
                        alt={productName}
                        className="img-fade"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, var(--brand-secondary), var(--brand-tertiary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-accent)', fontSize: 56, fontStyle: 'italic', opacity: 0.25 }}>
                            S
                        </span>
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImage(img.url)}
                            style={{
                                width: 60, height: 60, flexShrink: 0, padding: 0,
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: activeImage === img.url
                                    ? '2px solid var(--brand-accent)'
                                    : '2px solid transparent',
                                background: 'var(--brand-secondary)',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-card)',
                                transition: 'border-color 0.15s',
                            }}
                        >
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}