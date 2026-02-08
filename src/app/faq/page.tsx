import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function FaqPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Help Center</Badge>
                <h1 className="text-4xl font-black">FAQ</h1>
                <p className="text-[#8b775b]">
                    Pertanyaan yang sering ditanyakan seputar pre-order, pengiriman, dan pembayaran.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Bagaimana cara order?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Pilih produk di halaman <Link className="text-primary font-bold hover:underline" href="/products">Menu</Link>,
                        lalu lanjutkan checkout. Setelah order tersimpan, kamu akan diarahkan ke WhatsApp untuk konfirmasi.
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Apakah semua produk pre-order?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Sebagian besar produk adalah pre-order agar selalu fresh. Detail lead time dapat kamu lihat di halaman{' '}
                        <Link className="text-primary font-bold hover:underline" href="/pre-order">Pre-Order</Link> dan juga di detail produk.
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Pengiriman bisa ke luar kota?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Tergantung produk. Beberapa produk hanya melayani dalam kota (local delivery / pickup). Informasi ini ada di tab Shipping Info pada detail produk.
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Metode pembayaran apa saja?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Saat ini pembayaran & konfirmasi dilakukan melalui WhatsApp. Setelah kamu checkout, kami akan bantu info nominal & metode pembayaran.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
