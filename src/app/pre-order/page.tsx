import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PreOrderPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">How it works</Badge>
                <h1 className="text-4xl font-black">Pre-Order</h1>
                <p className="text-[#8b775b]">
                    Produk dibuat fresh berdasarkan pesanan. Ini membantu kualitas tetap maksimal dan mengurangi food waste.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Lead Time</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Rata-rata pre-order membutuhkan minimal 2 hari. Untuk setiap produk, detailnya akan tampil di halaman detail produk.
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Jadwal Produksi & Pengiriman</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Pengiriman biasanya dilakukan di hari batch (mis. Jumat). Untuk request tanggal tertentu, tuliskan di catatan saat checkout.
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Cara Order</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed space-y-3">
                        <p>
                            1) Pilih produk di halaman <Link className="text-primary font-bold hover:underline" href="/products">Menu</Link>.
                        </p>
                        <p>
                            2) Masukkan ke keranjang atau klik <span className="font-semibold">Beli Sekarang</span>.
                        </p>
                        <p>
                            3) Isi form checkout. Setelah order tersimpan, kamu akan diarahkan ke WhatsApp untuk konfirmasi.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
