'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, CreditCard, Truck, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/useCartStore'
import { cn } from '@/lib/utils'

type CheckoutStep = 'shipping' | 'payment' | 'confirmation'

export default function CheckoutPage() {
    const [step, setStep] = useState<CheckoutStep>('shipping')
    const { items, getTotalPrice } = useCartStore()
    const subtotal = getTotalPrice()
    const tax = subtotal * 0.11
    const total = subtotal + tax

    if (items.length === 0 && step !== 'confirmation') {
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
            {/* Steps Progress */}
            <div className="max-w-3xl mx-auto mb-16 px-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#f1eee9] dark:bg-[#3a342a] -translate-y-1/2 -z-10"></div>
                    <div className={cn("absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500",
                        step === 'shipping' ? 'w-0' : step === 'payment' ? 'w-1/2' : 'w-full')}
                    ></div>

                    <div className="flex flex-col items-center gap-2 group">
                        <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                            step === 'shipping' ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-white dark:bg-[#2a241c] text-primary border-2 border-primary")}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", step === 'shipping' ? "text-primary" : "text-[#8b775b]")}>Informasi</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                            step === 'payment' ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" :
                                step === 'confirmation' ? "bg-white dark:bg-[#2a241c] text-primary border-2 border-primary" : "bg-[#f1eee9] dark:bg-[#3a342a] text-[#8b775b]")}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider text-[#8b775b]", step === 'payment' && "text-primary")}>Pembayaran</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                            step === 'confirmation' ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-[#f1eee9] dark:bg-[#3a342a] text-[#8b775b]")}>
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider text-[#8b775b]", step === 'confirmation' && "text-primary")}>Konfirmasi</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                {/* Main Form Area */}
                <div className="lg:col-span-7">
                    {step === 'shipping' && <ShippingForm onNext={() => setStep('payment')} />}
                    {step === 'payment' && <PaymentForm onBack={() => setStep('shipping')} onNext={() => setStep('confirmation')} />}
                    {step === 'confirmation' && <ConfirmationView />}
                </div>

                {/* Order Summary (Static for Checkout) */}
                {step !== 'confirmation' && (
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 bg-white dark:bg-[#2a241c] rounded-2xl p-8 border border-[#f1eee9] dark:border-[#3a342a] shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Ringkasan Pesanan</h3>
                            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative size-16 shrink-0 rounded-lg overflow-hidden border border-[#f1eee9] dark:border-[#3a342a]">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            <span className="absolute -top-2 -right-2 size-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-background-dark">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-[#8b775b]">{item.variantName}</p>
                                            <p className="text-sm font-bold mt-1">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-dashed border-[#f1eee9] dark:border-[#3a342a]">
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Subtotal</span>
                                    <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Pajak (11%)</span>
                                    <span className="font-medium">Rp {tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-primary">Rp {total.toLocaleString()}</span>
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

function ShippingForm({ onNext }: { onNext: () => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black">Detail Pengiriman</h2>
                <p className="text-[#8b775b]">Silakan isi alamat lengkap untuk memudahkan kurir kami.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama Lengkap</label>
                    <Input className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]" placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nomor WhatsApp</label>
                    <Input className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]" placeholder="0812xxxx" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Email (Opsional)</label>
                    <Input className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]" placeholder="budi@email.com" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea className="w-full min-h-[100px] p-4 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border border-[#f1eee9] dark:border-[#3a342a] focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="Jalan, Blok, Nomor Rumah..."></textarea>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kota</label>
                    <Input className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]" placeholder="Jakarta Barat" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kode Pos</label>
                    <Input className="h-12 rounded-xl bg-[#fbfaf9] dark:bg-[#1e1a14] border-[#f1eee9] dark:border-[#3a342a]" placeholder="11xxx" />
                </div>
            </div>

            <Button onClick={onNext} className="w-full md:w-fit px-12 py-7 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2">
                Pilih Pembayaran
                <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
    )
}

function PaymentForm({ onBack, onNext }: { onBack: () => void, onNext: () => void }) {
    const [method, setMethod] = useState<'wa' | 'online'>('wa')

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black">Metode Pembayaran</h2>
                <p className="text-[#8b775b]">Kami menyediakan berbagai metode pembayaran aman.</p>
            </div>

            <div className="space-y-4">
                <div
                    onClick={() => setMethod('wa')}
                    className={cn("p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                        method === 'wa' ? "border-primary bg-primary/5" : "border-[#f1eee9] dark:border-[#3a342a] hover:border-primary/50")}
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
                    <div className={cn("size-6 rounded-full border-2 flex items-center justify-center", method === 'wa' ? "border-primary" : "border-[#8b775b]")}>
                        {method === 'wa' && <div className="size-3 bg-primary rounded-full"></div>}
                    </div>
                </div>

                <div
                    onClick={() => setMethod('online')}
                    className={cn("p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                        method === 'online' ? "border-primary bg-primary/5" : "border-[#f1eee9] dark:border-[#3a342a] hover:border-primary/50")}
                >
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Pembayaran Online (QRIS, VA, CC)</p>
                            <p className="text-sm text-[#8b775b]">Setelmen otomatis via Midtrans Gateway.</p>
                        </div>
                    </div>
                    <div className={cn("size-6 rounded-full border-2 flex items-center justify-center", method === 'online' ? "border-primary" : "border-[#8b775b]")}>
                        {method === 'online' && <div className="size-3 bg-primary rounded-full"></div>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="px-8 py-7 rounded-xl font-bold text-[#8b775b]">
                    Kembali
                </Button>
                <Button onClick={onNext} className="flex-1 md:flex-none md:px-12 py-7 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Buat Pesanan
                    <CheckCircle2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

function ConfirmationView() {
    return (
        <div className="text-center py-20 space-y-8 animate-in zoom-in duration-500">
            <div className="size-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
                <h2 className="text-4xl font-black mb-2 text-[#191510] dark:text-[#fbfaf9]">Pesanan Diterima!</h2>
                <p className="text-lg text-[#8b775b]">Nomor Pesanan: <span className="text-primary font-bold">#WO-240501A</span></p>
            </div>

            <div className="max-w-md mx-auto bg-white dark:bg-[#2a241c] p-8 rounded-2xl border border-[#f1eee9] dark:border-[#3a342a] shadow-sm">
                <p className="text-[#8b775b] mb-6">Silakan cek email atau WhatsApp Anda untuk detail pembayaran dan status pengiriman.</p>
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-primary py-7 rounded-xl font-bold">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                    <Button variant="outline" className="w-full py-7 rounded-xl font-bold border-primary text-primary">
                        Lihat Status Pesanan
                    </Button>
                </div>
            </div>
        </div>
    )
}
