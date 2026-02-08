'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBasket, User } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [storeName, setStoreName] = useState('Warm Oven')
    const totalItems = useCartStore((state) => state.getTotalItems())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

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
                        <div className="bg-[#EE4D2D] p-1.5 rounded-lg text-white">
                            <ShoppingBasket className="w-5 h-5" />
                        </div>
                        <h1 className="hidden md:block text-[#EE4D2D] text-lg font-extrabold tracking-tight">
                            {storeName}
                        </h1>
                    </Link>

                    {/* Search Bar - Flex 1 to take available space */}
                    <div className="flex-1 max-w-2xl">
                        <div className="relative group">
                            <Input
                                className="w-full bg-[#f5f5f5] dark:bg-slate-800 border-none rounded-full px-4 py-2 pl-10 h-[38px] focus-visible:ring-1 focus-visible:ring-[#EE4D2D] transition-all"
                                placeholder="Cari di Toko ini"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#EE4D2D]" />
                            <Button size="sm" className="absolute right-1 top-0.5 bottom-0.5 bg-[#EE4D2D] hover:bg-[#d03e1f] text-white rounded-full h-auto px-4">
                                Cari
                            </Button>
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
                        </nav>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-slate-600 dark:text-slate-200 hover:text-[#EE4D2D] transition-colors">
                            <ShoppingBasket className="w-6 h-6" />
                            {mounted && totalItems > 0 && (
                                <span className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-surface-dark">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

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
