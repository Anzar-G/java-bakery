'use client'

import React, { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

export default function ProductsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const categorySlug = searchParams.get('category') ?? 'all'
    const availability = searchParams.get('availability') ?? 'all'
    const sort = searchParams.get('sort') ?? 'newest'

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
                    'id, name, slug, description, base_price, featured_image, rating_average, is_pre_order, category:categories!products_category_id_fkey(slug)'
                )
                .eq('is_active', true)

            if (availability === 'preorder') {
                query = query.eq('is_pre_order', true)
            } else if (availability === 'available') {
                query = query.eq('is_pre_order', false)
            }

            if (categorySlug !== 'all') {
                query = query.eq('categories.slug', categorySlug)
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

            setProducts(Array.isArray(data) ? (data as any) : [])
        }

        fetchProducts()
    }, [availability, categorySlug, sort])

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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><ChevronRight className="w-4 h-4" /></li>
                            <li className="font-medium text-slate-900 dark:text-white">Product Catalog</li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Artisan Collection</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Showing 12 of 48 fresh baked items</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider text-xs">Sort by:</span>
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

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 space-y-8">
                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Category</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    checked={categorySlug === 'all'}
                                    onChange={() => setCategorySlug('all')}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">All</span>
                            </label>

                            {categories.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        checked={categorySlug === cat.slug}
                                        onChange={() => setCategorySlug(cat.slug)}
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Price Range</h3>
                        <div className="px-2 space-y-4">
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full relative">
                                <div className="absolute h-full w-2/3 bg-primary rounded-full left-0"></div>
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-md cursor-pointer"></div>
                                <div className="absolute top-1/2 left-[66%] -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-md cursor-pointer"></div>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <span>Rp 0</span>
                                <span>Rp 200k+</span>
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Availability</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    checked={availability === 'available'}
                                    onChange={() => setAvailability('available')}
                                    className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Available Now</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    checked={availability === 'preorder'}
                                    onChange={() => setAvailability('preorder')}
                                    className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Pre-Order Only</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="availability"
                                    checked={availability === 'all'}
                                    onChange={() => setAvailability('all')}
                                    className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                                />
                                <span className="text-slate-700 dark:text-slate-300">All Items</span>
                            </label>
                        </div>
                    </div>

                    <Button onClick={clearAllFilters} variant="outline" className="w-full py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-xl transition-all duration-200">
                        Clear All Filters
                    </Button>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                product={{
                                    id: p.id,
                                    name: p.name,
                                    slug: p.slug,
                                    price: p.base_price,
                                    description: p.description ?? '',
                                    image: p.featured_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000',
                                    badge: undefined,
                                    rating: p.rating_average ?? 5,
                                    isPreOrder: p.is_pre_order ?? true,
                                }}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <Button variant="ghost" disabled className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors disabled:opacity-30">
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button size="icon" className="w-10 h-10 rounded-lg bg-primary text-white font-bold">1</Button>
                            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors">2</Button>
                            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors">3</Button>
                            <span className="px-2 text-slate-400">...</span>
                            <Button size="icon" variant="ghost" className="w-10 h-10 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark font-bold text-slate-700 dark:text-slate-300 transition-colors">8</Button>
                        </div>
                        <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
