import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value="Rp 12.450.000" trend="+12.5%" icon={DollarSign} positive />
                <StatCard title="Total Orders" value="148" trend="+8.2%" icon={ShoppingCart} positive />
                <StatCard title="Active Products" value="32" trend="-2.4%" icon={Package} />
                <StatCard title="Total Customers" value="892" trend="+18.7%" icon={Users} positive />
            </div>

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
                                    {RECENT_ORDERS.map((order) => (
                                        <tr key={order.id} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4 font-bold text-sm">{order.id}</td>
                                            <td className="py-4">
                                                <p className="text-sm font-bold">{order.customer}</p>
                                                <p className="text-xs text-[#8b775b]">{order.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                                    order.status === 'Paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 font-bold text-sm">Rp {order.total.toLocaleString()}</td>
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

import { cn } from '@/lib/utils'

const RECENT_ORDERS = [
    { id: '#WO-240501A', customer: 'Budi Santoso', email: 'budi@gmail.com', status: 'Paid', total: 245000 },
    { id: '#WO-240502B', customer: 'Siti Aminah', email: 'siti.a@yahoo.com', status: 'Pending', total: 120000 },
    { id: '#WO-240503C', customer: 'Andi Wijaya', email: 'andi_w@outlook.com', status: 'Paid', total: 450000 },
    { id: '#WO-240504D', customer: 'Diana Lestari', email: 'diana@email.com', status: 'Paid', total: 85000 },
]

const BEST_SELLERS_ADMIN = [
    { name: 'Nastar Wisman', sales: 124, growth: 12 },
    { name: 'Sourdough Loaf', sales: 98, growth: 8 },
    { name: 'Sea Salt Brownies', sales: 85, growth: 15 },
]
