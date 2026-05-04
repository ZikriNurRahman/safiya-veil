'use client'
// src/components/shop/ShopFooter.tsx
// Footer dinamis — lozy.id style, 4 kolom bersih

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface FooterData {
  store_name: string
  store_address: string
  store_phones: string[]
  store_socials: string[]
  footer_text: string
}

const DEFAULT: FooterData = {
  store_name: 'Safiya Veil',
  store_address: '',
  store_phones: [],
  store_socials: [],
  footer_text: 'Terima kasih telah berbelanja di Safiya Veil ✨',
}

export function ShopFooter() {
  const [data, setData] = useState<FooterData>(DEFAULT)

  useEffect(() => {
    const fetch = async () => {
      const { data: s } = await supabase
        .from('store_settings')
        .select('store_name, store_address, store_phones, store_socials, footer_text')
        .eq('id', 1)
        .single()
      if (!s) return
      setData({
        store_name: s.store_name ?? DEFAULT.store_name,
        store_address: s.store_address ?? '',
        store_phones: Array.isArray(s.store_phones) ? s.store_phones.filter(Boolean) : [],
        store_socials: Array.isArray(s.store_socials) ? s.store_socials.filter(Boolean) : [],
        footer_text: s.footer_text ?? DEFAULT.footer_text,
      })
    }

    fetch()

    const ch = supabase
      .channel('footer-settings')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' },
        fetch
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  return (
    <footer style={{ background: '#2C1810', color: '#EDCDBB' }}>

      {/* ── Main footer content ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#FFEDDB',
              letterSpacing: '0.12em',
              marginBottom: 6,
            }}>
              SAFIYA VEIL
            </div>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#BF9270', marginBottom: 16 }}>
              Grace in Style, Pure in Faith
            </p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(237,205,187,0.55)', lineHeight: 1.8, maxWidth: 220 }}>
              Koleksi hijab premium untuk wanita muslimah modern yang ingin tampil elegan dan syar&apos;i.
            </p>
            {data.store_address && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(237,205,187,0.45)', marginTop: 12, lineHeight: 1.6 }}>
                📍 {data.store_address}
              </p>
            )}
          </div>

          {/* Navigasi */}
          <div>
            <p style={colHeadStyle}>Navigasi</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Beranda', '/shop'],
                ['Koleksi', '/shop#koleksi'],
                ['Tentang Kami', '/shop#tentang'],
              ].map(([label, href]) => (
                <a key={label} href={href} style={footerLinkStyle}>{label}</a>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p style={colHeadStyle}>Hubungi Kami</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {data.store_phones.length > 0 ? (
                data.store_phones.map((p, i) => (
                  <a
                    key={i}
                    href={`https://wa.me/${p.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ...footerLinkStyle, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#BF9270">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {p}
                  </a>
                ))
              ) : (
                <p style={{ fontSize: '0.72rem', color: 'rgba(237,205,187,0.3)', fontStyle: 'italic' }}>
                  Belum ada kontak
                </p>
              )}
            </div>
          </div>

          {/* Sosmed */}
          <div>
            <p style={colHeadStyle}>Ikuti Kami</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {data.store_socials.length > 0 ? (
                data.store_socials.map((s, i) => (
                  <p key={i} style={{ fontSize: '0.78rem', color: 'rgba(237,205,187,0.55)', lineHeight: 1.5 }}>
                    <span style={{ color: '#BF9270', marginRight: 6 }}>✦</span>{s}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: '0.72rem', color: 'rgba(237,205,187,0.3)', fontStyle: 'italic' }}>
                  Belum ada sosial media
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid rgba(191,146,112,0.15)' }}>
        <div
          className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ fontSize: '0.65rem', color: 'rgba(237,205,187,0.35)', letterSpacing: '0.1em' }}
        >
          <p>© {new Date().getFullYear()} {data.store_name}. All rights reserved.</p>
          <p style={{ fontStyle: 'italic' }}>{data.footer_text}</p>
        </div>
      </div>

    </footer>
  )
}

const colHeadStyle: React.CSSProperties = {
  fontSize: '0.58rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: '#BF9270',
  marginBottom: 16,
  fontWeight: 600,
}

const footerLinkStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'rgba(237,205,187,0.55)',
  textDecoration: 'none',
  transition: 'color 0.2s',
  lineHeight: 1.5,
}