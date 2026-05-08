// src/components/admin/EmptyState.tsx
interface EmptyStateProps {
    icon?: string
    title: string
    description?: string
}

export function EmptyState({ icon = '📭', title, description }: EmptyStateProps) {
    return (
        <div className="py-12 text-center" style={{ color: '#CEAB93' }}>
            <p className="text-3xl mb-2">{icon}</p>
            <p className="text-sm font-medium" style={{ color: '#3D2B1F' }}>{title}</p>
            {description && (
                <p className="text-xs mt-1">{description}</p>
            )}
        </div>
    )
}