'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, CreditCard, Truck, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/useCartStore'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type CheckoutStep = 'shipping' | 'payment' | 'confirmation'

type ShippingData = {
    fullName: string
    phone: string
    email: string
    address: string
    province: string
    city: string
    postalCode: string
    notes: string
}

const PROVINCE = {
    JATENG: 'jawa_tengah',
    JABAR: 'jawa_barat',
    JATIM: 'jawa_timur',
    DIY: 'di_yogyakarta',
    DKI: 'dki_jakarta',
    BANTEN: 'banten',
    OTHER: 'other',
} as const

function computeShippingFee(
    province: string,
    fees?: {
        jawa_tengah?: number
        di_yogyakarta?: number
        jawa_barat?: number
        dki_jakarta?: number
        banten?: number
        jawa_timur?: number
    }
): { fee: number | null; label: string } {
    const map = {
        [PROVINCE.JATENG]: Number(fees?.jawa_tengah ?? 10_000),
        [PROVINCE.DIY]: Number(fees?.di_yogyakarta ?? 10_000),
        [PROVINCE.JABAR]: Number(fees?.jawa_barat ?? 13_000),
        [PROVINCE.DKI]: Number(fees?.dki_jakarta ?? 13_000),
        [PROVINCE.BANTEN]: Number(fees?.banten ?? 13_000),
        [PROVINCE.JATIM]: Number(fees?.jawa_timur ?? 13_000),
    } as const

    if (province === PROVINCE.OTHER) return { fee: null, label: 'Ongkir (konfirmasi via WhatsApp)' }
    if (!province) return { fee: 0, label: 'Ongkir' }

    const fee = (map as any)[province]
    if (typeof fee === 'number' && Number.isFinite(fee) && fee >= 0) return { fee, label: 'Ongkir' }
    return { fee: 0, label: 'Ongkir' }
}

type PaymentMethod = 'whatsapp'

type PublicSettings = {
    whatsapp_number: string
    tax_rate: number
    store_name: string
    store_email: string
    delivery_notes: string
    pickup_notes: string
    shipping_fees?: {
        jawa_tengah?: number
        di_yogyakarta?: number
        jawa_barat?: number
        dki_jakarta?: number
        banten?: number
        jawa_timur?: number
    }
}

function generateOrderWhatsAppLink(params: {
    phoneNumber: string
    orderNumber: string
    customerName: string
    customerPhone: string
    address: string
    city: string
    totalAmount: number
    itemsText: string
    storeName?: string
    deliveryNotes?: string
    pickupNotes?: string
}) {
    const storeName = params.storeName?.trim() ? params.storeName.trim() : 'Bakery Umi'
    let message = `Halo ${storeName}, saya sudah buat pesanan:%0A%0A`
    message += `No. Pesanan: #${params.orderNumber}%0A`
    message += `Nama: ${params.customerName}%0A`
    message += `No WA: ${params.customerPhone}%0A`
    message += `Alamat: ${params.address}, ${params.city}%0A%0A`
    message += `Rincian:%0A${params.itemsText}%0A%0A`
    message += `Total: Rp${params.totalAmount.toLocaleString('id-ID')}%0A%0A`

    if (params.deliveryNotes?.trim()) {
        message += `Catatan Delivery: ${params.deliveryNotes.trim()}%0A`
    }
    if (params.pickupNotes?.trim()) {
        message += `Catatan Pickup: ${params.pickupNotes.trim()}%0A`
    }

    message += `Mohon dibantu info pembayaran & jadwal pengiriman/pickup. Terima kasih!`

    return `https://wa.me/${params.phoneNumber}?text=${message}`
}

