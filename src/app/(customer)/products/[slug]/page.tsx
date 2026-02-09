'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, ShoppingBasket, Plus, Minus, ShieldCheck, Clock, CheckCircle, Info } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const NAME_PREFIX = '__name__:'

type ProductImage = {
    image_url: string
    alt_text: string | null
    display_order: number | null
    is_primary: boolean | null
}

type ProductVariant = {
    id: string
    name: string
    price_adjustment: number | null
    is_active: boolean | null
    display_order: number | null
}

type ProductDetail = {
    id: string
    name: string
    slug: string
    description: string | null
    base_price: number
    featured_image: string | null
    rating_average: number | null
    review_count: number | null
    is_pre_order: boolean | null
    pre_order_days: number | null
    shipping_local_only: boolean | null
    category: { name: string; slug: string } | null
    images: ProductImage[]
    variants: ProductVariant[]
}

type ApprovedReview = {
    id: string
    rating: number
    title: string | null
    comment: string | null
    created_at: string
}

function generateWhatsAppLink(params: {
    phoneNumber: string
    productName: string
    variantName?: string
    quantity: number
    unitPrice: number
}) {
    let message = `Halo, saya ingin pre-order:%0A%0A`
    message += `Produk: ${params.productName}%0A`
    if (params.variantName) message += `Varian: ${params.variantName}%0A`
    message += `Jumlah: ${params.quantity}%0A`
    message += `Harga/pcs: Rp${params.unitPrice.toLocaleString('id-ID')}%0A%0A`
    message += `Boleh info detail & jadwal pickup/delivery ya. Terima kasih!`

    return `https://wa.me/${params.phoneNumber}?text=${message}`
}

