import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SchedulePage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Info</Badge>
                <h1 className="text-4xl font-black">Baking Schedule</h1>
                <p className="text-[#8b775b]">Jadwal produksi dan pengiriman batch.</p>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Batch Mingguan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b775b] leading-relaxed space-y-4">
                    <p>
                        Umumnya kami produksi dan pengiriman pada hari batch (misal: Jumat). Karena sistem pre-order, kami sarankan order minimal H-2.
                    </p>
                    <p>
                        Detail lead time setiap produk bisa kamu lihat di halaman <Link className="text-primary font-bold hover:underline" href="/pre-order">Pre-Order</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
