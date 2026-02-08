'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, ShoppingCart, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Zap, label: 'Flash Sale', href: '/products?availability=preorder' }, // Using Pre-Order as proxy for Flash Sale
        { icon: ShoppingCart, label: 'Cart', href: '/cart' },
        { icon: MessageCircle, label: 'Chat', href: '#' }, // Placeholder
        { icon: User, label: 'Profile', href: '/profile' }, // Placeholder or actual profile
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-100 md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            {navItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                            isActive ? "text-[#EE4D2D]" : "text-slate-500 dark:text-slate-400"
                        )}
                    >
                        <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
