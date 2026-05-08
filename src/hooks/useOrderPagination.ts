// src/hooks/useOrderPagination.ts
import { useState, useMemo, useEffect } from 'react'

export function useOrderPagination(
    orders: any[],
    searchQuery: string,
    resetTriggers: any[], // Array untuk memantau kapan halaman harus direset ke 1 (misal: ganti tanggal)
    itemsPerPage: number = 10
) {
    const [currentPage, setCurrentPage] = useState(1)

    // 1. Otomatis reset ke halaman 1 jika admin mengetik pencarian atau mengganti filter
    useEffect(() => {
        setCurrentPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, resetTriggers)

    // 2. Filter data berdasarkan pencarian (Pakai useMemo agar sangat cepat)
    const processedOrders = useMemo(() => {
        const query = searchQuery.toLowerCase()
        if (!query) return orders

        return orders.filter(order =>
            order.order_number.toLowerCase().includes(query) ||
            order.customer_name.toLowerCase().includes(query)
        )
    }, [orders, searchQuery])

    // 3. Hitung total halaman
    const totalPages = Math.ceil(processedOrders.length / itemsPerPage) || 1

    // 4. Potong data khusus untuk halaman saat ini
    const paginatedOrders = useMemo(() => {
        return processedOrders.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [processedOrders, currentPage, itemsPerPage])

    // Kembalikan semua yang dibutuhkan oleh UI
    return {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedOrders,
        totalProcessed: processedOrders.length
    }
}