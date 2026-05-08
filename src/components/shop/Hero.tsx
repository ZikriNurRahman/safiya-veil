// src/components/shop/Hero.tsx

export function Hero() {
    return (
        <section
            // 🔥 PERBAIKAN: Gunakan class Tailwind untuk tinggi & posisi yang responsif
            // Mobile: tinggi 70vh & posisi di tengah (items-center)
            // Desktop (md): tinggi 90vh & posisi di bawah (items-end)
            className="relative flex items-center md:items-end overflow-hidden min-h-[70vh] md:min-h-[90vh]"
            style={{
                background: 'linear-gradient(155deg, #1A0E08 0%, var(--brand-dark) 40%, #5C3020 70%, var(--brand-accent) 100%)',
            }}
        >
            {/* Dot texture — subtle noise */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.12,
                backgroundImage: 'radial-gradient(circle, var(--brand-tertiary) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />

            {/* Radial glow kiri bawah */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '60%', height: '60%',
                background: 'radial-gradient(ellipse at 0% 100%, rgba(191,146,112,0.2) 0%, transparent 70%)',
            }} />

            {/* Dekorasi geometri kanan — analog Starbucks artistry */}
            <div className="hidden lg:block" style={{
                position: 'absolute', top: '12%', right: '8%', opacity: 0.08,
            }}>
                <svg width="320" height="320" viewBox="0 0 320 320">
                    <circle cx="160" cy="160" r="155" fill="none" stroke="#EDCDBB" strokeWidth="0.6" />
                    <circle cx="160" cy="160" r="110" fill="none" stroke="#EDCDBB" strokeWidth="0.4" />
                    <circle cx="160" cy="160" r="65" fill="none" stroke="#EDCDBB" strokeWidth="0.4" />
                    <circle cx="160" cy="160" r="22" fill="none" stroke="#EDCDBB" strokeWidth="0.4" />
                    <line x1="5" y1="160" x2="315" y2="160" stroke="#EDCDBB" strokeWidth="0.4" />
                    <line x1="160" y1="5" x2="160" y2="315" stroke="#EDCDBB" strokeWidth="0.4" />
                    <line x1="50" y1="50" x2="270" y2="270" stroke="#EDCDBB" strokeWidth="0.3" />
                    <line x1="270" y1="50" x2="50" y2="270" stroke="#EDCDBB" strokeWidth="0.3" />
                </svg>
            </div>

            {/* Vertical line dekorasi */}
            <div className="hidden lg:block" style={{
                position: 'absolute', right: '38%', top: '20%', bottom: '20%',
                width: 1,
                background: 'linear-gradient(to bottom, transparent, rgba(191,146,112,0.25), transparent)',
            }} />

            {/* Content */}
            <div className="relative z-10 w-full max-w-[80rem] mx-auto px-6 pb-12 pt-16 md:pb-16 md:pt-32">
                <div style={{ maxWidth: 520 }}>

                    {/* Eyebrow — analog SoDoSans uppercase tracking */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                        <div style={{ width: 24, height: 1, background: 'var(--brand-tertiary)', opacity: 0.6 }} />
                        <p style={{
                            fontSize: '0.58rem',
                            letterSpacing: 'var(--tracking-wide)',
                            textTransform: 'uppercase',
                            color: 'var(--brand-tertiary)',
                            fontFamily: 'var(--font-sans)',
                        }}>
                            Koleksi Premium Hijab
                        </p>
                    </div>

                    {/* Headline */}
                    <h1
                        className="animate-fade-in-up"
                        style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-light)',
                            fontSize: 'clamp(2.8rem, 6.5vw, 4.8rem)',
                            lineHeight: 1.08,
                            fontWeight: 500,
                            letterSpacing: '-0.02em',
                            marginBottom: '1.25rem',
                        }}
                    >
                        Tampil Anggun
                        <br />
                        <em style={{ color: 'var(--brand-tertiary)' }}>Setiap Hari</em>
                    </h1>

                    <p
                        className="animate-fade-in-up stagger-2"
                        style={{
                            fontSize: '0.88rem',
                            color: 'var(--text-light-soft)',
                            lineHeight: 1.85,
                            marginBottom: '2.25rem',
                            maxWidth: 400,
                            letterSpacing: 'var(--tracking-tight)',
                        }}
                    >
                        Koleksi hijab premium dengan bahan terpilih, desain elegan,
                        dan nilai-nilai islami yang murni.
                    </p>

                    {/* CTA row — analog Starbucks white-filled + outline-light pair */}
                    <div
                        className="animate-fade-in-up stagger-3"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                    >
                        <a href="#koleksi" className="btn-light">
                            Lihat Koleksi
                        </a>
                        <a href="#tentang" className="btn-outline-light">
                            Tentang Kami
                        </a>
                    </div>
                </div>

                {/* Stats row — analog Starbucks hero stat section */}
                {/* <div
                    className="hidden md:flex items-center gap-12 mt-14 pt-8"
                    style={{ borderTop: '1px solid rgba(191,146,112,0.12)' }}
                >
                    {[['500+', 'Pelanggan Puas'], ['30+', 'Pilihan Warna'], ['100%', 'Bahan Premium']].map(([num, label]) => (
                        <div key={label}>
                            <p style={{
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--brand-tertiary)',
                                fontSize: '2.2rem',
                                fontWeight: 600,
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                            }}>
                                {num}
                            </p>
                            <p style={{
                                fontSize: '0.58rem',
                                color: 'var(--text-light-soft)',
                                letterSpacing: 'var(--tracking-caps)',
                                textTransform: 'uppercase',
                                marginTop: 5,
                            }}>
                                {label}
                            </p>
                        </div>
                    ))}
                </div> */}
            </div>

            {/* Fade ke background warna brand */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                background: 'linear-gradient(to top, var(--brand-primary), transparent)',
            }} />
        </section>
    )
}