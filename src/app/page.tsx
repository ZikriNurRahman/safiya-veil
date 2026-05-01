// src/app/page.tsx
import { getProducts } from "./_actions/products";
import ProductCard from "./_components/ProductCard";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cream)", fontFamily: "var(--font-body)" }}
    >
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-brand-tertiary"
        style={{
          background: "rgba(255,251,233,0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-2xl text-brand-primary tracking-wide">
            Safiya Veil
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#koleksi"
              className="text-sm text-gray-500 hover:text-brand-primary transition-colors tracking-wide"
            >
              Koleksi
            </a>
            <a
              href="#tentang"
              className="text-sm text-gray-500 hover:text-brand-primary transition-colors tracking-wide"
            >
              Tentang
            </a>
          </div>
          <a
            href="#koleksi"
            className="hidden md:inline-block text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              padding: "0.5rem 1.4rem",
            }}
          >
            Belanja Sekarang
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-center"
        style={{
          background:
            "linear-gradient(160deg, #FFFBE9 0%, #F7EDD5 45%, #EDD8AE 100%)",
          minHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem",
        }}
      >
        {/* Decorative top line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 1,
            height: 80,
            background: "var(--color-secondary)",
            opacity: 0.4,
          }}
        />

        {/* Eyebrow */}
        <p
          className="text-brand-secondary mb-6"
          style={{
            letterSpacing: "0.45em",
            fontSize: "0.7rem",
            textTransform: "uppercase",
          }}
        >
          Koleksi Premium Hijab
        </p>

        {/* Headline */}
        <h1
          className="font-display text-brand-primary"
          style={{
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
            lineHeight: 1.05,
            marginBottom: "1.5rem",
          }}
        >
          Safiya
          <br />
          <em>Veil</em>
        </h1>

        {/* Divider + tagline */}
        <div className="flex items-center gap-5 mb-10">
          <div style={{ height: 1, width: 64, background: "var(--color-secondary)" }} />
          <p
            className="font-display text-brand-secondary italic"
            style={{ fontSize: "1.05rem" }}
          >
            Grace in Style, Pure in Faith
          </p>
          <div style={{ height: 1, width: 64, background: "var(--color-secondary)" }} />
        </div>

        {/* CTA */}
        <a
          href="#koleksi"
          className="inline-block bg-brand-primary text-white hover:bg-brand-secondary transition-colors duration-300"
          style={{
            padding: "0.85rem 2.5rem",
            fontSize: "0.7rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
          }}
        >
          Jelajahi Koleksi
        </a>

        {/* Decorative bottom line */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 1,
            height: 80,
            background: "var(--color-secondary)",
            opacity: 0.4,
          }}
        />

        {/* Background glow blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            right: "-5%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "var(--color-tertiary)",
            opacity: 0.18,
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "15%",
            left: "-8%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "var(--color-secondary)",
            opacity: 0.15,
            filter: "blur(50px)",
          }}
        />
      </section>

      {/* ── Product Collection ─────────────────────────── */}
      <section id="koleksi" className="max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <p
            className="text-brand-secondary mb-3"
            style={{
              letterSpacing: "0.3em",
              fontSize: "0.7rem",
              textTransform: "uppercase",
            }}
          >
            — Pilihan Terbaik —
          </p>
          <h2
            className="font-display text-brand-primary"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Koleksi Terbaru
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="font-display italic text-brand-secondary"
              style={{ fontSize: "1.5rem" }}
            >
              Koleksi segera hadir...
            </p>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── USP Strip ──────────────────────────────────── */}
      <section
        id="tentang"
        style={{
          background: "rgba(173,139,115,0.06)",
          borderTop: "1px solid rgba(227,202,165,0.5)",
          borderBottom: "1px solid rgba(227,202,165,0.5)",
          padding: "5rem 1.5rem",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              symbol: "✦",
              title: "Kualitas Premium",
              desc: "Bahan pilihan berkualitas tinggi, lembut dan nyaman dipakai sepanjang hari.",
            },
            {
              symbol: "◈",
              title: "Desain Eksklusif",
              desc: "Koleksi terbatas untuk tampilan yang unik, elegan, dan tetap syar'i.",
            },
            {
              symbol: "❋",
              title: "Pengiriman Aman",
              desc: "Dikemas dengan teliti dan dikirim cepat ke seluruh penjuru Indonesia.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-4">
              <span className="text-brand-secondary" style={{ fontSize: "1.6rem" }}>
                {item.symbol}
              </span>
              <h3
                className="font-display text-brand-primary"
                style={{ fontSize: "1.1rem" }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7280",
                  lineHeight: 1.7,
                  maxWidth: 240,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        className="text-center"
        style={{
          background: "var(--color-espresso)",
          padding: "5rem 1.5rem 4rem",
        }}
      >
        <h2
          className="font-display text-brand-tertiary"
          style={{ fontSize: "2rem", marginBottom: 8 }}
        >
          Safiya Veil
        </h2>
        <p
          className="font-display italic"
          style={{
            color: "rgba(206,171,147,0.6)",
            fontSize: "0.9rem",
            marginBottom: "2.5rem",
          }}
        >
          Grace in Style, Pure in Faith
        </p>
        <div
          style={{
            height: 1,
            width: 80,
            background: "rgba(206,171,147,0.25)",
            margin: "0 auto 2rem",
          }}
        />
        <p
          style={{
            color: "rgba(206,171,147,0.4)",
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          © {new Date().getFullYear()} Safiya Veil · All Rights Reserved
        </p>
      </footer>
    </div>
  );
}