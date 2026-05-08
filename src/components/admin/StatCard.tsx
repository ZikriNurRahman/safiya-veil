// src/components/admin/StatCard.tsx
export function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-2xl p-5 flex flex-col gap-2"
            style={{ background: '#FFFBE9', border: '1px solid #E3CAA5' }}>
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>{value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#8C6E5A' }}>{label}</p>
                {sub && <p className="text-xs mt-0.5" style={{ color: '#CEAB93' }}>{sub}</p>}
            </div>
        </div>
    )
}