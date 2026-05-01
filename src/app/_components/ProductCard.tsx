// src/app/_components/ProductCard.tsx
"use client";

import Image from "next/image";
import type { Product } from "@/app/_actions/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article
      className="group bg-white overflow-hidden"
      style={{
        boxShadow: "0 2px 16px rgba(44,26,14,0.06)",
        transition: "box-shadow 0.4s, transform 0.4s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px rgba(44,26,14,0.14)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 16px rgba(44,26,14,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ height: 300, background: "var(--color-tertiary)" }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: "var(--color-secondary)", opacity: 0.5 }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <p style={{ fontSize: "0.75rem", marginTop: 8 }}>Foto segera hadir</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="p-6"
        style={{ borderTop: "1px solid rgba(227,202,165,0.4)" }}
      >
        <h3
          className="font-display text-brand-primary"
          style={{ fontSize: "1.1rem", marginBottom: 6 }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p
            className="line-clamp-2"
            style={{
              fontSize: "0.82rem",
              color: "#9CA3AF",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <p
            className="font-display"
            style={{
              color: "var(--color-primary)",
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <button
            className="text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "0.5rem 1rem",
            }}
          >
            Pesan
          </button>
        </div>
      </div>
    </article>
  );
}