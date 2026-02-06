'use client'

import React, { useState } from 'react'
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

export default function ProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')

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
                    <Select defaultValue="newest">
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
                            {CATEGORIES.map((cat) => (
                                <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategory === cat.name}
                                        onChange={() => setSelectedCategory(cat.name)}
                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{cat.name}</span>
                                    <span className="ml-auto text-xs text-slate-400">{cat.count}</span>
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
                            {['Available Now', 'Pre-Order Only', 'All Items'].map((label) => (
                                <label key={label} className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="availability" className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button variant="outline" className="w-full py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-xl transition-all duration-200">
                        Clear All Filters
                    </Button>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {DUMMY_PRODUCTS.map((p) => (
                            <ProductCard key={p.id} product={p} />
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

import Link from 'next/link'

const CATEGORIES = [
    { name: 'Breads', count: 14 },
    { name: 'Cookies', count: 12 },
    { name: 'Brownies', count: 8 },
    { name: 'Pizzas', count: 6 },
]

const DUMMY_PRODUCTS = [
    {
        id: '1',
        name: 'Country Sourdough Loaf',
        price: 45000,
        description: 'Naturally leavened, 48hr fermented',
        image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?q=80&w=1000',
        badge: 'Best Seller',
        rating: 4.9,
        isPreOrder: false
    },
    {
        id: '2',
        name: 'Double Choc Sea Salt',
        price: 18000,
        description: '6-pack jumbo bakery cookies',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000',
        rating: 5.0,
        isPreOrder: true
    },
    {
        id: '3',
        name: 'Fudge Walnut Brownies',
        price: 70000,
        description: 'Dense, fudgy, and decadent',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000',
        rating: 4.8,
        isPreOrder: false
    },
    {
        id: '4',
        name: 'Wood-fired Margherita',
        price: 50000,
        description: 'San Marzano & fresh buffalo mozza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000',
        badge: 'Best Seller',
        rating: 4.9,
        isPreOrder: true
    },
    // Add more if needed
]
