import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TermsPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Legal</Badge>
                <h1 className="text-4xl font-black">Terms of Service</h1>
                <p className="text-[#8b775b]">Syarat dan ketentuan penggunaan website Bakery Umi.</p>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Ketentuan Umum</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b775b] leading-relaxed space-y-4">
                    <p>
                        Dengan melakukan checkout, kamu menyetujui bahwa pesanan akan diproses melalui WhatsApp untuk konfirmasi
                        pembayaran dan jadwal pengiriman/pickup.
                    </p>
                    <p>
                        Karena sebagian produk bersifat pre-order, jadwal produksi/pengiriman dapat menyesuaikan dengan batch.
                    </p>
                    <p>
                        Untuk pembatalan/perubahan pesanan, silakan hubungi admin melalui WhatsApp.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