export default function CheckoutClient() {
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') ?? 'cart'
    const isNowMode = mode === 'now'
    const nowProductId = searchParams.get('productId') ?? ''
    const nowVariantId = searchParams.get('variantId') ?? ''
    const nowQty = Number(searchParams.get('qty') ?? '1')
    const initialProvince = String(searchParams.get('province') ?? '').trim()

    const [step, setStep] = useState<CheckoutStep>('shipping')
    const { items, getTotalPrice, clearCart } = useCartStore()
    const [nowItem, setNowItem] = useState<null | {
        id: string
        productId: string
        variantId?: string
        name: string
        variantName?: string
        price: number
        quantity: number
        image: string
    }>(null)
    const [nowLoading, setNowLoading] = useState(false)
    const [nowError, setNowError] = useState<string>('')
    const [shipping, setShipping] = useState<ShippingData>({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        province: initialProvince,
        city: '',
        postalCode: '',
        notes: '',
    })
    const paymentMethod: PaymentMethod = 'whatsapp'
    const [submitting, setSubmitting] = useState(false)
    const [settings, setSettings] = useState<PublicSettings>({
        whatsapp_number: '628996853721',
        tax_rate: 0.11,
        store_name: 'Bakery Umi',
        store_email: '',
        delivery_notes: '',
        pickup_notes: '',
    })
    const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('')
    const [createdOrderSummary, setCreatedOrderSummary] = useState<{
        customerName: string
        customerPhone: string
        address: string
        city: string
        totalAmount: number
        itemsText: string
    } | null>(null)
    const [createdWhatsAppLink, setCreatedWhatsAppLink] = useState<string>('')

    const checkoutItems = useMemo(() => {
        if (isNowMode) return nowItem ? [nowItem] : []
        return items
    }, [isNowMode, items, nowItem])

    const computedSubtotal = useMemo(() => {
        return checkoutItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
    }, [checkoutItems])

    const shippingCalc = useMemo(() => computeShippingFee(shipping.province, settings.shipping_fees), [shipping.province, settings.shipping_fees])

    const computedTax = computedSubtotal * (Number(settings.tax_rate) || 0.11)
    const computedTotal = computedSubtotal + computedTax + (typeof shippingCalc.fee === 'number' ? shippingCalc.fee : 0)

    const taxLabel = `Biaya Layanan & Penanganan (${Math.round((Number(settings.tax_rate) || 0.11) * 100)}%)`

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            try {
                const res = await fetch('/api/settings')
                const json = await res.json()
                if (!res.ok || !json?.success) return
                if (cancelled) return

                const s = json.settings as Partial<PublicSettings>
                setSettings((prev) => ({
                    ...prev,
                    whatsapp_number: String(s.whatsapp_number ?? prev.whatsapp_number),
                    tax_rate: typeof s.tax_rate === 'number' ? s.tax_rate : prev.tax_rate,
                    store_name: String((s as any).store_name ?? prev.store_name),
                    store_email: String((s as any).store_email ?? prev.store_email),
                    delivery_notes: String(s.delivery_notes ?? prev.delivery_notes),
                    pickup_notes: String(s.pickup_notes ?? prev.pickup_notes),
                    shipping_fees: typeof (s as any).shipping_fees === 'object' ? ((s as any).shipping_fees as any) : prev.shipping_fees,
                }))
            } catch {
                // ignore
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            if (!isNowMode) {
                setNowItem(null)
                setNowError('')
                setNowLoading(false)
                return
            }

            if (!nowProductId) {
                setNowItem(null)
                setNowError('Produk tidak valid')
                return
            }

            setNowLoading(true)
            setNowError('')

            try {
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('id, name, base_price, featured_image')
                    .eq('id', nowProductId)
                    .maybeSingle()

                if (cancelled) return

                if (productError) throw productError
                if (!product) {
                    setNowItem(null)
                    setNowError('Produk tidak ditemukan')
                    setNowLoading(false)
                    return
                }

                let variantName: string | undefined
                let adjustment = 0

                if (nowVariantId) {
                    const { data: variant, error: variantError } = await supabase
                        .from('product_variants')
                        .select('id, name, price_adjustment')
                        .eq('id', nowVariantId)
                        .eq('product_id', product.id)
                        .maybeSingle()

                    if (cancelled) return
                    if (variantError) throw variantError
                    if (variant) {
                        variantName = variant.name
                        adjustment = Number(variant.price_adjustment ?? 0)
                    }
                }

                const base = Number(product.base_price ?? 0)
                const unitPrice = base + adjustment
                const quantity = Number.isFinite(nowQty) && nowQty > 0 ? Math.floor(nowQty) : 1

                setNowItem({
                    id: `now-${product.id}-${nowVariantId || 'base'}`,
                    productId: product.id,
                    variantId: nowVariantId || undefined,
                    name: product.name,
                    variantName,
                    price: unitPrice,
                    quantity,
                    image: product.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000',
                })
                setNowLoading(false)
            } catch (e) {
                if (cancelled) return
                const message = e instanceof Error ? e.message : 'Gagal memuat produk'
                setNowItem(null)
                setNowError(message)
                setNowLoading(false)
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [isNowMode, nowProductId, nowQty, nowVariantId])

    if (step !== 'confirmation' && (checkoutItems.length === 0 || (isNowMode && (nowLoading || !!nowError)))) {
        if (isNowMode && nowLoading) {
            return (
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-black mb-4">Memuat Produk...</h1>
                    <p className="text-[#8b775b]">Tunggu sebentar ya.</p>
                </div>
            )
        }

        if (isNowMode && nowError) {
            return (
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-black mb-4">Gagal Memuat Produk</h1>
                    <p className="text-[#8b775b] mb-8">{nowError}</p>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-xl">
                        <Link href="/products">Kembali ke Produk</Link>
                    </Button>
                </div>
            )
        }

        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-black mb-4">Keranjang Kosong</h1>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-xl">
                    <Link href="/products">Mulai Belanja</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto mb-16 px-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#f1eee9] dark:bg-[#3a342a] -translate-y-1/2 -z-10"></div>
                    <div
                        className={cn(
                            "absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500",
                            step === 'shipping' ? 'w-0' : step === 'payment' ? 'w-1/2' : 'w-full'
                        )}
                    ></div>

                    <div className="flex flex-col items-center gap-2 group">
                        <div
                            className={cn(
                                'size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                                step === 'shipping'
                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30'
                                    : 'bg-white dark:bg-[#2a241c] text-primary border-2 border-primary'
                            )}
                        >
                            <Truck className="w-5 h-5" />
                        </div>
                        <span
                            className={cn(
                                'text-xs font-bold uppercase tracking-wider',
                                step === 'shipping' ? 'text-primary' : 'text-[#8b775b]'
                            )}
                        >
                            Informasi
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                'size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                                step === 'payment'
                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30'
                                    : step === 'confirmation'
                                      ? 'bg-white dark:bg-[#2a241c] text-primary border-2 border-primary'
                                      : 'bg-[#f1eee9] dark:bg-[#3a342a] text-[#8b775b]'
                            )}
                        >
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className={cn('text-xs font-bold uppercase tracking-wider text-[#8b775b]', step === 'payment' && 'text-primary')}>
                            Pembayaran
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                'size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                                step === 'confirmation'
                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30'
                                    : 'bg-[#f1eee9] dark:bg-[#3a342a] text-[#8b775b]'
                            )}
                        >
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className={cn('text-xs font-bold uppercase tracking-wider text-[#8b775b]', step === 'confirmation' && 'text-primary')}>
                            Konfirmasi
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                <div className="lg:col-span-7">
                    {step === 'shipping' && (
                        <div className="space-y-6">
                            {(settings.delivery_notes?.trim() || settings.pickup_notes?.trim()) && (
                                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Catatan</p>
                                    {settings.delivery_notes?.trim() && (
                                        <p className="text-sm text-[#8b775b] mt-2">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Delivery:</span>{' '}
                                            {settings.delivery_notes.trim()}
                                        </p>
                                    )}
                                    {settings.pickup_notes?.trim() && (
                                        <p className="text-sm text-[#8b775b] mt-2">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Pickup:</span>{' '}
                                            {settings.pickup_notes.trim()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <ShippingForm value={shipping} onChange={setShipping} onNext={() => setStep('payment')} />
                        </div>
                    )}
                    {step === 'payment' && (
                        <div className="space-y-6">
                            {(settings.delivery_notes?.trim() || settings.pickup_notes?.trim()) && (
                                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Catatan</p>
                                    {settings.delivery_notes?.trim() && (
                                        <p className="text-sm text-[#8b775b] mt-2">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Delivery:</span>{' '}
                                            {settings.delivery_notes.trim()}
                                        </p>
                                    )}
                                    {settings.pickup_notes?.trim() && (
                                        <p className="text-sm text-[#8b775b] mt-2">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Pickup:</span>{' '}
                                            {settings.pickup_notes.trim()}
                                        </p>
                                    )}
                                </div>
                            )}

                            <PaymentForm
                                submitting={submitting}
                                onBack={() => setStep('shipping')}
                                onNext={async () => {
                                    if (!checkoutItems.length) return

                                    const waWindow = window.open('', '_blank')
                                    try {
                                        waWindow?.document.write(
                                            '<p style="font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px">Mengarahkan ke WhatsApp...</p>'
                                        )
                                    } catch {
                                        // ignore
                                    }

                                    setSubmitting(true)
                                    try {
                                        const response = await fetch('/api/orders', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                shipping: {
                                                    fullName: shipping.fullName,
                                                    phone: shipping.phone,
                                                    email: shipping.email || undefined,
                                                    address: shipping.address,
                                                    province: shipping.province || undefined,
                                                    city: shipping.city,
                                                    postalCode: shipping.postalCode || undefined,
                                                    notes: shipping.notes || undefined,
                                                },
                                                paymentMethod,
                                                items: checkoutItems.map((i) => ({
                                                    productId: i.productId,
                                                    variantId: i.variantId,
                                                    productName: i.name,
                                                    variantName: i.variantName,
                                                    price: i.price,
                                                    quantity: i.quantity,
                                                })),
                                            }),
                                        })

                                        const result = await response.json()

                                        if (!response.ok || !result?.success) {
                                            throw new Error(result?.error ?? 'Gagal membuat pesanan')
                                        }

                                        setCreatedOrderNumber(result.order.order_number)

                                        const itemsText = checkoutItems
                                            .map((i) => {
                                                const label = i.variantName ? `${i.name} - ${i.variantName}` : i.name
                                                const lineTotal = Number(i.price) * Number(i.quantity)
                                                return `- ${label} x${i.quantity} = Rp${lineTotal.toLocaleString('id-ID')}`
                                            })
                                            .join('%0A')

                                        const summary = {
                                            customerName: shipping.fullName,
                                            customerPhone: shipping.phone,
                                            address: shipping.address,
                                            city: shipping.city,
                                            totalAmount: Number(result.order.total_amount ?? computedTotal),
                                            itemsText,
                                        }

                                        setCreatedOrderSummary(summary)

                                        const waLink = generateOrderWhatsAppLink({
                                            phoneNumber: settings.whatsapp_number,
                                            orderNumber: result.order.order_number,
                                            customerName: summary.customerName,
                                            customerPhone: summary.customerPhone,
                                            address: summary.address,
                                            city: summary.city,
                                            totalAmount: summary.totalAmount,
                                            itemsText: summary.itemsText,
                                            storeName: settings.store_name,
                                            deliveryNotes: settings.delivery_notes,
                                            pickupNotes: settings.pickup_notes,
                                        })
                                        setCreatedWhatsAppLink(waLink)

                                        if (waWindow && !waWindow.closed) {
                                            try {
                                                waWindow.location.replace(waLink)
                                            } catch {
                                                // ignore
                                            }
                                        }

                                        if (!isNowMode) clearCart()

                                        setStep('confirmation')
                                    } catch (e) {
                                        if (waWindow && !waWindow.closed) {
                                            waWindow.close()
                                        }
                                        const message = e instanceof Error ? e.message : 'Gagal membuat pesanan'
                                        alert(message)
                                    } finally {
                                        setSubmitting(false)
                                    }
                                }}
                            />
                        </div>
                    )}
                    {step === 'confirmation' && (
                        <ConfirmationView
                            orderNumber={createdOrderNumber}
                            paymentMethod={paymentMethod}
                            orderSummary={createdOrderSummary}
                            whatsAppLink={createdWhatsAppLink}
                            whatsappNumber={settings.whatsapp_number}
                        />
                    )}
                </div>

                {step !== 'confirmation' && (
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 bg-white dark:bg-[#2a241c] rounded-2xl p-8 border border-[#f1eee9] dark:border-[#3a342a] shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Ringkasan Pesanan</h3>
                            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#f1eee9] dark:border-[#3a342a]">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold leading-tight">{item.name}</p>
                                            {item.variantName && (
                                                <p className="text-xs text-[#8b775b] mt-1">{item.variantName}</p>
                                            )}
                                            <div className="flex justify-between items-end mt-2">
                                                <p className="text-xs text-[#8b775b]">Qty: {item.quantity}</p>
                                                <p className="font-bold text-sm">Rp {Number(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-dashed border-[#f1eee9] dark:border-[#3a342a]">
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Subtotal</span>
                                    <span className="font-medium">Rp {computedSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">{shippingCalc.label}</span>
                                    <span className="font-medium">
                                        {shippingCalc.fee === null ? 'Dibicarakan via WhatsApp' : `Rp ${Number(shippingCalc.fee).toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">{taxLabel}</span>
                                    <span className="font-medium">Rp {computedTax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-primary">Rp {computedTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                                <p className="text-[10px] text-[#8b775b] leading-tight font-medium uppercase tracking-wider">
                                    Pesanan Anda dilindungi oleh sistem enkripsi terbaru kami.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ShippingForm({
    value,
    onChange,
    onNext,
}: {
    value: ShippingData
    onChange: (next: ShippingData) => void
    onNext: () => void
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black">Detail Pengiriman</h2>
                <p className="text-[#8b775b]">Silakan isi alamat lengkap untuk memudahkan kurir kami.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama Lengkap</label>
                    <Input
                        value={value.fullName}
                        onChange={(e) => onChange({ ...value, fullName: e.target.value })}
                        className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]"
                        placeholder="Contoh: Budi Santoso"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nomor WhatsApp</label>
                    <Input
                        value={value.phone}
                        onChange={(e) => onChange({ ...value, phone: e.target.value })}
                        className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]"
                        placeholder="0812xxxx"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Email (Opsional)</label>
                    <Input
                        value={value.email}
                        onChange={(e) => onChange({ ...value, email: e.target.value })}
                        className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]"
                        placeholder="budi@email.com"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea
                        value={value.address}
                        onChange={(e) => onChange({ ...value, address: e.target.value })}
                        className="w-full min-h-[100px] p-4 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border border-[#f1eee9] dark:border-[#3a342a] focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        placeholder="Jalan, Blok, Nomor Rumah..."
                    ></textarea>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Provinsi</label>
                    <Select value={value.province} onValueChange={(next) => onChange({ ...value, province: next })}>
                        <SelectTrigger className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]">
                            <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jawa_tengah">Jawa Tengah</SelectItem>
                            <SelectItem value="di_yogyakarta">DI Yogyakarta</SelectItem>
                            <SelectItem value="jawa_barat">Jawa Barat</SelectItem>
                            <SelectItem value="dki_jakarta">DKI Jakarta</SelectItem>
                            <SelectItem value="banten">Banten</SelectItem>
                            <SelectItem value="jawa_timur">Jawa Timur</SelectItem>
                            <SelectItem value="other">Luar Pulau Jawa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kota</label>
                    <Input
                        value={value.city}
                        onChange={(e) => onChange({ ...value, city: e.target.value })}
                        className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]"
                        placeholder="Jakarta Barat"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kode Pos</label>
                    <Input
                        value={value.postalCode}
                        onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
                        className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]"
                        placeholder="11xxx"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Catatan (Opsional)</label>
                    <textarea
                        value={value.notes}
                        onChange={(e) => onChange({ ...value, notes: e.target.value })}
                        className="w-full min-h-[90px] p-4 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border border-[#f1eee9] dark:border-[#3a342a] focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        placeholder="Contoh: titip ke satpam / patokan rumah / jam kirim..."
                    ></textarea>
                </div>
            </div>

            <Button
                onClick={() => {
                    if (!value.fullName || !value.phone || !value.address || !value.province || !value.city) {
                        alert('Lengkapi data pengiriman dulu ya.')
                        return
                    }
                    onNext()
                }}
                className="w-full md:w-fit px-12 py-7 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
            >
                Pilih Pembayaran
                <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
    )
}

function PaymentForm({
    submitting,
    onBack,
    onNext,
}: {
    submitting: boolean
    onBack: () => void
    onNext: () => void
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black">Metode Pembayaran</h2>
                <p className="text-[#8b775b]">Saat ini pre-order hanya bisa diproses melalui WhatsApp admin.</p>
            </div>

            <div className="space-y-4">
                <div
                    className={cn(
                        'p-6 rounded-2xl border-2 transition-all flex items-center justify-between',
                        'border-primary bg-primary/5'
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                            <span className="font-bold">WA</span>
                        </div>
                        <div>
                            <p className="font-bold text-lg">Bayar & Pesan via WhatsApp</p>
                            <p className="text-sm text-[#8b775b]">Admin kami akan membantu proses pembayaran Anda.</p>
                        </div>
                    </div>
                    <div className={cn('size-6 rounded-full border-2 flex items-center justify-center', 'border-primary')}>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 py-7 rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/10"
                    disabled={submitting}
                >
                    Kembali
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="flex-1 py-7 rounded-xl font-bold bg-primary text-white hover:bg-primary/90"
                    disabled={submitting}
                >
                    {submitting ? 'Memproses...' : 'Buat Pesanan'}
                </Button>
            </div>
        </div>
    )
}

function ConfirmationView({
    orderNumber,
    paymentMethod,
    orderSummary,
    whatsAppLink,
    whatsappNumber,
}: {
    orderNumber: string
    paymentMethod: PaymentMethod
    orderSummary: {
        customerName: string
        customerPhone: string
        address: string
        city: string
        totalAmount: number
        itemsText: string
    } | null
    whatsAppLink: string
    whatsappNumber: string
}) {
    const normalizedOrderNumber = String(orderNumber ?? '').trim()
    const hasOrderNumber = Boolean(normalizedOrderNumber)
    const totalAmountText = orderSummary?.totalAmount
        ? `Rp ${Number(orderSummary.totalAmount).toLocaleString('id-ID')}`
        : ''

    return (
        <div className="text-center py-20 space-y-8 animate-in zoom-in duration-500">
            <div className="size-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
                <h2 className="text-4xl font-black mb-2 text-[#191510] dark:text-[#fbfaf9]">Pesanan Diterima!</h2>
                <p className="text-lg text-[#8b775b]">
                    Nomor Pesanan:{' '}
                    <span className="text-primary font-bold">{hasOrderNumber ? `#${normalizedOrderNumber}` : 'Sedang menyiapkan...'}</span>
                </p>
            </div>

            <div className="max-w-md mx-auto bg-white dark:bg-[#2a241c] p-8 rounded-2xl border border-[#f1eee9] dark:border-[#3a342a] shadow-sm">
                {orderSummary ? (
                    <div className="text-left mb-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Ringkasan</p>
                            {totalAmountText && <p className="text-sm font-black text-primary">{totalAmountText}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                                <p className="text-xs text-[#8b775b]">Nama</p>
                                <p className="font-bold">{orderSummary.customerName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#8b775b]">No. WhatsApp</p>
                                <p className="font-bold">{orderSummary.customerPhone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#8b775b]">Alamat</p>
                                <p className="font-bold">{orderSummary.address || '-'}{orderSummary.city ? `, ${orderSummary.city}` : ''}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#8b775b]">Items</p>
                                <pre className="whitespace-pre-wrap font-sans text-sm font-bold">{decodeURIComponent(orderSummary.itemsText || '-')}</pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-[#8b775b] mb-6">Silakan lanjutkan konfirmasi via WhatsApp untuk diproses admin.</p>
                )}
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-primary py-7 rounded-xl font-bold">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="w-full py-7 rounded-xl font-bold border-primary text-primary"
                        disabled={!hasOrderNumber}
                    >
                        <Link href={hasOrderNumber ? `/orders/${encodeURIComponent(normalizedOrderNumber)}` : '/products'}>
                            Lihat Status Pesanan
                        </Link>
                    </Button>

                    {paymentMethod === 'whatsapp' && hasOrderNumber && (
                        <Button asChild className="w-full py-7 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white" disabled={!hasOrderNumber}>
                            <a
                                href={
                                    whatsAppLink ||
                                    generateOrderWhatsAppLink({
                                        phoneNumber: whatsappNumber,
                                        orderNumber: normalizedOrderNumber,
                                        customerName: orderSummary?.customerName ?? '',
                                        customerPhone: orderSummary?.customerPhone ?? '',
                                        address: orderSummary?.address ?? '',
                                        city: orderSummary?.city ?? '',
                                        totalAmount: orderSummary?.totalAmount ?? 0,
                                        itemsText: orderSummary?.itemsText ?? '',
                                        storeName: 'Bakery Umi',
                                    })
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Konfirmasi via WhatsApp
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
