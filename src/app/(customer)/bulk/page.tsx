import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BulkOrdersPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Info</Badge>
                <h1 className="text-4xl font-black">Bulk Orders</h1>
                <p className="text-[#8b775b]">Pesanan besar untuk hampers/acara/kantor.</p>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Cara Request</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b775b] leading-relaxed space-y-4">
                    <p>
                        Untuk pesanan besar (hampers/acara), silakan checkout seperti biasa atau hubungi admin via WhatsApp.
                    </p>
                    <p>
                        Kamu juga bisa mulai dari halaman <Link className="text-primary font-bold hover:underline" href="/products">Menu</Link> dan tulis kebutuhan di catatan checkout.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
