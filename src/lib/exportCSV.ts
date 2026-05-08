// src/lib/exportCSV.ts
import { formatDateTime } from './utils'

export function exportCSV(orders: any[], label: string) {

    const rows: string[] = []

    orders.forEach(o => {
        if (!o.order_items || o.order_items.length === 0) {
            rows.push([
                o.order_number, formatDateTime(o.created_at), `"${o.customer_name}"`, `'${o.customer_phone}`,
                o.order_type, o.payment_method, o.status,
                '-', '-', '-', 0, 0, o.total_price
            ].join(','))
        } else {
            o.order_items.forEach((item: any) => {
                // Tarik base SKU dari relasi table products
                let sku = item.products?.base_sku || 'NON-SKU'
                const variant = item.notes || '' // notes berisi warna di sistem kita

                // Rakit variant code jika ada warna
                if (variant && item.products?.color_stocks) {
                    const cs = item.products.color_stocks.find((c: any) => c.color === variant)
                    if (cs && cs.code) sku += `-${cs.code}`
                }

                rows.push([
                    o.order_number, formatDateTime(o.created_at), `"${o.customer_name}"`, `'${o.customer_phone}`,
                    o.order_type, o.payment_method, o.status,
                    `"${sku}"`, `"${item.product_name}"`, `"${variant}"`, item.quantity, item.unit_price, (item.quantity * item.unit_price)
                ].join(','))
            })
        }
    })

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `safiya-veil-sku-report-${label.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
}