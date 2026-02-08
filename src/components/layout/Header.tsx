'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBasket, Menu, X, User } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [storeName, setStoreName] = useState('Warm Oven')
    const totalItems = useCartStore((state) => state.getTotalItems())

    useEffect(() => {
        setMounted(true)
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
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-all duration-300 px-6 lg:px-20 py-4 border-b',
                isScrolled
                    ? 'bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-[#f1eee9] dark:border-white/10'
                    : 'bg-transparent border-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                            <ShoppingBasket className="w-6 h-6" />
                        </div>
                        <h1 className="text-deep-brown dark:text-white text-xl font-extrabold tracking-tight">
                            {storeName}
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/products" className="text-sm font-semibold hover:text-primary transition-colors">
                            Menu
                        </Link>
                        <Link href="/pre-order" className="text-sm font-semibold hover:text-primary transition-colors">
                            Pre-Order
                        </Link>
                        <Link href="/reviews" className="text-sm font-semibold hover:text-primary transition-colors">
                            Reviews
                        </Link>
                        <Link href="/faq" className="text-sm font-semibold hover:text-primary transition-colors">
                            FAQ
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Search */}
                    <div className="hidden sm:flex items-center bg-[#f1eee9] dark:bg-white/5 rounded-xl px-4 py-1 border border-transparent focus-within:border-primary/30 transition-all">
                        <Search className="text-gray-500 w-4 h-4" />
                        <Input
                            className="bg-transparent border-none focus-visible:ring-0 text-sm w-32 lg:w-48 placeholder:text-gray-400 h-9"
                            placeholder="Search treats..."
                        />
                    </div>

                    {/* Cart */}
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="relative bg-[#f1eee9] dark:bg-white/5 rounded-xl text-deep-brown dark:text-white hover:bg-primary/10 transition-colors"
                    >
                        <Link href="/cart" aria-label="Keranjang">
                            <ShoppingBasket className="w-5 h-5" />
                            {mounted && totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </Button>

                    {/* Profile */}
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border-2 border-primary/20 p-0 overflow-hidden">
                        <User className="w-5 h-5" />
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-background border-b p-6 space-y-4 animate-in slide-in-from-top duration-300">
                    <Link href="/products" className="block text-lg font-semibold py-2">Menu</Link>
                    <Link href="/pre-order" className="block text-lg font-semibold py-2">Pre-Order</Link>
                    <Link href="/reviews" className="block text-lg font-semibold py-2">Reviews</Link>
                    <Link href="/faq" className="block text-lg font-semibold py-2">FAQ</Link>
                </div>
            )}
        </header>
    )
}
