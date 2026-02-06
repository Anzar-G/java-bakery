'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Trash2, Minus, Plus, Info, ShieldCheck, ArrowRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/useCartStore'

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()
    const subtotal = getTotalPrice()
    const tax = subtotal * 0.11
    const total = subtotal + tax

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                    <ShoppingCart className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black mb-4">Keranjang Kosong</h1>
                <p className="text-slate-500 mb-8">Wah, keranjang kamu masih kosong nih. Yuk intip menu spesial hari ini!</p>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-xl">
                    <Link href="/products">Mulai Belanja</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6">
                <Link href="/" className="text-[#8b775b] text-sm font-medium hover:text-primary transition-colors">Beranda</Link>
                <ChevronRight className="w-4 h-4 text-[#8b775b]" />
                <span className="text-[#191510] dark:text-[#fbfaf9] text-sm font-semibold">Keranjang Belanja</span>
            </div>

            <div className="mb-10">
                <h1 className="text-[#191510] dark:text-[#fbfaf9] text-4xl font-black leading-tight tracking-tight">Keranjang Belanja</h1>
                <p className="text-[#8b775b] text-base font-normal mt-1">Item segar disiapkan khusus untuk pesanan pre-order Anda.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Items */}
                <div className="flex-1 space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
                        <Info className="text-primary w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm text-[#5c4a32] dark:text-[#d4ab73] leading-relaxed">
                            <strong>Catatan Pre-order:</strong> Semua item dipanggang segar di pagi hari saat pengiriman. Pesanan hari ini akan tersedia untuk pengiriman/pengambilan pada <strong>Besok, 08:00 WIB.</strong>
                        </p>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#2a241c] p-5 rounded-xl flex items-center gap-6 shadow-sm border border-[#f1eee9] dark:border-[#3a342a]">
                                <div className="relative size-24 shrink-0 rounded-lg overflow-hidden">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-[#191510] dark:text-[#fbfaf9] text-lg font-bold">{item.name}</h3>
                                            <p className="text-[#8b775b] text-sm mt-1">{item.variantName || 'Original'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-[#8b775b] hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <p className="text-primary font-bold text-lg">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                        <div className="flex items-center gap-3 bg-[#f1eee9] dark:bg-[#3a342a] px-3 py-1.5 rounded-full">
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="text-primary hover:bg-primary/10 rounded-full w-6 h-6 p-0"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-primary hover:bg-primary/10 rounded-full w-6 h-6 p-0"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:w-[380px]">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white dark:bg-[#2a241c] rounded-xl p-6 shadow-md border border-[#f1eee9] dark:border-[#3a342a]">
                            <h2 className="text-[#191510] dark:text-[#fbfaf9] text-xl font-bold mb-6">Ringkasan Pesanan</h2>

                            <div className="mb-6 space-y-2">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider block">Kode Promo</label>
                                <div className="flex gap-2">
                                    <Input className="flex-1 border-[#f1eee9] dark:border-[#3a342a] bg-[#fbfaf9] dark:bg-[#1e1a14] rounded-lg text-sm h-11" placeholder="Punya kode?" />
                                    <Button variant="outline" className="text-primary px-4 rounded-lg font-semibold text-sm hover:bg-primary/10 h-11 border-primary/20">Terapkan</Button>
                                </div>
                            </div>

                            <div className="space-y-3 pb-6 border-b border-dashed border-[#f1eee9] dark:border-[#3a342a]">
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Subtotal ({items.length} item)</span>
                                    <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Biaya Pengiriman</span>
                                    <span className="font-medium text-green-600">GRATIS</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#8b775b]">Pajak (11%)</span>
                                    <span className="font-medium">Rp {tax.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Total Pembayaran</span>
                                    <span className="text-2xl font-black text-primary">Rp {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button asChild className="w-full bg-primary text-white py-8 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <Link href="/checkout">
                                    Lanjut Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                            <p className="text-center text-[#8b775b] text-xs mt-4">Pilih metode pembayaran di langkah berikutnya</p>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                            <div className="flex items-center gap-3 text-sm text-[#8b775b]">
                                <ShieldCheck className="text-primary w-5 h-5" />
                                <span>Pembayaran aman & terenkripsi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
