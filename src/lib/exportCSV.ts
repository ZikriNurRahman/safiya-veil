// src/lib/exportCSV.ts
import { formatDateTime } from './utils'
import type { Order } from '@/types/database'

export function exportCSV(orders: Order[], label: string) {
    const header = ['No Order', 'Customer', 'Phone', 'Type', 'Payment', 'Total', 'Status', 'Tanggal'].join(',')

    const rows = orders.map(o => [
        o.order_number,
        `"${o.customer_name}"`,
        `'${o.customer_phone}`, // Petik tunggal agar Excel tidak menghapus angka 0 di depan
        o.order_type,
        o.payment_method,
        o.total_price,
        o.status,
        formatDateTime(o.created_at),
    ].join(','))

    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `safiya-veil-orders-${label.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
}