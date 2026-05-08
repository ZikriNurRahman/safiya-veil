export function FeatureBand() {
    return (
        <section style={{ background: 'var(--brand-dark)' }}>
            <div
                className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4"
                style={{ borderBottom: '1px solid rgba(191,146,112,0.12)' }}
            >
                {[
                    { icon: '◈', title: 'Bahan Premium', desc: 'Nyaman sepanjang hari' },
                    { icon: '✦', title: 'Desain Elegan', desc: "Syar'i & stylish" },
                    { icon: '❋', title: 'Gratis Ongkir', desc: 'Min. pembelian tertentu' },
                    { icon: '◉', title: 'Produk Original', desc: 'Keaslian terjamin' },
                ].map((f, i) => (
                    <div
                        key={f.title}
                        style={{
                            padding: '2rem 1.25rem',
                            textAlign: 'center',
                            borderRight: i < 3 ? '1px solid rgba(191,146,112,0.10)' : 'none',
                        }}
                    >
                        <span style={{ display: 'block', color: 'var(--brand-accent)', fontSize: '1.25rem', marginBottom: 10 }}>
                            {f.icon}
                        </span>
                        <p style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-light)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            marginBottom: 4,
                            letterSpacing: 'var(--tracking-tight)',
                        }}>
                            {f.title}
                        </p>
                        <p style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-light-soft)',
                            lineHeight: 1.6,
                        }}>
                            {f.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}