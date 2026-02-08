'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { BarChart3, RefreshCcw, TrendingUp } from 'lucide-react'

type AnalyticsDaily = {
    date: string
    orders: number
    paid_orders: number
    revenue_paid: number
}

type AnalyticsResponse = {
    summary: {
        days: number
        totalOrders: number
        paidOrders: number
        revenuePaid: number
    }
    breakdown: {
        statusCounts: Record<string, number>
        paymentCounts: Record<string, number>
    }
    daily: AnalyticsDaily[]
}

function formatIDR(value: number) {
    return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}

function maxOf(arr: number[]) {
    return arr.reduce((m, x) => (x > m ? x : m), 0)
}

export default function AdminAnalyticsPage() {
    const [days, setDays] = useState<'7' | '14' | '30'>('14')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [data, setData] = useState<AnalyticsResponse | null>(null)

    const fetchAnalytics = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/admin/analytics?days=${days}`)
            const json = await res.json()
            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat analytics')
                setData(null)
                setLoading(false)
                return
            }
            setData(json)
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat analytics'
            setError(message)
            setData(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days])

    const daily = data?.daily ?? []

    const maxRevenue = useMemo(() => maxOf(daily.map((d) => d.revenue_paid)), [daily])
    const maxOrders = useMemo(() => maxOf(daily.map((d) => d.orders)), [daily])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Analytics</h1>
                    <p className="text-[#8b775b]">Ringkasan performa order & revenue.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="min-w-[160px]">
                        <Select value={days} onValueChange={(v) => setDays(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="14">Last 14 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={fetchAnalytics}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        disabled={loading}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Revenue (Paid)</CardTitle>
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : formatIDR(data?.summary?.revenuePaid ?? 0)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Last {days} days</p>
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Orders</CardTitle>
                        <BarChart3 className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(data?.summary?.totalOrders ?? 0)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Paid: {loading ? '...' : String(data?.summary?.paidOrders ?? 0)}</p>
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Payment Breakdown</CardTitle>
                        <Badge className="bg-primary/10 text-primary border-none">{days} days</Badge>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-sm text-[#8b775b]">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(data?.breakdown?.paymentCounts ?? {}).length === 0 && (
                                    <div className="text-sm text-[#8b775b]">No data</div>
                                )}
                                {Object.entries(data?.breakdown?.paymentCounts ?? {}).map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between text-sm">
                                        <span className="text-[#8b775b]">{k}</span>
                                        <span className="font-bold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardContent className="py-6 text-sm text-red-600 font-semibold">{error}</CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Revenue / Day (Paid)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-sm text-[#8b775b]">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {daily.map((d) => (
                                    <div key={d.date} className="flex items-center gap-3">
                                        <div className="w-[90px] text-xs text-[#8b775b] font-semibold">{d.date}</div>
                                        <div className="flex-1 h-3 rounded-full bg-[#f1eee9] dark:bg-[#3a342a] overflow-hidden">
                                            <div
                                                className={cn('h-3 rounded-full bg-primary')}
                                                style={{ width: `${maxRevenue > 0 ? Math.round((d.revenue_paid / maxRevenue) * 100) : 0}%` }}
                                            />
                                        </div>
                                        <div className="w-[120px] text-right text-xs font-bold text-primary">{formatIDR(d.revenue_paid)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Orders / Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-sm text-[#8b775b]">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {daily.map((d) => (
                                    <div key={d.date} className="flex items-center gap-3">
                                        <div className="w-[90px] text-xs text-[#8b775b] font-semibold">{d.date}</div>
                                        <div className="flex-1 h-3 rounded-full bg-[#f1eee9] dark:bg-[#3a342a] overflow-hidden">
                                            <div
                                                className={cn('h-3 rounded-full bg-emerald-500')}
                                                style={{ width: `${maxOrders > 0 ? Math.round((d.orders / maxOrders) * 100) : 0}%` }}
                                            />
                                        </div>
                                        <div className="w-[120px] text-right text-xs font-bold text-emerald-600">{d.orders} orders</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
