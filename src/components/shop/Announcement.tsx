const ANNOUNCEMENTS = [
    '✦ Gratis ongkir min. pembelian Rp 150.000',
    '✦ Bahan premium pilihan, nyaman sepanjang hari',
    '✦ NEW ARRIVAL — Koleksi terbaru sudah tersedia!',
    '✦ Pesan via WhatsApp tersedia 24 jam',
]

export function Announcement() {
    return (
        <div
            className="overflow-hidden shrink-0"
            style={{
                background: 'var(--brand-dark)',
                height: 36,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <div className="marquee-track">
                {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((txt, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: '0.6rem',
                            letterSpacing: 'var(--tracking-caps)',
                            textTransform: 'uppercase',
                            color: 'var(--text-light-soft)',
                            padding: '0 3rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {txt}
                    </span>
                ))}
            </div>
        </div>
    )
}