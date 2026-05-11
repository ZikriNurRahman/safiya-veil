// src/app/layout.tsx
// Root layout — font, metadata, Toaster global
import type { Metadata } from 'next'
import { Cormorant_Garamond, Lato, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils";

// Font heading — Cormorant Garamond: elegan, serif, cocok untuk brand hijab premium
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

// Font body — Lato: bersih, readabel, modern
const inter = Inter({subsets:['latin'],variable:'--font-sans'})

export const metadata: Metadata = {
  title: 'Safiya Veil — Grace in Style, Pure in Faith',
  description: 'Koleksi hijab premium Safiya Veil. Temukan gaya yang anggun dan syar\'i untuk setiap momen.',
  openGraph: {
    title: 'Safiya Veil',
    description: 'Grace in Style, Pure in Faith',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", cormorant.variable, "font-sans", inter.variable)}
      style={{ fontFamily: 'var(--font-sans)' }}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[#FFFBE9]">
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              background: '#FFFBE9',
              border: '1px solid #CEAB93',
              color: '#3D2B1F',
            },
          }}
        />
      </body>
    </html>
  )
}