'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, PieChart, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'

import { AdminFooter } from '@/components/admin/AdminFooter'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            toast.success('Logout berhasil')
            router.push('/login')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal logout'
            toast.error(message)
        }
    }

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
        { label: 'Products', icon: Package, href: '/admin/products' },
        { label: 'Customers', icon: Users, href: '/admin/customers' },
        { label: 'Reviews', icon: Star, href: '/admin/reviews' },
        { label: 'Analytics', icon: PieChart, href: '/admin/analytics' },
        { label: 'Settings', icon: Settings, href: '/admin/settings' },
    ]

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#fbfaf9] dark:bg-[#1e1a14]">
            {/* Mobile Header - Optional if you want one */}
            <header className="md:hidden h-16 bg-white dark:bg-[#2a241c] border-b border-[#f1eee9] dark:border-[#3a342a] flex items-center justify-between px-4 sticky top-0 z-30">
                <h1 className="text-lg font-black text-primary uppercase tracking-wider">Bakery Admin</h1>
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">U</div>
            </header>

            {/* Sidebar */}
            <aside className="w-full md:w-[260px] bg-white dark:bg-[#2a241c] border-b md:border-b-0 md:border-r border-[#f1eee9] dark:border-[#3a342a] flex flex-col md:h-screen md:sticky md:top-0 md:overflow-y-auto shrink-0 z-20">
                <div className="hidden md:block p-6 border-b border-[#f1eee9] dark:border-[#3a342a]">
                    <h1 className="text-xl font-black text-primary uppercase tracking-wider">Bakery Admin</h1>
                </div>
                <nav className="p-4 space-y-2 flex-1 overflow-x-auto md:overflow-visible flex md:block gap-2 md:gap-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-[#8b775b] hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-[#f1eee9] dark:border-[#3a342a] hidden md:block">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-bold hover:bg-red-50/50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="hidden md:flex h-20 border-b border-[#f1eee9] dark:border-[#3a342a] items-center justify-between px-8 bg-white/50 dark:bg-[#2a241c]/50 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Welcome Back, Umi!</h2>
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">U</div>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-8">
                    {children}
                </div>

                <AdminFooter />
            </main>
        </div>
    )
}
