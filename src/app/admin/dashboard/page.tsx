// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  addProduct,
  deleteProduct,
  updateProduct,
  type Product,
} from "@/app/_actions/products";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Input style helper ────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "none",
  borderBottom: "2px solid var(--color-tertiary)",
  background: "rgba(255,251,233,0.5)",
  outline: "none",
  fontSize: "0.88rem",
  color: "var(--color-espresso)",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.6rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "#6B7280",
  marginBottom: 6,
};

/* ─── Main component ────────────────────────────────── */
export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  /* Fetch products */
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Handlers */
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    await deleteProduct(id);
    fetchProducts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", editingProduct.id);
    await updateProduct(formData);
    setEditingProduct(null);
    setIsSubmitting(false);
    fetchProducts();
  };

  const handleAddSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await addProduct(formData);
    setIsAddOpen(false);
    setIsSubmitting(false);
    fetchProducts();
  };

  /* ── Render ─────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F2EB",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <header
        style={{
          background: "var(--color-espresso)",
          padding: "0 2rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "rgba(173,139,115,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="font-display"
              style={{ color: "var(--color-tertiary)", fontSize: "1.2rem" }}
            >
              S
            </span>
          </div>
          <div>
            <p
              className="font-display"
              style={{ color: "var(--color-tertiary)", fontSize: "1.1rem", lineHeight: 1.1 }}
            >
              Safiya Veil
            </p>
            <p
              style={{
                color: "rgba(206,171,147,0.5)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            color: "rgba(206,171,147,0.7)",
            border: "1px solid rgba(206,171,147,0.25)",
            padding: "0.45rem 1.2rem",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.62rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--color-tertiary)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(206,171,147,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(206,171,147,0.7)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(206,171,147,0.25)";
          }}
        >
          Keluar
        </button>
      </header>

      {/* ── Content ────────────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 2rem" }}>
        {/* Page title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            className="font-display text-brand-primary"
            style={{ fontSize: "1.9rem", marginBottom: 4 }}
          >
            Kelola Produk
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>
            Tambah, edit, dan hapus produk koleksi Safiya Veil
          </p>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { label: "Total Produk", value: products.length, icon: "🧕" },
            {
              label: "Produk Terbaru",
              value:
                products.length > 0
                  ? new Date(products[0].created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                  : "—",
              icon: "✦",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "white",
                padding: "1.4rem 1.6rem",
                border: "1px solid rgba(227,202,165,0.35)",
                boxShadow: "0 1px 8px rgba(44,26,14,0.04)",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{stat.icon}</span>
              <p
                className="font-display"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  marginTop: 6,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p style={{ color: "#9CA3AF", fontSize: "0.75rem", marginTop: 4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2
            className="font-display text-brand-primary"
            style={{ fontSize: "1.2rem" }}
          >
            Daftar Produk
          </h2>
          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              padding: "0.65rem 1.4rem",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-secondary)")
            }
            onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-primary)")
            }
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
            Tambah Produk
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            background: "white",
            border: "1px solid rgba(227,202,165,0.3)",
            boxShadow: "0 1px 12px rgba(44,26,14,0.05)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem",
                color: "#9CA3AF",
              }}
            >
              <p className="font-display italic" style={{ fontSize: "1.1rem" }}>
                Memuat produk...
              </p>
            </div>
          ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem" }}>
                <p
                  className="font-display italic"
                  style={{ color: "#9CA3AF", fontSize: "1.2rem" }}
                >
                  Belum ada produk
                </p>
                <p style={{ color: "#9CA3AF", fontSize: "0.82rem", marginTop: 8 }}>
                  Klik &ldquo;Tambah Produk&rdquo; untuk mulai mengisi koleksi
                </p>
              </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          background: "rgba(255,251,233,0.7)",
                          borderBottom: "1px solid rgba(227,202,165,0.4)",
                        }}
                      >
                        {["Produk", "Harga", "Deskripsi", "Aksi"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "1rem 1.25rem",
                              textAlign: h === "Aksi" ? "right" : "left",
                              fontSize: "0.6rem",
                              letterSpacing: "0.25em",
                              textTransform: "uppercase",
                              color: "#9CA3AF",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, idx) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: "1px solid rgba(227,202,165,0.2)",
                            background: idx % 2 === 0 ? "white" : "rgba(255,251,233,0.3)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background =
                            "rgba(255,251,233,0.7)")
                          }
                          onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background =
                            idx % 2 === 0 ? "white" : "rgba(255,251,233,0.3)")
                          }
                        >
                          {/* Product name + thumb */}
                          <td style={{ padding: "1rem 1.25rem" }}>
                            <div
                              style={{ display: "flex", alignItems: "center", gap: 12 }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  position: "relative",
                                  flexShrink: 0,
                                  background: "rgba(227,202,165,0.25)",
                                  overflow: "hidden",
                                }}
                              >
                                {p.image_url ? (
                                  <Image
                                    src={p.image_url}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "rgba(206,171,147,0.5)",
                                    }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <span
                                className="font-display"
                                style={{
                                  color: "var(--color-primary)",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {p.name}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td
                            style={{
                              padding: "1rem 1.25rem",
                              fontSize: "0.85rem",
                              color: "#374151",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Rp {p.price.toLocaleString("id-ID")}
                          </td>

                          {/* Description */}
                          <td
                            style={{
                              padding: "1rem 1.25rem",
                              fontSize: "0.8rem",
                              color: "#9CA3AF",
                              maxWidth: 260,
                            }}
                          >
                            <p className="line-clamp-1">{p.description || "—"}</p>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 8,
                              }}
                            >
                              <button
                                onClick={() => setEditingProduct(p)}
                                style={{
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.08em",
                                  color: "var(--color-primary)",
                                  border: "1px solid rgba(173,139,115,0.4)",
                                  background: "transparent",
                                  padding: "0.4rem 0.85rem",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background =
                                    "var(--color-primary)";
                                  (e.currentTarget as HTMLButtonElement).style.color =
                                    "white";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background =
                                    "transparent";
                                  (e.currentTarget as HTMLButtonElement).style.color =
                                    "var(--color-primary)";
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                style={{
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.08em",
                                  color: "#EF4444",
                                  border: "1px solid rgba(239,68,68,0.25)",
                                  background: "transparent",
                                  padding: "0.4rem 0.85rem",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background =
                                    "#FEF2F2";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background =
                                    "transparent";
                                }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        {products.length > 0 && (
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.75rem",
              color: "#9CA3AF",
              textAlign: "right",
            }}
          >
            Menampilkan {products.length} produk
          </p>
        )}
      </main>

      {/* ── Edit Modal ──────────────────────────────── */}
      {editingProduct && (
        <ModalOverlay onClose={() => setEditingProduct(null)}>
          <div>
            <h3
              className="font-display text-brand-primary"
              style={{ fontSize: "1.6rem", marginBottom: "1.75rem" }}
            >
              Edit Produk
            </h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct.name}
                  required
                  style={inputStyle}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingProduct.price}
                  required
                  min="0"
                  style={inputStyle}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={labelStyle}>Deskripsi</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description || ""}
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <ModalButtons
                submitLabel={isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                onCancel={() => setEditingProduct(null)}
                disabled={isSubmitting}
              />
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ── Add Product Modal ───────────────────────── */}
      {isAddOpen && (
        <ModalOverlay onClose={() => setIsAddOpen(false)}>
          <div>
            <h3
              className="font-display text-brand-primary"
              style={{ fontSize: "1.6rem", marginBottom: "1.75rem" }}
            >
              Tambah Produk Baru
            </h3>
            <form action={handleAddSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Hijab Voile Premium"
                  style={inputStyle}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  placeholder="150000"
                  style={inputStyle}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Deskripsi</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Deskripsi produk..."
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLTextAreaElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={labelStyle}>Foto Produk</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  style={{ fontSize: "0.82rem", color: "#6B7280", cursor: "pointer" }}
                  className="w-full file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:bg-brand-tertiary/30 file:text-brand-primary hover:file:bg-brand-tertiary/50"
                />
              </div>
              <ModalButtons
                submitLabel={isSubmitting ? "Menyimpan..." : "Tambah Produk"}
                onCancel={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              />
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ─── Modal sub-components ──────────────────────────── */
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(44,26,14,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: "relative",
          background: "white",
          width: "100%",
          maxWidth: 520,
          margin: "1rem",
          boxShadow: "0 24px 80px rgba(44,26,14,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Top accent */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, var(--color-tertiary), var(--color-primary), var(--color-secondary))",
          }}
        />
        <div style={{ padding: "2.25rem 2.25rem 2rem" }}>{children}</div>
      </div>
    </div>
  );
}

function ModalButtons({
  submitLabel,
  onCancel,
  disabled,
}: {
  submitLabel: string;
  onCancel: () => void;
  disabled: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <button
        type="submit"
        disabled={disabled}
        style={{
          flex: 1,
          padding: "0.85rem",
          background: disabled ? "var(--color-secondary)" : "var(--color-primary)",
          color: "white",
          border: "none",
          fontSize: "0.68rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!disabled)
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-secondary)";
        }}
        onMouseLeave={(e) => {
          if (!disabled)
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--color-primary)";
        }}
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: "0.85rem 1.5rem",
          border: "1px solid rgba(227,202,165,0.6)",
          background: "transparent",
          color: "#6B7280",
          fontSize: "0.68rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,251,233,0.8)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
        }
      >
        Batal
      </button>
    </div>
  );
}