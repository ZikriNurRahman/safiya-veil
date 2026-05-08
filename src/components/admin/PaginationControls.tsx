// src/components/admin/PaginationControls.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}

export function PaginationControls({
    currentPage, totalPages, totalItems, itemsPerPage, onPageChange
}: PaginationControlsProps) {
    // Kalau tidak ada data, langsung sembunyikan pagination-nya
    if (totalItems === 0) return null

    return (
        <div className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: '#FFFBE9', borderTop: '1px solid #E3CAA5' }}>
            <p className="text-xs font-medium" style={{ color: '#8C6E5A' }}>
                Menampilkan <span className="font-bold text-[#3D2B1F]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-[#3D2B1F]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari total <span className="font-bold text-[#3D2B1F]">{totalItems}</span> pesanan
            </p>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 border rounded-md transition-all disabled:opacity-50 hover:bg-[#FAF5E8]"
                    style={{ color: currentPage === 1 ? '#CEAB93' : '#3D2B1F', borderColor: '#E3CAA5' }}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-bold px-2" style={{ color: '#AD8B73' }}>
                    Halaman {currentPage} dari {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border rounded-md transition-all disabled:opacity-50 hover:bg-[#FAF5E8]"
                    style={{ color: currentPage === totalPages ? '#CEAB93' : '#3D2B1F', borderColor: '#E3CAA5' }}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}