export default function ProductDetailPage() {
    const params = useParams<{ slug: string }>()
    const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : ''
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState<ProductDetail | null>(null)
    const [approvedReviews, setApprovedReviews] = useState<ApprovedReview[]>([])
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
    const addItem = useCartStore((state) => state.addItem)

    const [showMobileBar, setShowMobileBar] = useState(true)
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = bottomSentinelRef.current
        if (!el) return

        const obs = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                setShowMobileBar(!entry.isIntersecting)
            },
            { root: null, threshold: 0.01 }
        )

        obs.observe(el)
        return () => {
            obs.disconnect()
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const fetchProduct = async () => {
            if (!slug) {
                setProduct(null)
                setLoading(false)
                return
            }

            setLoading(true)

            const { data, error } = await supabase
                .from('products')
                .select(
                    `
                    id,
                    name,
                    slug,
                    description,
                    base_price,
                    featured_image,
                    rating_average,
                    review_count,
                    is_pre_order,
                    pre_order_days,
                    shipping_local_only,
                    category:categories!products_category_id_fkey(name, slug),
                    images:product_images(image_url, alt_text, display_order, is_primary),
                    variants:product_variants(id, name, price_adjustment, is_active, display_order)
                    `
                )
                .eq('slug', slug)
                .maybeSingle()

            if (cancelled) return

            if (error) {
                console.error('[ProductDetailPage] fetchProduct error', { slug, error })
            }

            if (!data) {
                setProduct(null)
                setLoading(false)
                return
            }

            const normalized: ProductDetail = {
                ...(data as any),
                category: (data as any).category && Array.isArray((data as any).category) ? (data as any).category[0] ?? null : ((data as any).category ?? null),
                images: Array.isArray((data as any).images) ? (data as any).images : [],
                variants: Array.isArray((data as any).variants) ? (data as any).variants : [],
            }

            normalized.images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            normalized.variants.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

            setProduct(normalized)
            const firstActive = normalized.variants.find((v) => v.is_active !== false)
            setSelectedVariantId(firstActive?.id ?? null)
            setLoading(false)

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('id, rating, title, comment, created_at')
                .eq('is_approved', true)
                .eq('product_id', data.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (!cancelled) {
                if (reviewsError) {
                    console.error('[ProductDetailPage] fetchReviews error', { productId: data.id, error: reviewsError })
                }
                setApprovedReviews(Array.isArray(reviewsData) ? (reviewsData as any) : [])
            }

            await supabase
                .from('products')
                .update({ view_count: (data as any).view_count ? (data as any).view_count + 1 : 1 })
                .eq('id', data.id)
        }

        fetchProduct()

        return () => {
            cancelled = true
        }
    }, [slug])

    const computedRating = useMemo(() => {
        if (!approvedReviews.length) return null
        const total = approvedReviews.reduce((acc, r) => acc + Number(r.rating ?? 0), 0)
        return total / approvedReviews.length
    }, [approvedReviews])

    const selectedVariant = useMemo(() => {
        if (!product?.variants?.length) return null
        return product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0]
    }, [product, selectedVariantId])

    const selectableVariants = useMemo(() => {
        if (!product?.variants?.length) return []
        return product.variants.filter((v) => v.is_active !== false)
    }, [product])

    const galleryImages = useMemo(() => {
        if (!product) return []
        if (product.images?.length) {
            return product.images.map((img) => ({
                url: img.image_url,
                alt: img.alt_text ?? product.name,
            }))
        }

        if (product.featured_image) {
            return [{ url: product.featured_image, alt: product.name }]
        }

        return [{ url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000', alt: product.name }]
    }, [product])

    const unitPrice = useMemo(() => {
        if (!product) return 0
        const adjustment = selectedVariant?.price_adjustment ?? 0
        return product.base_price + Number(adjustment)
    }, [product, selectedVariant])

    const handleAddToCart = () => {
        if (!product) return

        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            variantName: selectedVariant?.name,
            price: unitPrice,
            quantity,
            image: galleryImages[0]?.url,
        })
        toast.success('Ditambahkan ke keranjang', {
            description: `${quantity} x ${product.name}`,
            action: {
                label: 'Lihat Keranjang',
                onClick: () => {
                    window.location.href = '/cart'
                },
            },
        })
    }

    const handleBuyNow = () => {
        if (!product) return
        const params = new URLSearchParams({
            mode: 'now',
            productId: product.id,
            qty: String(quantity),
        })
        if (selectedVariant?.id) params.set('variantId', selectedVariant.id)
        window.location.href = `/checkout?${params.toString()}`
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap">
                <Link href="/" className="hover:text-primary">Home</Link>
                <Plus className="w-3 h-3 rotate-45" />
                <Link
                    href={product?.category?.slug ? `/products?category=${product.category.slug}` : '/products'}
                    className="hover:text-primary"
                >
                    {loading ? 'Produk' : product?.category?.name ?? 'Produk'}
                </Link>
                <Plus className="w-3 h-3 rotate-45" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {loading ? 'Loading...' : product?.name ?? 'Produk tidak ditemukan'}
                </span>
            </nav>

            {!loading && !product && (
                <div className="py-16">
                    <h1 className="text-2xl font-bold">Produk tidak ditemukan</h1>
                    <p className="text-slate-500 mt-2">Coba balik ke katalog.</p>
                    <div className="mt-6">
                        <Button asChild>
                            <Link href="/products">Kembali ke Katalog</Link>
                        </Button>
                    </div>
                </div>
            )}

            {product && (
            <>
            <div className="mb-6">
                <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <ProductGallery images={galleryImages} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 mb-10">
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-snug">
                        {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1 text-yellow-500 font-bold">
                            <Star className="w-4 h-4 fill-current" />
                            {((computedRating ?? product.rating_average ?? 0) as number).toFixed(1)}
                        </span>
                        <span className="font-medium">({approvedReviews.length || product.review_count || 0})</span>
                        <span className="text-slate-400">|</span>
                        <Badge className="bg-primary/10 text-primary text-xs font-bold rounded-full tracking-wide border-none px-3 py-1">
                            {product.is_pre_order ? `Pre-order ${product.pre_order_days ?? 2} hari` : 'Ready'}
                        </Badge>
                    </div>

                    <div className="mb-6 space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl lg:text-4xl font-black text-red-600">Rp {unitPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="px-5 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="text-primary w-5 h-5" />
                            <div className="space-y-0.5">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Quality</p>
                                <p className="text-xs font-bold">Premium Dutch Butter</p>
                            </div>
                        </div>
                        <div className="px-5 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                            <Clock className="text-primary w-5 h-5" />
                            <div className="space-y-0.5">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Pre-Order</p>
                                <p className="text-xs font-bold">{product.pre_order_days ?? 2} Hari</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 lg:mt-0 lg:sticky lg:top-6 lg:self-start">
                    <div className="bg-white dark:bg-surface-dark p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                        {/* Variations */}
                        {selectableVariants.length > 1 && (
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Select Product</p>
                                <div className="flex flex-wrap gap-3">
                                    {selectableVariants.map((v) => (
                                        <Button
                                            key={v.id}
                                            variant={selectedVariantId === v.id ? 'default' : 'outline'}
                                            onClick={() => setSelectedVariantId(v.id)}
                                            className={cn(
                                                "px-5 py-6 rounded-xl border-2 font-bold transition-all",
                                                selectedVariantId === v.id
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-primary"
                                            )}
                                        >
                                            {v.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Actions */}
                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="flex-1 h-12 rounded-xl font-bold"
                                >
                                    -
                                </Button>
                                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="flex-1 h-12 rounded-xl font-bold"
                                >
                                    +
                                </Button>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-base font-black shadow-lg"
                            >
                                <ShoppingBasket className="w-5 h-5" />
                                Masukkan Keranjang
                            </Button>

                            <Button
                                onClick={handleBuyNow}
                                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold"
                            >
                                <WhatsAppIcon /> Beli Sekarang
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Section */}
            <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 gap-12 mb-8">
                        <TabsTrigger value="description" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Description</TabsTrigger>
                        <TabsTrigger value="shipping" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Shipping Info</TabsTrigger>
                        <TabsTrigger value="reviews" className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-bold">Reviews ({product.review_count})</TabsTrigger>
                    </TabsList>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <TabsContent value="description" className="mt-0">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{product.description}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="shipping">
                                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                                    <p className="text-base">
                                        {product.shipping_local_only
                                            ? 'Pengiriman hanya tersedia untuk area dalam kota (local delivery) / pickup.'
                                            : 'Pengiriman tersedia untuk dalam kota dan luar kota (tergantung jasa kirim & packaging).'}
                                    </p>
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/50 dark:bg-white/5">
                                        <p className="text-sm font-semibold">Catatan Pre-Order</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            Minimal pre-order {product.pre_order_days ?? 2} hari.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews">
                                {approvedReviews.length === 0 ? (
                                    <p className="text-slate-600 dark:text-slate-400">Belum ada review untuk produk ini.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {approvedReviews.map((r) => {
                                            const rawComment = String(r.comment ?? '')
                                            let reviewerName = ''
                                            let cleanedComment = rawComment
                                            if (rawComment.startsWith(NAME_PREFIX)) {
                                                const newlineIdx = rawComment.indexOf('\n')
                                                if (newlineIdx > -1) {
                                                    reviewerName = rawComment.slice(NAME_PREFIX.length, newlineIdx).trim()
                                                    cleanedComment = rawComment.slice(newlineIdx + 1)
                                                } else {
                                                    reviewerName = rawComment.slice(NAME_PREFIX.length).trim()
                                                    cleanedComment = ''
                                                }
                                            }

                                            return (
                                                <div key={r.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-slate-100">
                                                                {r.title || 'Review'}
                                                            </div>
                                                            {reviewerName && (
                                                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                                                                    {reviewerName}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-bold text-yellow-500">{r.rating}/5</div>
                                                    </div>
                                                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {cleanedComment || '-'}
                                                    </div>
                                                    <div className="mt-3 text-xs text-slate-400">
                                                        {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : ''}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
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

            <div className={cn('md:hidden fixed left-0 right-0 bottom-[72px] z-40 transition-all duration-200', showMobileBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none')}>
                <div className="mx-auto max-w-4xl px-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-surface-dark/95 backdrop-blur px-4 py-3 shadow-lg">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</div>
                                <div className="font-black text-primary truncate">Rp {(unitPrice * quantity).toLocaleString('id-ID')}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddToCart}
                                    className="h-11 rounded-xl font-bold"
                                >
                                    Tambah
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className="h-11 rounded-xl font-black bg-primary text-white"
                                >
                                    Beli
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={bottomSentinelRef} className="h-px" />
            </>
            )}
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
