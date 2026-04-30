// src/app/_actions/products.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

// Ambil semua produk (bisa digunakan di halaman publik)
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Tambah produk baru (hanya untuk owner — RLS akan menolak jika bukan owner)
export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  let image_url = null;

  // Upload gambar jika ada
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) throw new Error("Upload gagal: " + uploadError.message);

    // Dapatkan URL publik
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("products").insert({
    name,
    price,
    description,
    image_url,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

// Update produk
export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("products")
    .update({ name, price, description })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

// Hapus produk
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}