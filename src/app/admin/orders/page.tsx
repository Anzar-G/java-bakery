'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Eye, RefreshCcw, ShoppingBag } from 'lucide-react'

type OrderRow = {
    id: string
    order_number: string
    status: string
    payment_method: string
    payment_status: string
    total_amount: number
    customer_name: string
    customer_email: string | null
    customer_phone: string
    shipping_city: string
    created_at: string
}

type OrderDetail = {
    id: string
    order_number: string
    status: string
    payment_method: string
    payment_status: string
    total_amount: number
    subtotal: number
    tax_amount: number
    shipping_cost: number
    discount_amount: number
    customer_name: string
    customer_email: string | null
    customer_phone: string
    shipping_address: string
    shipping_city: string
    shipping_postal_code: string | null
    customer_notes: string | null
    created_at: string
}

type OrderItem = {
    id: string
    product_name: string
    variant_name: string | null
    unit_price: number
    quantity: number
    subtotal: number
    created_at: string
}

function formatIDR(value: number) {
    return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrdersPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [orders, setOrders] = useState<OrderRow[]>([])

    const [open, setOpen] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState<string>('')
    const [detail, setDetail] = useState<OrderDetail | null>(null)
    const [items, setItems] = useState<OrderItem[]>([])

    const [saving, setSaving] = useState(false)
    const [editStatus, setEditStatus] = useState<string>('')
    const [editPaymentStatus, setEditPaymentStatus] = useState<string>('')

    const fetchOrders = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/orders')
            const json = await res.json()

            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat orders')
                setOrders([])
                setLoading(false)
                return
            }

            setOrders(Array.isArray(json.orders) ? json.orders : [])
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat orders'
            setError(message)
            setOrders([])
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const paidCount = useMemo(
        () => orders.filter((o) => String(o.payment_status).toLowerCase() === 'paid').length,
        [orders]
    )

    const openDetail = async (orderId: string) => {
        setSelectedOrderId(orderId)
        setOpen(true)
        setDetailLoading(true)
        setDetailError('')
        setDetail(null)
        setItems([])

        try {
            const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`)
            const json = await res.json()

            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal memuat detail order')
            }

            setDetail(json.order)
            setItems(Array.isArray(json.items) ? json.items : [])
            setEditStatus(String(json.order?.status ?? 'pending'))
            setEditPaymentStatus(String(json.order?.payment_status ?? 'pending'))
            setDetailLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat detail order'
            setDetailError(message)
            setDetailLoading(false)
        }
    }

    const save = async () => {
        if (!selectedOrderId) return

        setSaving(true)
        try {
            const res = await fetch(`/api/admin/orders/${encodeURIComponent(selectedOrderId)}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: editStatus,
                        payment_status: editPaymentStatus,
                    }),
                }
            )
            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal update order')
            }

            const updated = json.order as { id: string; status: string; payment_status: string }

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === selectedOrderId
                        ? { ...o, status: updated.status ?? o.status, payment_status: updated.payment_status ?? o.payment_status }
                        : o
                )
            )
            setDetail((prev) =>
                prev
                    ? {
                        ...prev,
                        status: updated.status ?? prev.status,
                        payment_status: updated.payment_status ?? prev.payment_status,
                    }
                    : prev
            )

            toast.success('Order berhasil diupdate')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal update order'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Orders</h1>
                    <p className="text-[#8b775b]">Kelola pesanan: status order dan payment.</p>
                </div>
                <Button
                    onClick={fetchOrders}
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
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Total Orders</CardTitle>
                        <ShoppingBag className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(orders.length)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Paid: {loading ? '...' : String(paidCount)}</p>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="md:col-span-2 border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                        <CardContent className="py-6 text-sm text-red-600 font-semibold">{error}</CardContent>
                    </Card>
                )}
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Daftar Orders</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none">{loading ? '...' : `${orders.length} orders`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                    <th className="pb-4">No Order</th>
                                    <th className="pb-4">Customer</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Payment</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4 text-right">Action</th>
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

                                {!loading && orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-[#8b775b]">
                                            Belum ada pesanan.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    orders.map((o) => (
                                        <tr key={o.id} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4 font-bold text-sm">#{o.order_number}</td>
                                            <td className="py-4">
                                                <p className="text-sm font-bold">{o.customer_name}</p>
                                                <p className="text-xs text-[#8b775b]">{o.customer_phone}</p>
                                            </td>
                                            <td className="py-4">
                                                <Badge
                                                    className={cn(
                                                        'border-none',
                                                        String(o.status).toLowerCase() === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : String(o.status).toLowerCase() === 'cancelled'
                                                                ? 'bg-slate-100 text-slate-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                    )}
                                                >
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <Badge
                                                    className={cn(
                                                        'border-none',
                                                        String(o.payment_status).toLowerCase() === 'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    )}
                                                >
                                                    {o.payment_status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 font-bold text-sm text-primary">{formatIDR(o.total_amount)}</td>
                                            <td className="py-4 text-right">
                                                <Button
                                                    onClick={() => openDetail(o.id)}
                                                    variant="ghost"
                                                    className="text-[#8b775b] hover:text-primary"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Detail Order</DialogTitle>
                        <DialogDescription>Update status dan payment status secara manual.</DialogDescription>
                    </DialogHeader>

                    {detailLoading && <div className="py-6 text-sm text-[#8b775b]">Loading...</div>}
                    {detailError && <div className="py-6 text-sm text-red-600 font-semibold">{detailError}</div>}

                    {!detailLoading && !detailError && detail && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                    <p className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Order</p>
                                    <p className="font-black text-lg">#{detail.order_number}</p>
                                    <p className="text-xs text-[#8b775b] mt-1">{new Date(detail.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                    <p className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Customer</p>
                                    <p className="font-bold">{detail.customer_name}</p>
                                    <p className="text-xs text-[#8b775b]">{detail.customer_phone}</p>
                                    <p className="text-xs text-[#8b775b]">{detail.customer_email ?? '-'}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                <p className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Alamat</p>
                                <p className="text-sm font-semibold">{detail.shipping_address}</p>
                                <p className="text-sm text-[#8b775b]">{detail.shipping_city}{detail.shipping_postal_code ? `, ${detail.shipping_postal_code}` : ''}</p>
                                {detail.customer_notes && (
                                    <p className="text-sm text-[#8b775b] mt-2">Catatan: {detail.customer_notes}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Status Order</label>
                                    <Select value={editStatus} onValueChange={setEditStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Payment Status</label>
                                    <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAYMENT_STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4">
                                <p className="text-xs font-bold text-[#8b775b] uppercase tracking-wider mb-3">Items</p>
                                <div className="space-y-2">
                                    {items.length === 0 && <div className="text-sm text-[#8b775b]">Tidak ada item.</div>}
                                    {items.map((it) => (
                                        <div key={it.id} className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {it.product_name}
                                                    {it.variant_name ? ` (${it.variant_name})` : ''}
                                                </p>
                                                <p className="text-xs text-[#8b775b]">
                                                    {formatIDR(it.unit_price)} x {it.quantity}
                                                </p>
                                            </div>
                                            <div className="text-sm font-black text-primary">{formatIDR(it.subtotal)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8b775b]">Subtotal</span>
                                    <span className="font-bold">{formatIDR(detail.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8b775b]">Pajak</span>
                                    <span className="font-bold">{formatIDR(detail.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8b775b]">Shipping</span>
                                    <span className="font-bold">{formatIDR(detail.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#8b775b]">Diskon</span>
                                    <span className="font-bold">{formatIDR(detail.discount_amount)}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-base font-black">Total</span>
                                    <span className="text-base font-black text-primary">{formatIDR(detail.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Tutup
                        </Button>
                        <Button disabled={saving || !detail} onClick={save}>
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
