'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { RefreshCcw, Users } from 'lucide-react'

type CustomerRow = {
    customer_name: string
    customer_phone: string
    customer_email: string | null
    total_orders: number
    total_spent_paid: number
    last_order_at: string
}

function formatIDR(value: number) {
    return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}

export default function AdminCustomersPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [customers, setCustomers] = useState<CustomerRow[]>([])
    const [query, setQuery] = useState('')

    const fetchCustomers = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/customers')
            const json = await res.json()

            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat customers')
                setCustomers([])
                setLoading(false)
                return
            }

            setCustomers(Array.isArray(json.customers) ? json.customers : [])
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat customers'
            setError(message)
            setCustomers([])
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return customers
        return customers.filter((c) => {
            return (
                String(c.customer_name ?? '').toLowerCase().includes(q) ||
                String(c.customer_phone ?? '').toLowerCase().includes(q) ||
                String(c.customer_email ?? '').toLowerCase().includes(q)
            )
        })
    }, [customers, query])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Customers</h1>
                    <p className="text-[#8b775b]">Daftar pelanggan berdasarkan data order.</p>
                </div>
                <Button
                    onClick={fetchCustomers}
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/10"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Total Customers</CardTitle>
                        <Users className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(customers.length)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Unique by phone</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari nama / phone / email"
                        />
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardContent className="py-6 text-sm text-red-600 font-semibold">{error}</CardContent>
                </Card>
            )}

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Daftar Customers</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none">{loading ? '...' : `${filtered.length} customers`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                    <th className="pb-4">Customer</th>
                                    <th className="pb-4">Phone</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4">Orders</th>
                                    <th className="pb-4">Total Paid</th>
                                    <th className="pb-4">Last Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1eee9] dark:divide-[#3a342a]">
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-[#8b775b]">
                                            Loading...
                                        </td>
                                    </tr>
                                )}

                                {!loading && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-[#8b775b]">
                                            Belum ada customer.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    filtered.map((c) => (
                                        <tr key={c.customer_phone} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4">
                                                <p className="text-sm font-bold">{c.customer_name || '-'}</p>
                                            </td>
                                            <td className="py-4 text-sm font-semibold">{c.customer_phone}</td>
                                            <td className="py-4 text-sm text-[#8b775b]">{c.customer_email ?? '-'}</td>
                                            <td className="py-4">
                                                <Badge className={cn('border-none', c.total_orders >= 3 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700')}>
                                                    {c.total_orders}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-sm font-black text-primary">{formatIDR(c.total_spent_paid)}</td>
                                            <td className="py-4 text-sm text-[#8b775b]">
                                                {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
