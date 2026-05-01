// src/lib/utils.ts
// Utility functions yang dipakai di seluruh aplikasi

// Format angka ke Rupiah — e.g., 250000 → "Rp 250.000"
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Generate nomor order unik — e.g., "SV-A3X8K9F2"
export function generateOrderNumber(): string {
  const ts = Math.floor(Date.now() / 2).toString(36).toUpperCase()
  const timePart = ts.padStart(8, '0')
  return `SV-${timePart}`
}

// Helper gabung class names Tailwind
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Format tanggal dan waktu Indonesia — e.g., "22 Apr 2026, 14:35"
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format tanggal saja — e.g., "22 April 2026"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}