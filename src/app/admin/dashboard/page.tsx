"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeProducts: 0,
        totalCustomers: 0,
    })
    const [recentOrders, setRecentOrders] = useState<
        Array<{
            id: string
            order_number: string
            customer_name: string
            customer_email: string | null
            status: string
            payment_status: string
            total_amount: number
            created_at: string
        }>
    >([])

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            setLoading(true)
            setError('')

            try {
                const res = await fetch('/api/admin/dashboard')
                const json = await res.json()

                if (cancelled) return

                if (!res.ok || !json?.success) {
                    setError(json?.error ?? 'Gagal memuat dashboard')
                    setLoading(false)
                    return
                }

                setStats({
                    totalRevenue: Number(json.stats?.totalRevenue ?? 0),
                    totalOrders: Number(json.stats?.totalOrders ?? 0),
                    activeProducts: Number(json.stats?.activeProducts ?? 0),
                    totalCustomers: Number(json.stats?.totalCustomers ?? 0),
                })
                setRecentOrders(Array.isArray(json.recentOrders) ? json.recentOrders : [])
                setLoading(false)
            } catch (e) {
                if (cancelled) return
                const message = e instanceof Error ? e.message : 'Gagal memuat dashboard'
                setError(message)
                setLoading(false)
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [])

    const revenueText = useMemo(() => {
        return `Rp ${Math.round(stats.totalRevenue).toLocaleString('id-ID')}`
    }, [stats.totalRevenue])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={loading ? '...' : revenueText} trend={loading ? '...' : 'Realtime'} icon={DollarSign} positive />
                <StatCard title="Total Orders" value={loading ? '...' : String(stats.totalOrders)} trend={loading ? '...' : 'Realtime'} icon={ShoppingCart} positive />
                <StatCard title="Active Products" value={loading ? '...' : String(stats.activeProducts)} trend={loading ? '...' : 'Realtime'} icon={Package} />
                <StatCard title="Total Customers" value={loading ? '...' : String(stats.totalCustomers)} trend={loading ? '...' : 'Realtime'} icon={Users} positive />
            </div>

            {error && (
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardContent className="py-6 text-sm text-red-600 font-semibold">
                        {error}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                        <button className="text-primary text-sm font-bold hover:underline">View All</button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                        <th className="pb-4">Order ID</th>
                                        <th className="pb-4">Customer</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4">Total</th>
                                        <th className="pb-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1eee9] dark:divide-[#3a342a]">
                                    {loading && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-[#8b775b]">
                                                Loading...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-[#8b775b]">
                                                Belum ada pesanan.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && recentOrders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4 font-bold text-sm">#{order.order_number}</td>
                                            <td className="py-4">
                                                <p className="text-sm font-bold">{order.customer_name}</p>
                                                <p className="text-xs text-[#8b775b]">{order.customer_email ?? '-'}</p>
                                            </td>
                                            <td className="py-4">
                                                <Badge
                                                    className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                                        String(order.payment_status).toLowerCase() === 'paid'
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-amber-100 text-amber-700"
                                                    )}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 font-bold text-sm">Rp {Number(order.total_amount ?? 0).toLocaleString('id-ID')}</td>
                                            <td className="py-4 text-right">
                                                <button aria-label="View order details" className="p-2 hover:bg-white dark:hover:bg-[#1e1a14] rounded-lg transition-all text-[#8b775b]">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Best Sellers Side Card */}
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Best Sellers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {BEST_SELLERS_ADMIN.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">#{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    <p className="text-xs text-[#8b775b]">{item.sales} sales this week</p>
                                </div>
                                <p className="font-bold text-sm text-primary">+{item.growth}%</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string
    trend: string
    icon: React.ComponentType<{ className?: string }>
    positive?: boolean
}

function StatCard({ title, value, trend, icon: Icon, positive }: StatCardProps) {
    return (
        <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 size-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#8b775b]">{title}</CardTitle>
                <Icon className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black mb-1">{value}</div>
                <p className={cn("text-xs font-bold flex items-center gap-1", positive ? "text-green-600" : "text-red-500")}>
                    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                    <span className="text-[#8b775b] font-normal ml-1">vs last month</span>
                </p>
            </CardContent>
        </Card>
    )
}

const BEST_SELLERS_ADMIN = [
    { name: 'Nastar Wisman', sales: 124, growth: 12 },
    { name: 'Sourdough Loaf', sales: 98, growth: 8 },
    { name: 'Sea Salt Brownies', sales: 85, growth: 15 },
]
