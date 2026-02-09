'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutGrid, Search, User } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function Header() {
    const router = useRouter()
    const [isScrolled, setIsScrolled] = useState(false)
    const [storeName, setStoreName] = useState('Warm Oven')
    const totalItems = useCartStore((state) => state.getTotalItems())
    const [mounted, setMounted] = useState(false)

    const [q, setQ] = useState('')
    const [openSuggest, setOpenSuggest] = useState(false)
    const [loadingSuggest, setLoadingSuggest] = useState(false)
    const [suggestProducts, setSuggestProducts] = useState<{ id: string; name: string; slug: string }[]>([])
    const [suggestCategories, setSuggestCategories] = useState<{ id: string; name: string; slug: string }[]>([])
    const rootRef = useRef<HTMLDivElement | null>(null)

    const qTrim = useMemo(() => q.trim(), [q])

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!openSuggest) return

        const onDocMouseDown = (e: MouseEvent) => {
            const el = rootRef.current
            if (!el) return
            if (e.target instanceof Node && !el.contains(e.target)) {
                setOpenSuggest(false)
            }
        }

        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [openSuggest])

    useEffect(() => {
        let cancelled = false
        const term = qTrim

        if (!term) {
            setSuggestProducts([])
            setSuggestCategories([])
            setLoadingSuggest(false)
            return
        }

        setLoadingSuggest(true)

        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`)
                const json = await res.json()
                if (cancelled) return

                if (!res.ok || !json?.success) {
                    setSuggestProducts([])
                    setSuggestCategories([])
                    setLoadingSuggest(false)
                    return
                }

                setSuggestProducts(Array.isArray(json.products) ? json.products : [])
                setSuggestCategories(Array.isArray(json.categories) ? json.categories : [])
                setLoadingSuggest(false)
            } catch {
                if (cancelled) return
                setSuggestProducts([])
                setSuggestCategories([])
                setLoadingSuggest(false)
            }
        }, 250)

        return () => {
            cancelled = true
            clearTimeout(t)
        }
    }, [qTrim])

    const goSearch = (term: string) => {
        const t = term.trim()
        if (!t) {
            router.push('/products')
            setOpenSuggest(false)
            return
        }

        const params = new URLSearchParams({ q: t })
        router.push(`/products?${params.toString()}`)
        setOpenSuggest(false)
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            try {
                const res = await fetch('/api/settings')
                const json = await res.json()
                if (!res.ok || !json?.success) return
                if (cancelled) return

                const name = String(json?.settings?.store_name ?? '').trim()
                if (name) setStoreName(name)
            } catch {
                // ignore
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <>
            <header
                className={cn(
                    'sticky top-0 z-99 w-full transition-all duration-300 border-b',
                    isScrolled
                        ? 'bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-sm border-slate-100 dark:border-slate-800'
                        : 'bg-white dark:bg-surface-dark border-transparent'
                )}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 h-[60px] gap-4">
                    {/* Logo - Hide on mobile if search needs space, or keep small */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                            <Image src="/favicon.png" alt={storeName} fill className="object-contain p-1" />
                        </div>
                        <h1 className="hidden md:block text-[#EE4D2D] text-lg font-extrabold tracking-tight">
                            {storeName}
                        </h1>
                    </Link>

                    {/* Search Bar - Flex 1 to take available space */}
                    <div className="flex-1 max-w-2xl">
                        <div ref={rootRef} className="relative group">
                            <Input
                                className="w-full bg-[#f5f5f5] dark:bg-slate-800 border-none rounded-full px-4 py-2 pl-10 h-[38px] focus-visible:ring-1 focus-visible:ring-[#EE4D2D] transition-all"
                                placeholder="Cari di Toko ini"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value)
                                    setOpenSuggest(true)
                                }}
                                onFocus={() => setOpenSuggest(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        goSearch(q)
                                    }
                                    if (e.key === 'Escape') {
                                        setOpenSuggest(false)
                                    }
                                }}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#EE4D2D]" />
                            <Button
                                size="sm"
                                type="button"
                                onClick={() => goSearch(q)}
                                className="absolute right-1 top-0.5 bottom-0.5 bg-[#EE4D2D] hover:bg-[#d03e1f] text-white rounded-full h-auto px-4"
                            >
                                Cari
                            </Button>

                            {openSuggest && qTrim && (
                                <div className="absolute top-full mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-lg overflow-hidden">
                                    <div className="p-2">
                                        {loadingSuggest && (
                                            <div className="px-3 py-2 text-sm text-slate-500">Mencari...</div>
                                        )}

                                        {!loadingSuggest && suggestCategories.length > 0 && (
                                            <div className="pb-2">
                                                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Categories
                                                </div>
                                                {suggestCategories.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            router.push(`/products?category=${encodeURIComponent(c.slug)}`)
                                                            setOpenSuggest(false)
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {!loadingSuggest && suggestProducts.length > 0 && (
                                            <div>
                                                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Products
                                                </div>
                                                {suggestProducts.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            router.push(`/products/${p.slug}`)
                                                            setOpenSuggest(false)
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {!loadingSuggest && suggestCategories.length === 0 && suggestProducts.length === 0 && (
                                            <button
                                                type="button"
                                                onClick={() => goSearch(q)}
                                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-300"
                                            >
                                                Cari: <span className="font-bold">{qTrim}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 mr-4">
                            <Link href="/products" className="text-sm font-medium hover:text-[#EE4D2D] transition-colors">
                                Menu
                            </Link>
                            <Link href="/reviews" className="text-sm font-medium hover:text-[#EE4D2D] transition-colors">
                                Reviews
                            </Link>
                            <Link href="/faq" className="text-sm font-medium hover:text-[#EE4D2D] transition-colors">
                                FAQ
                            </Link>
                            <Link href="/pre-order" className="text-sm font-medium hover:text-[#EE4D2D] transition-colors">
                                Pre-Order
                            </Link>
                            <Link
                                href="/cart"
                                className="relative text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-[#EE4D2D] transition-colors"
                            >
                                Cart
                                {mounted && totalItems > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#EE4D2D] text-white text-[10px] font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </nav>

                        {/* Mobile quick nav */}
                        <nav className="flex md:hidden items-center gap-1">
                            <Button asChild variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:text-[#EE4D2D]">
                                <Link href="/products" aria-label="Menu Produk">
                                    <LayoutGrid className="w-5 h-5" />
                                </Link>
                            </Button>
                        </nav>

                        {/* Profile - Desktop only */}
                        <div className="hidden md:block">
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700">
                                <User className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
