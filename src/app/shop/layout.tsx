// src/app/shop/layout.tsx
// Layout untuk halaman toko publik
// Berisi navbar brand dan footer

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFBE9' }}>
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-40 px-6 py-4"
        style={{
          background: 'rgba(255,251,233,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E3CAA5',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/shop" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: '#AD8B73' }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', color: '#FFFBE9', fontSize: '18px', fontStyle: 'italic' }}>
                S
              </span>
            </div>
            <div>
              <div
                className="text-lg font-semibold leading-none"
                style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F', letterSpacing: '0.05em' }}
              >
                Safiya Veil
              </div>
              <div className="text-xs leading-none mt-0.5" style={{ color: '#8C6E5A', fontStyle: 'italic' }}>
                Grace in Style, Pure in Faith
              </div>
            </div>
          </a>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="/shop"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: '#3D2B1F' }}
            >
              Koleksi
            </a>
            <a
              href="/shop#tentang"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: '#3D2B1F' }}
            >
              Tentang Kami
            </a>
          </nav>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-12 mt-16"
        style={{ background: '#AD8B73' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div
                className="text-2xl font-semibold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: '#FFFBE9' }}
              >
                Safiya Veil
              </div>
              <p className="text-sm" style={{ color: '#E3CAA5', fontStyle: 'italic' }}>
                Grace in Style, Pure in Faith
              </p>
              <p className="text-sm mt-3" style={{ color: '#E3CAA5' }}>
                Koleksi hijab premium dengan sentuhan elegan dan nilai-nilai islami yang murni.
              </p>
            </div>

            {/* Kontak */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#CEAB93' }}>
                Hubungi Kami
              </p>
              <div className="space-y-1 text-sm" style={{ color: '#E3CAA5' }}>
                <p>WhatsApp: 0812-xxxx-xxxx</p>
                <p>Instagram: @safiyaveil</p>
                <p>Email: hello@safiyaveil.com</p>
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#CEAB93' }}>
                Informasi
              </p>
              <div className="space-y-1 text-sm" style={{ color: '#E3CAA5' }}>
                <p>Pengiriman ke seluruh Indonesia</p>
                <p>Jaminan produk original</p>
                <p>Bahan premium & nyaman</p>
              </div>
            </div>
          </div>

          <div
            className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs"
            style={{ borderTop: '1px solid #CEAB93', color: '#E3CAA5' }}
          >
            <p>© {new Date().getFullYear()} Safiya Veil. All rights reserved.</p>
            <p style={{ fontStyle: 'italic' }}>Grace in Style, Pure in Faith</p>
          </div>
        </div>
      </footer>
    </div>
  )
}