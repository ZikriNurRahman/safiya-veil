export function FeatureBand() {
    return (
        <div
            className="feature-band"
            style={{
                borderRadius: 'var(--card-radius)',
                padding: '1.25rem 1.5rem',
                display: 'flex', flexDirection: 'column', gap: 10,
            }}
        >
            {[
                ['🚚', 'Pengiriman ke seluruh Indonesia'],
                ['✅', 'Produk original bergaransi'],
                ['📦', 'Dikemas dengan aman & rapi'],
                ['💬', 'Customer service responsif'],
            ].map(([icon, text]) => (
                <p key={text} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: '0.75rem',
                    color: 'var(--text-light-soft)',
                    letterSpacing: 'var(--tracking-tight)',
                }}>
                    <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                    <span>{text}</span>
                </p>
            ))}
        </div>
    )
}