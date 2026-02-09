'use client'

import React, { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface CatalogProduct {
    id: string
    name: string
    slug: string
    description: string | null
    base_price: number
    featured_image: string | null
    rating_average: number | null
    is_pre_order: boolean | null
}

interface CatalogCategory {
    id: string
    name: string
    slug: string
}

export default function ProductsClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const q = (searchParams.get('q') ?? '').trim()
    const categorySlug = searchParams.get('category') ?? 'all'
    const availability = searchParams.get('availability') ?? 'all'
    const sort = searchParams.get('sort') ?? 'newest'

    const [filtersOpen, setFiltersOpen] = useState(false)

    const [products, setProducts] = useState<CatalogProduct[]>([])
    const [categories, setCategories] = useState<CatalogCategory[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('display_order', { ascending: true })

            if (error) {
                console.error('[ProductsPage] fetchCategories error', error)
                return
            }

            setCategories(Array.isArray(data) ? data : [])
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            let query = supabase
                .from('products')
                .select(
                    'id, name, slug, description, base_price, featured_image, rating_average, is_pre_order, category:categories!products_category_id_fkey!inner(slug)'
                )
                .eq('is_active', true)

            if (q) {
                query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
            }

            if (availability === 'preorder') {
                query = query.eq('is_pre_order', true)
            } else if (availability === 'available') {
                query = query.eq('is_pre_order', false)
            }

            if (categorySlug !== 'all') {
                query = query.eq('category.slug', categorySlug)
            }

            if (sort === 'price_low') {
                query = query.order('base_price', { ascending: true })
            } else if (sort === 'price_high') {
                query = query.order('base_price', { ascending: false })
            } else if (sort === 'best') {
                query = query.order('order_count', { ascending: false })
            } else {
                query = query.order('created_at', { ascending: false })
            }

            const { data, error } = await query

            if (error) {
                console.error('[ProductsPage] fetchProducts error', { categorySlug, error })
                return
            }

            setProducts((data || []) as CatalogProduct[])
        }

        fetchProducts()
    }, [availability, categorySlug, q, sort])

    const setCategorySlug = (next: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === 'all') params.delete('category')
        else params.set('category', next)
        router.push(`/products?${params.toString()}`)
    }

    const setAvailability = (next: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === 'all') params.delete('availability')
        else params.set('availability', next)
        router.push(`/products?${params.toString()}`)
    }

    const setSort = (next: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === 'newest') params.delete('sort')
        else params.set('sort', next)
        router.push(`/products?${params.toString()}`)
    }

    const clearAllFilters = () => {
        router.push('/products')
    }

    const activeFiltersCount = (categorySlug !== 'all' ? 1 : 0) + (availability !== 'all' ? 1 : 0)

    const chipClass = (active: boolean) =>
        cn(
            'h-9 rounded-full px-3 text-sm font-semibold',
            active
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <ChevronRight className="w-4 h-4" />
                            </li>
                            <li className="font-medium text-slate-900 dark:text-white">Product Catalog</li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Artisan Collection</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Showing 12 of 48 fresh baked items</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Sort by:</span>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 rounded-lg">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest Arrivals</SelectItem>
                            <SelectItem value="price_low">Price: Low to High</SelectItem>
                            <SelectItem value="price_high">Price: High to Low</SelectItem>
                            <SelectItem value="best">Best Selling</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="hidden lg:flex flex-1 items-center gap-2 overflow-x-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">Category</span>
                        <Button variant="ghost" className={chipClass(categorySlug === 'all')} onClick={() => setCategorySlug('all')}>
                            All
                        </Button>
                        {categories.map((c) => (
                            <Button key={c.id} variant="ghost" className={chipClass(categorySlug === c.slug)} onClick={() => setCategorySlug(c.slug)}>
                                {c.name}
                            </Button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Availability</span>
                        <Button variant="ghost" className={chipClass(availability === 'all')} onClick={() => setAvailability('all')}>
                            All
                        </Button>
                        <Button variant="ghost" className={chipClass(availability === 'available')} onClick={() => setAvailability('available')}>
                            Ready
                        </Button>
                        <Button variant="ghost" className={chipClass(availability === 'preorder')} onClick={() => setAvailability('preorder')}>
                            Pre-order
                        </Button>

                        {activeFiltersCount > 0 && (
                            <Button variant="outline" className="h-9 rounded-full" onClick={clearAllFilters}>
                                <X className="w-4 h-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="lg:hidden flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-10 rounded-full"
                            onClick={() => setFiltersOpen(true)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filter{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                        </Button>
                        {activeFiltersCount > 0 && (
                            <Button variant="outline" className="h-10 rounded-full" onClick={clearAllFilters}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <DialogContent
                        className="
                            fixed right-0 top-0 h-[100dvh] w-[88vw] max-w-[420px]
                            left-auto
                            translate-x-0 translate-y-0 rounded-l-2xl rounded-r-none
                            border-l border-slate-200 dark:border-slate-800
                            p-0
                            flex flex-col gap-0 overflow-hidden
                        "
                    >
                        <DialogHeader>
                            <div className="p-6 pb-4 pt-10 pr-12">
                                <DialogTitle>Filter</DialogTitle>
                                <DialogDescription>Pilih kategori dan availability.</DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 p-6 pt-0 flex-1 overflow-y-auto">
                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="ghost" className={chipClass(categorySlug === 'all')} onClick={() => setCategorySlug('all')}>
                                        All
                                    </Button>
                                    {categories.map((c) => (
                                        <Button key={c.id} variant="ghost" className={chipClass(categorySlug === c.slug)} onClick={() => setCategorySlug(c.slug)}>
                                            {c.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Availability</div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="ghost" className={chipClass(availability === 'all')} onClick={() => setAvailability('all')}>
                                        All
                                    </Button>
                                    <Button variant="ghost" className={chipClass(availability === 'available')} onClick={() => setAvailability('available')}>
                                        Ready
                                    </Button>
                                    <Button variant="ghost" className={chipClass(availability === 'preorder')} onClick={() => setAvailability('preorder')}>
                                        Pre-order
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0">
                            <Button variant="outline" onClick={clearAllFilters}>
                                Clear
                            </Button>
                            <Button onClick={() => setFiltersOpen(false)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-3 lg:gap-4">
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                product={{
                                    id: p.id,
                                    name: p.name,
                                    slug: p.slug,
                                    price: p.base_price,
                                    description: p.description ?? '',
                                    image:
                                        p.featured_image ||
                                        'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000',
                                    badge: undefined,
                                    rating: p.rating_average ?? 0,
                                    isPreOrder: p.is_pre_order ?? false,
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center items-center gap-4">
                        <Button
                            variant="ghost"
                            disabled
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button size="icon" className="w-10 h-10 rounded-lg bg-primary text-white font-bold">
                                1
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                2
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                3
                            </Button>
                            <span className="px-2 text-slate-400">...</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                8
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
