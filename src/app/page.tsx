// src/app/page.tsx
import { getProducts } from "./_actions/products";
import Image from "next/image";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-primary text-white py-20 text-center">
        <h1 className="text-5xl font-bold font-serif">Safiya Veil</h1>
        <p className="mt-4 text-xl italic text-brand-tertiary">
          &quot;Grace in Style, Pure in Faith&quot;
        </p>
      </section>

      {/* Produk */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-semibold text-brand-primary mb-8 text-center">
          Koleksi Terbaru
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada produk.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-brand-secondary">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/50">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-brand-primary">{product.name}</h3>
                  <p className="text-gray-600">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-brand-primary text-white text-center py-6">
        &copy; {new Date().getFullYear()} Safiya Veil. All rights reserved.
      </footer>
    </main>
  );
}