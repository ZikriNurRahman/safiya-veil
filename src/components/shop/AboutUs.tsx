export function AboutUs() {
    return (
        <section
            id="tentang"
            className="feature-band"
            style={{ padding: 'clamp(4rem, 10vw, 7rem) 1.5rem' }}
        >
            <div style={{ maxWidth: '40rem', margin: '0 auto', textAlign: 'center' }}>
                <p style={{
                    fontSize: '0.55rem',
                    letterSpacing: 'var(--tracking-wide)',
                    textTransform: 'uppercase',
                    color: 'var(--brand-accent)',
                    marginBottom: '1.5rem',
                }}>
                    Tentang Kami
                </p>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-light)',
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    marginBottom: '1.25rem',
                    lineHeight: 1.15,
                }}>
                    Dihadirkan dengan Kasih
                    <br />
                    <em style={{ color: 'var(--brand-tertiary)' }}>dan Keimanan</em>
                </h2>
                <p style={{
                    color: 'var(--text-light-soft)',
                    lineHeight: 1.9,
                    marginBottom: '2.25rem',
                    fontSize: '0.88rem',
                    letterSpacing: 'var(--tracking-tight)',
                }}>
                    Safiya Veil hadir untuk wanita muslimah yang ingin tampil elegan tanpa
                    melupakan nilai-nilai syar&apos;i. Setiap produk dirancang dengan penuh kasih,
                    menggunakan bahan berkualitas premium yang nyaman dipakai sepanjang hari.
                </p>

                {/* CTA row — White filled + outline-light (analog Starbucks feature band buttons) */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <a href="#koleksi" className="btn-light">Lihat Koleksi</a>
                    <a href="/shop/cart" className="btn-outline-light">Keranjang</a>
                </div>

                <div style={{ width: 32, height: 1, background: 'var(--brand-accent)', margin: '2rem auto 1.25rem', opacity: 0.35 }} />
                <p style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--brand-tertiary)',
                    fontSize: '1rem',
                    fontStyle: 'italic',
                }}>
                    &ldquo;Grace in Style, Pure in Faith&rdquo;
                </p>
            </div>
        </section>
    )
}