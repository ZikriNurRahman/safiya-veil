// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { addProduct, deleteProduct, type Product } from "@/app/_actions/products";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Fetch produk untuk ditampilkan di tabel
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus?")) return;
    await deleteProduct(id);
    fetchProducts();
  };

  return (
    <main className="min-h-screen bg-brand-cream p-8">
      <h1 className="text-3xl font-bold text-brand-primary mb-2">
        Dashboard Owner
      </h1>
      <p className="text-gray-600 mb-8">Kelola produk Safiya Veil</p>

      {/* Tombol tambah scroll ke form */}
      <a
        href="#add-form"
        className="inline-block bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-secondary transition mb-8"
      >
        + Tambah Produk Baru
      </a>

      {/* Tabel Produk */}
      <section className="bg-white p-6 rounded-lg shadow mb-12">
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">
          Daftar Produk
        </h2>
        {loading ? (
          <p>Memuat...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">Belum ada produk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Nama</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">Rp {p.price.toLocaleString("id-ID")}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:underline mr-2"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => {
                          // Edit sederhana: kita bisa prompt, atau buat route edit terpisah
                          // Untuk sekarang gunakan prompt singkat
                          const newName = prompt("Nama baru", p.name);
                          if (newName) {
                            // Buat server action update, lalu panggil fetchProducts
                            // Sederhanakan dengan fetch PUT ke server action?
                            // Bisa gunakan updateProduct dengan FormData
                            // Untuk demo, kita abaikan dulu, atau buat modal edit
                          }
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Form Tambah Produk */}
      <section id="add-form" className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">
          Tambah Produk Baru
        </h2>
        <form
          action={addProduct}
          className="space-y-4 max-w-md"
          onSubmit={() => {
            // Reset form setelah submit (opsional)
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Produk
            </label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full border border-brand-secondary rounded p-2 focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harga
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              className="mt-1 block w-full border border-brand-secondary rounded p-2 focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 block w-full border border-brand-secondary rounded p-2 focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gambar
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-secondary"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-secondary transition"
          >
            Simpan
          </button>
        </form>
      </section>
    </main>
  );
}