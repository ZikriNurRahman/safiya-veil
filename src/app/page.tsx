// src/app/page.tsx
// Root page — redirect ke /shop (publik) sebagai halaman utama
// proxy yang handle perlindungan halaman admin

import { redirect } from 'next/navigation'

export default function RootPage() {
  // Halaman utama yang tampil ke publik adalah toko
  redirect('/shop')
}