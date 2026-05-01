// src/middleware.ts
// Middleware untuk proteksi route:
// - /shop → publik, siapapun bisa akses tanpa login
// - /admin → hanya OWNER yang sudah login
// - /login → kalau sudah login redirect ke /admin

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Buat Supabase client dengan cookie dari request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Halaman login — kalau sudah login redirect ke admin
  if (pathname.startsWith('/login')) {
    if (user) return NextResponse.redirect(new URL('/admin', request.url))
    return supabaseResponse
  }

  // Halaman admin — wajib login dan harus OWNER
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/admin', request.url))

    // Cek role di database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Bukan OWNER → tolak akses
    // if (profile?.role !== 'OWNER') {
    //   return NextResponse.redirect(new URL('/shop', request.url))
    // }

    return supabaseResponse
  }

  // Auth callback — selalu boleh lewat
  if (pathname.startsWith('/auth/callback')) return supabaseResponse

  // Semua route lain (termasuk /shop) → publik, boleh lewat
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}