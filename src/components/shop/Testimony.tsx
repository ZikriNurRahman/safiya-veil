export function Testimony() {
    return (
        <section style={{ background: 'var(--brand-primary)', padding: 'clamp(3rem, 7vw, 5rem) 1.5rem' }}>
            <div style={{ maxWidth: '62rem', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <p style={{
                        fontSize: '0.55rem',
                        letterSpacing: 'var(--tracking-wide)',
                        textTransform: 'uppercase',
                        color: 'var(--brand-accent)',
                        marginBottom: 12,
                    }}>
                        Testimoni
                    </p>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--brand-dark)',
                        fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                    }}>
                        Kata Mereka
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.25rem' }}>
                    {[
                        { name: 'Fajrin A.', city: 'Cirebon', text: 'Bagus bangeettt suka sama bahannya adem terus ringann, warnanya juga cantikk, next pasti beli lagi di siniiii', rating: 5 },
                        { name: 'Rika Aprilia', city: 'Bandung', text: 'Baguss banget bahannya lembut, gampang banget diaturnya suka makasihh', rating: 5 },
                        { name: 'Zahra K.', city: 'Bandung', text: "Hijabnya syar'i tapi tetep stylish! Banyak dapat compliment dari temen-temen. Sangat recommended!", rating: 5 },
                    ].map((t, i) => (
                        <div
                            key={i}
                            className={`card animate-fade-in-up stagger-${i + 1}`}
                            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', animationFillMode: 'both' }}
                        >
                            {/* Stars */}
                            <div style={{ display: 'flex', gap: 2 }}>
                                {Array.from({ length: t.rating }).map((_, si) => (
                                    <span key={si} style={{ color: 'var(--brand-accent)', fontSize: 13 }}>★</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p style={{
                                fontSize: '0.83rem',
                                color: 'var(--text-dark)',
                                lineHeight: 1.75,
                                fontStyle: 'italic',
                                flex: 1,
                                letterSpacing: 'var(--tracking-tight)',
                            }}>
                                &ldquo;{t.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                borderTop: '1px solid var(--brand-secondary)',
                                paddingTop: '1rem',
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'var(--brand-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-accent)', fontSize: 15 }}>
                                        {t.name[0]}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-dark)', letterSpacing: 'var(--tracking-tight)' }}>
                                        {t.name}
                                    </p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--brand-accent)' }}>{t.city}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}