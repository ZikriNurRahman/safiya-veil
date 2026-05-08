// src/components/admin/settings/SectionCard.tsx

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid #E3CAA5' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #E3CAA5', background: '#FAF5E8' }}>
                <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)', color: '#3D2B1F' }}>
                    {title}
                </h2>
            </div>
            <div className="p-5" style={{ background: '#FFFBE9' }}>
                {children}
            </div>
        </div>
    )
}