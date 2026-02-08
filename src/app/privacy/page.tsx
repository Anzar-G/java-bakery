import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PrivacyPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Legal</Badge>
                <h1 className="text-4xl font-black">Privacy Policy</h1>
                <p className="text-[#8b775b]">Kebijakan privasi untuk website Bakery Umi.</p>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b775b] leading-relaxed space-y-4">
                    <p>
                        Kami mengumpulkan informasi yang kamu berikan saat checkout (nama, nomor WhatsApp, alamat, dan catatan)
                        untuk memproses pesanan.
                    </p>
                    <p>
                        Data pesanan disimpan di database untuk kebutuhan operasional (pencatatan order, konfirmasi, dan layanan pelanggan).
                    </p>
                    <p>
                        Kami tidak menjual data pribadi kamu kepada pihak ketiga.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
