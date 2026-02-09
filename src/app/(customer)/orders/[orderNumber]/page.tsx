'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronRight, Package, CreditCard, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OrderResponse = {
    success: boolean
    error?: string
    order?: {
        order_number: string
        status: string
        payment_method: string
        payment_status: string
        total_amount: number
        subtotal: number
        tax_amount: number
        shipping_cost: number
        discount_amount: number
        customer_name: string
        customer_phone: string
        shipping_address: string
        shipping_city: string
        shipping_postal_code: string | null
        created_at: string
    }
    items?: Array<{
        id: string
        product_name: string
        variant_name: string | null
        unit_price: number
        quantity: number
        subtotal: number
    }>
}

function formatIDR(value: number) {
    return `Rp ${Number(value).toLocaleString('id-ID')}`
}

function statusLabel(status: string) {
    switch (status) {
        case 'confirmed':
            return 'Dikonfirmasi'
        case 'processing':
            return 'Diproses'
        case 'ready':
            return 'Siap Diambil/Dikirim'
        case 'completed':
            return 'Selesai'
        case 'cancelled':
            return 'Dibatalkan'
        default:
            return 'Menunggu'
    }
}

function statusBadgeClass(status: string) {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    if (status === 'ready') return 'bg-blue-100 text-blue-700'
    if (status === 'processing' || status === 'confirmed') return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-700'
}

export default function OrderStatusPage() {
    const params = useParams<{ orderNumber: string }>()
    const orderNumber = typeof params?.orderNumber === 'string' ? params.orderNumber : ''

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [data, setData] = useState<OrderResponse | null>(null)

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            if (!orderNumber) {
                setLoading(false)
                setError('Order number tidak valid')
                return
            }

            setLoading(true)
            setError('')

            try {
                const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`)
                const json = (await res.json()) as OrderResponse

                if (cancelled) return

                if (!res.ok || !json.success) {
                    setError(json.error ?? 'Gagal memuat status pesanan')
                    setData(null)
                    setLoading(false)
                    return
                }

                setData(json)
                setLoading(false)
            } catch (e) {
                if (cancelled) return
                const message = e instanceof Error ? e.message : 'Gagal memuat status pesanan'
                setError(message)
                setData(null)
                setLoading(false)
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [orderNumber])

    const itemsTotalQty = useMemo(() => {
        return data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
    }, [data])

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/" className="text-[#8b775b] text-sm font-medium hover:text-primary transition-colors">Beranda</Link>
                <ChevronRight className="w-4 h-4 text-[#8b775b]" />
                <Link href="/products" className="text-[#8b775b] text-sm font-medium hover:text-primary transition-colors">Produk</Link>
                <ChevronRight className="w-4 h-4 text-[#8b775b]" />
                <span className="text-[#191510] dark:text-[#fbfaf9] text-sm font-semibold">Status Pesanan</span>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-black">Status Pesanan</h1>
                <p className="text-[#8b775b] mt-1">Pantau proses pesanan kamu secara real-time.</p>
            </div>

            {loading && (
                <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                    <div className="flex items-center gap-3 text-[#8b775b]">
                        <Clock className="w-5 h-5" />
                        <span>Memuat data pesanan...</span>
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                    <div className="flex items-center gap-3 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">{error}</span>
                    </div>
                    <div className="mt-6">
                        <Button asChild className="bg-primary text-white">
                            <Link href="/products">Kembali Belanja</Link>
                        </Button>
                    </div>
                </div>
            )}

            {!loading && !error && data?.order && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[#8b775b] text-xs font-bold uppercase tracking-wider">Nomor Pesanan</p>
                                    <p className="text-2xl font-black text-primary mt-1">#{data.order.order_number}</p>
                                    <p className="text-sm text-[#8b775b] mt-1">Item: {itemsTotalQty}</p>
                                </div>
                                <span className={cn('text-[11px] font-bold px-3 py-1 rounded-full', statusBadgeClass(data.order.status))}>
                                    {statusLabel(data.order.status)}
                                </span>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                    <div className="flex items-center gap-2 text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                        <Package className="w-4 h-4" />
                                        Status
                                    </div>
                                    <p className="font-bold mt-2">{statusLabel(data.order.status)}</p>
                                </div>
                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                    <div className="flex items-center gap-2 text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                        <CreditCard className="w-4 h-4" />
                                        Pembayaran
                                    </div>
                                    <p className="font-bold mt-2">{data.order.payment_status}</p>
                                </div>
                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                    <div className="flex items-center gap-2 text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                        <Truck className="w-4 h-4" />
                                        Pengiriman
                                    </div>
                                    <p className="font-bold mt-2">{data.order.shipping_city}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                            <h2 className="text-lg font-black mb-4">Rincian Item</h2>
                            <div className="space-y-3">
                                {data.items?.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-4 border-b border-dashed border-[#f1eee9] dark:border-[#3a342a] pb-3">
                                        <div className="min-w-0">
                                            <p className="font-bold leading-snug">{item.product_name}</p>
                                            <p className="text-xs text-[#8b775b] mt-1">{item.variant_name ?? 'Original'} · {item.quantity}x</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatIDR(item.subtotal)}</p>
                                            <p className="text-xs text-[#8b775b]">@ {formatIDR(item.unit_price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                            <h2 className="text-lg font-black mb-4">Alamat Pengiriman</h2>
                            <p className="font-bold">{data.order.customer_name}</p>
                            <p className="text-sm text-[#8b775b] mt-1">{data.order.customer_phone}</p>
                            <p className="text-sm mt-4 leading-relaxed">{data.order.shipping_address}</p>
                            <p className="text-sm text-[#8b775b] mt-2">{data.order.shipping_city}{data.order.shipping_postal_code ? `, ${data.order.shipping_postal_code}` : ''}</p>
                        </div>

                        <div className="bg-white dark:bg-[#2a241c] border border-[#f1eee9] dark:border-[#3a342a] rounded-2xl p-8">
                            <h2 className="text-lg font-black mb-4">Ringkasan Pembayaran</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-[#8b775b]">Subtotal</span><span className="font-semibold">{formatIDR(data.order.subtotal)}</span></div>
                                <div className="flex justify-between"><span className="text-[#8b775b]">Biaya Layanan &amp; Penanganan</span><span className="font-semibold">{formatIDR(data.order.tax_amount)}</span></div>
                                <div className="flex justify-between"><span className="text-[#8b775b]">Ongkir</span><span className="font-semibold">{formatIDR(data.order.shipping_cost)}</span></div>
                                <div className="flex justify-between"><span className="text-[#8b775b]">Diskon</span><span className="font-semibold">-{formatIDR(data.order.discount_amount)}</span></div>
                                <div className="pt-4 mt-4 border-t border-dashed border-[#f1eee9] dark:border-[#3a342a] flex justify-between">
                                    <span className="text-base font-black">Total</span>
                                    <span className="text-base font-black text-primary">{formatIDR(data.order.total_amount)}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-[#8b775b]">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>Simpan nomor pesanan untuk tracking</span>
                            </div>
                        </div>

                        <Button asChild className="w-full bg-primary text-white py-7 rounded-xl font-bold">
                            <Link href="/products">Belanja Lagi</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
