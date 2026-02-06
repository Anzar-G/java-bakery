'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
        { label: 'Products', icon: Package, href: '/admin/products' },
        { label: 'Customers', icon: Users, href: '/admin/customers' },
        { label: 'Analytics', icon: PieChart, href: '/admin/analytics' },
        { label: 'Settings', icon: Settings, href: '/admin/settings' },
    ]

    return (
        <div className="flex h-screen bg-[#fbfaf9] dark:bg-[#1e1a14]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#f1eee9] dark:border-[#3a342a] flex flex-col bg-white dark:bg-[#2a241c]">
                <div className="p-6 border-b border-[#f1eee9] dark:border-[#3a342a]">
                    <h1 className="text-xl font-black text-primary uppercase tracking-wider">Bakery Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-[#8b775b] hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-[#f1eee9] dark:border-[#3a342a]">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-bold hover:bg-red-50/50 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 border-b border-[#f1eee9] dark:border-[#3a342a] flex items-center justify-between px-8 bg-white/50 dark:bg-[#2a241c]/50 backdrop-blur-sm">
                    <h2 className="text-xl font-bold">Welcome Back, Umi!</h2>
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">U</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
