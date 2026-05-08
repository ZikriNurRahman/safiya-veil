'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
    SidebarOpen: (open: boolean) => void
    ownerName: string
    handleSignOut: () => void
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Produk', icon: '🧕' },
    { href: '/admin/orders', label: 'Pesanan', icon: '📦' },
    { href: '/admin/pos', label: 'POS', icon: '📦' },
    { href: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
]

export function Sidebar({ SidebarOpen, ownerName, handleSignOut }: SidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Brand */}
            <div className="px-5 py-5 shrink-0" style={{ borderBottom: '1px solid #E3CAA5' }}>
                <div
                    className="text-xl font-semibold"
                    style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}
                >
                    Safiya Veil
                </div>
                <div className="text-xs mt-0.5 italic" style={{ color: '#8C6E5A' }}>
                    Admin Panel
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(item => {
                    // Halaman dashboard match persis /admin saja
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => SidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: isActive ? '#AD8B73' : 'transparent',
                                color: isActive ? '#FFFBE9' : '#8C6E5A',
                            }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer sidebar */}
            <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #E3CAA5' }}>
                <div className="text-xs font-semibold mb-0.5" style={{ color: '#3D2B1F' }}>
                    {ownerName}
                </div>
                <div className="text-xs mb-3" style={{ color: '#CEAB93' }}>👑 Owner</div>

                <div className="flex gap-2">
                    <Link
                        href="/shop"
                        className="flex-1 py-1.5 rounded-lg text-xs text-center font-medium transition-colors"
                        style={{ background: '#E3CAA5', color: '#3D2B1F' }}
                    >
                        Lihat Toko
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: '#F5ECD8', color: '#8C6E5A' }}
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </>
    )
}