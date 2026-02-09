'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function TrackOrderPage() {
    const router = useRouter()
    const [code, setCode] = useState('')
    const normalized = useMemo(() => code.trim(), [code])

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!normalized) return
        router.push(`/orders/${encodeURIComponent(normalized)}`)
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/" className="text-[#8b775b] text-sm font-medium hover:text-primary transition-colors">
                    Beranda
                </Link>
                <ChevronRight className="w-4 h-4 text-[#8b775b]" />
                <span className="text-[#191510] dark:text-[#fbfaf9] text-sm font-semibold">Cek Status Pesanan</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black">Cek Status Pesanan</h1>
                <p className="text-[#8b775b] mt-1">Masukkan kode pesanan kamu (contoh: ORD-20260209-ABCD)</p>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Cari Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="ORD-YYYYMMDD-XXXX"
                            className="h-12"
                            autoCapitalize="characters"
                        />
                        <Button type="submit" className="h-12 bg-primary text-white font-bold" disabled={!normalized}>
                            <Search className="w-4 h-4" />
                            Cek
                        </Button>
                    </form>

                    <div className="mt-6 text-sm text-[#8b775b]">
                        Tips: kode pesanan ada di halaman checkout setelah kamu klik <span className="font-bold">Buat Pesanan</span>, dan juga ada di chat WhatsApp.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
