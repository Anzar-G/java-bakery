'use client'

import React, { useState } from 'react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, ShoppingBasket, Plus, Minus, ShieldCheck, Clock, CheckCircle, Info } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductDetailPage() {
    const [quantity, setQuantity] = useState(1)
    const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0])
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = () => {
        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: PRODUCT.id,
            variantId: selectedVariant.id,
            name: PRODUCT.name,
            variantName: selectedVariant.name,
            price: PRODUCT.basePrice + selectedVariant.priceAdjustment,
            quantity,
            image: PRODUCT.images[0].url,
        })
        toast.success(`Ditambahkan ke keranjang!`)
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                <Link href="/" className="hover:text-primary">Home</Link>
                <Plus className="w-3 h-3 rotate-45" />
                <Link href="/products" className="hover:text-primary">Cookies</Link>
                <Plus className="w-3 h-3 rotate-45" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">{PRODUCT.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Gallery */}
                <div className="lg:col-span-7">
                    <ProductGallery images={PRODUCT.images} />
                </div>

                {/* Info */}
                <div className="lg:col-span-5 flex flex-col gap-8 sticky top-28 h-fit">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-primary/20 text-primary text-xs font-bold rounded-full tracking-wide border-none px-3 py-1">
                                PRE-ORDER REQUIRED
                            </Badge>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{PRODUCT.rating} ({PRODUCT.reviewCount} Reviews)</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-2">{PRODUCT.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{PRODUCT.description}</p>
                    </div>

                    <div className="border-y border-slate-100 dark:border-slate-800 py-6">
                        <span className="text-3xl font-bold text-primary">Rp {(PRODUCT.basePrice + selectedVariant.priceAdjustment).toLocaleString()}</span>
                        {selectedVariant.oldPrice && (
                            <span className="ml-2 text-sm text-slate-400 line-through">Rp {selectedVariant.oldPrice.toLocaleString()}</span>
                        )}
                    </div>

                    {/* Variations */}
                    <div className="space-y-4">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Select Size</p>
                        <div className="flex flex-wrap gap-3">
                            {PRODUCT.variants.map((v) => (
                                <Button
                                    key={v.id}
                                    variant={selectedVariant.id === v.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedVariant(v)}
                                    className={cn(
                                        "px-5 py-6 rounded-xl border-2 font-bold transition-all",
                                        selectedVariant.id === v.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary"
                                    )}
                                >
                                    {v.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-slate-200 dark:border-slate-700 rounded-xl p-1">
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10">
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-bold">{quantity}</span>
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Stock: 5 slots left for Friday</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-7 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                                <ShoppingBasket className="w-5 h-5" />
                                Tambah ke Keranjang
                            </Button>
                            <Button variant="outline" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white border-none font-bold py-7 rounded-xl flex items-center justify-center gap-2 transition-all">
                                <WhatsAppIcon /> Beli via WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="text-primary w-5 h-5" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Quality</p>
                                <p className="text-xs font-bold">Premium Dutch Butter</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                            <Clock className="text-primary w-5 h-5" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Pre-Order</p>
                                <p className="text-xs font-bold">2-3 Days Wait</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Section */}
            <div className="mt-20">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 gap-12 mb-8">
                        <TabsTrigger value="description" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Description</TabsTrigger>
                        <TabsTrigger value="shipping" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Shipping Info</TabsTrigger>
                        <TabsTrigger value="reviews" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Reviews ({PRODUCT.reviewCount})</TabsTrigger>
                    </TabsList>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <TabsContent value="description" className="mt-0">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                        Nikmati kelezatan Nastar Wisman Premium kami, camilan ikonik yang dibuat dengan standar kualitas tertinggi. Setiap butir nastar diproduksi secara handmade dengan tekstur yang sangat lumer di mulut (melt-in-your-mouth) berkat penggunaan 100% Mentega Wisman asli.
                                    </p>
                                    <h4 className="text-xl font-bold mt-8 mb-4">Kenapa Memilih Nastar Kami?</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                                            <span><strong>Selai Nanas Homemade:</strong> Dibuat dari nanas madu pilihan, dimasak perlahan hingga mencapai karamelisasi sempurna tanpa pemanis buatan.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                                            <span><strong>Premium Butter:</strong> Aroma harum yang khas dari Wisman Dutch Butter memberikan cita rasa mewah yang tidak bisa ditemukan pada mentega biasa.</span>
                                        </li>
                                    </ul>
                                </div>
                            </TabsContent>
                            <TabsContent value="shipping">
                                <p className="text-slate-600 dark:text-slate-400">Informasi pengiriman...</p>
                            </TabsContent>
                            <TabsContent value="reviews">
                                <p className="text-slate-600 dark:text-slate-400">Ulasan pelanggan...</p>
                            </TabsContent>
                        </div>
                        <div className="lg:col-span-4 bg-primary/5 p-8 rounded-2xl border border-primary/10 h-fit">
                            <h5 className="text-lg font-bold mb-4">Storage Tips</h5>
                            <ul className="text-sm space-y-4 text-slate-600 dark:text-slate-400">
                                <li className="flex gap-3">
                                    <Info className="text-primary w-5 h-5 mt-0.5" />
                                    Keep in a cool, dry place away from direct sunlight.
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                                    Ensure the jar is tightly sealed after every opening.
                                </li>
                            </ul>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

function WhatsAppIcon() {
    return (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-2.32 0-4.591 1.342-4.591 3.232 0 .463.125.903.355 1.29l-.53 1.932 1.983-.52c.368.225.795.344 1.237.344 2.321 0 4.591-1.342 4.591-3.232 0-1.89-2.27-3.246-4.591-3.246zm3.382 4.603c-.07.194-.403.35-.556.37-.152.022-.34.038-.546-.027-.125-.04-.286-.107-.488-.198-.857-.383-1.41-1.25-1.453-1.307-.042-.057-.315-.418-.315-.798 0-.38.197-.565.268-.642.07-.077.155-.097.206-.097h.147c.05 0 .118-.02.183.136.07.163.238.58.26.623.02.044.034.095.004.154-.03.06-.044.097-.088.148-.044.052-.093.115-.133.155-.045.044-.093.092-.04.183.053.09.236.388.506.627.348.31.64.407.73.45.09.043.143.036.196-.025.053-.06.228-.266.288-.357.06-.092.122-.077.206-.047.083.03 1.516.714 1.556.734.04.02.066.03.076.047.01.017.01.1-.06.294zM12 2C6.477 2 2 6.477 2 12c0 2.13.665 4.102 1.8 5.727L2.5 21.5l3.868-1.015C7.834 21.41 9.834 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.877 0-3.63-.527-5.124-1.435l-.367-.223-2.296.602.613-2.233-.245-.39A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"></path>
        </svg>
    )
}

const PRODUCT = {
    id: 'nast-1',
    name: 'Nastar Wisman Premium',
    basePrice: 185000,
    rating: 4.9,
    reviewCount: 124,
    description: 'Authentic recipe using 100% Dutch Wisman butter and slow-cooked homemade pineapple jam.',
    images: [
        { url: 'https://images.unsplash.com/photo-1621236304198-651066076478?q=80&w=1000', alt: 'Premium Nastar' },
        { url: 'https://images.unsplash.com/photo-1621236304198-651066076478?q=80&w=1000', alt: 'Nastar inside' },
        { url: 'https://images.unsplash.com/photo-1621236304198-651066076478?q=80&w=1000', alt: 'Nastar box' },
    ],
    variants: [
        { id: 'v1', name: 'Small Jar (250g)', priceAdjustment: 0 },
        { id: 'v2', name: 'Large Jar (500g)', priceAdjustment: 100000, oldPrice: 300000 },
    ]
}

import { cn } from '@/lib/utils'
