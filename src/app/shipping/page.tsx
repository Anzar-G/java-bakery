import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ShippingInfoPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Info</Badge>
                <h1 className="text-4xl font-black">Shipping Info</h1>
                <p className="text-[#8b775b]">Informasi pengiriman & pickup.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Ketersediaan delivery bergantung pada produk. Produk tertentu hanya tersedia untuk area dalam kota (local delivery).
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Pickup</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Pickup bisa dilakukan by appointment. Kamu bisa tulis request pickup di catatan checkout.
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Pre-Order</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-[#8b775b] leading-relaxed">
                        Karena sebagian produk bersifat pre-order, mohon order minimal H-2.
                        Lihat detail di halaman <Link className="text-primary font-bold hover:underline" href="/pre-order">Pre-Order</Link>.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
