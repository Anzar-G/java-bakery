'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Package, Pencil, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminProduct = {
    id: string
    name: string
    slug: string
    base_price: number
    is_active: boolean
    is_pre_order: boolean
    pre_order_days: number | null
    shipping_local_only: boolean
    category?: { name: string } | { name: string }[] | null
    created_at: string
}

function getCategoryName(category: AdminProduct['category']) {
    if (!category) return '-'
    if (Array.isArray(category)) return category[0]?.name ?? '-'
    return category.name ?? '-'
}

function formatIDR(value: number) {
    return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}

export default function AdminProductsPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [products, setProducts] = useState<AdminProduct[]>([])

    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selected, setSelected] = useState<AdminProduct | null>(null)

    const [basePrice, setBasePrice] = useState('')
    const [isActive, setIsActive] = useState<'true' | 'false'>('true')
    const [isPreOrder, setIsPreOrder] = useState<'true' | 'false'>('false')
    const [preOrderDays, setPreOrderDays] = useState('')
    const [shippingLocalOnly, setShippingLocalOnly] = useState<'true' | 'false'>('true')

    const fetchProducts = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/products')
            const json = await res.json()

            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat produk')
                setProducts([])
                setLoading(false)
                return
            }

            setProducts(Array.isArray(json.products) ? json.products : [])
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat produk'
            setError(message)
            setProducts([])
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const activeCount = useMemo(() => products.filter((p) => p.is_active).length, [products])

    const openEdit = (p: AdminProduct) => {
        setSelected(p)
        setBasePrice(String(p.base_price ?? 0))
        setIsActive(p.is_active ? 'true' : 'false')
        setIsPreOrder(p.is_pre_order ? 'true' : 'false')
        setPreOrderDays(p.pre_order_days === null || p.pre_order_days === undefined ? '' : String(p.pre_order_days))
        setShippingLocalOnly(p.shipping_local_only ? 'true' : 'false')
        setOpen(true)
    }

    const save = async () => {
        if (!selected) return

        const nextBasePrice = Number(basePrice)
        if (!Number.isFinite(nextBasePrice) || nextBasePrice < 0) {
            toast.error('Harga tidak valid')
            return
        }

        const nextPreOrderDays = preOrderDays.trim() === '' ? null : Number(preOrderDays)
        if (preOrderDays.trim() !== '' && (!Number.isFinite(nextPreOrderDays) || Number(nextPreOrderDays) < 0)) {
            toast.error('Hari pre-order tidak valid')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/admin/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selected.id,
                    base_price: nextBasePrice,
                    is_active: isActive === 'true',
                    is_pre_order: isPreOrder === 'true',
                    pre_order_days: nextPreOrderDays,
                    shipping_local_only: shippingLocalOnly === 'true',
                }),
            })

            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menyimpan produk')
            }

            const updated = json.product as AdminProduct
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
            toast.success('Produk berhasil diupdate')
            setOpen(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menyimpan produk'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Products</h1>
                    <p className="text-[#8b775b]">Kelola katalog produk Bakery Umi.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchProducts}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Total Produk</CardTitle>
                        <Package className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(products.length)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Active: {loading ? '...' : String(activeCount)}</p>
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
                    <CardTitle className="text-lg font-bold">Daftar Produk</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none">{loading ? '...' : `${products.length} items`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                    <th className="pb-4">Produk</th>
                                    <th className="pb-4">Kategori</th>
                                    <th className="pb-4">Harga</th>
                                    <th className="pb-4">Status</th>
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

                                {!loading && products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-[#8b775b]">
                                            Belum ada produk.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    products.map((p) => (
                                        <tr key={p.id} className="group hover:bg-primary/5 transition-all">
                                            <td className="py-4">
                                                <p className="text-sm font-bold">{p.name}</p>
                                                <p className="text-xs text-[#8b775b]">/{p.slug}</p>
                                            </td>
                                            <td className="py-4 text-sm">{getCategoryName(p.category)}</td>
                                            <td className="py-4 text-sm font-bold text-primary">{formatIDR(p.base_price)}</td>
                                            <td className="py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge className={cn('border-none', p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700')}>
                                                        {p.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <Badge className={cn('border-none', p.is_pre_order ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                                                        {p.is_pre_order ? 'Pre-order' : 'Ready'}
                                                    </Badge>
                                                    <Badge className={cn('border-none', p.shipping_local_only ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700')}>
                                                        {p.shipping_local_only ? 'Local' : 'All city'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <Button
                                                    onClick={() => openEdit(p)}
                                                    variant="ghost"
                                                    className="text-[#8b775b] hover:text-primary"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Edit
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
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit Produk</DialogTitle>
                        <DialogDescription>
                            Update harga dan atribut pre-order. Perubahan langsung mempengaruhi katalog.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold">{selected.name}</p>
                                <p className="text-xs text-[#8b775b]">/{selected.slug}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Harga Dasar</label>
                                    <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Active</label>
                                    <Select value={isActive} onValueChange={(v) => setIsActive(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Pre-order</label>
                                    <Select value={isPreOrder} onValueChange={(v) => setIsPreOrder(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Pre-order</SelectItem>
                                            <SelectItem value="false">Ready</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Pre-order Days</label>
                                    <Input type="number" value={preOrderDays} onChange={(e) => setPreOrderDays(e.target.value)} placeholder="Kosongkan jika tidak perlu" />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Shipping</label>
                                    <Select value={shippingLocalOnly} onValueChange={(v) => setShippingLocalOnly(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Local only</SelectItem>
                                            <SelectItem value="false">All city</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button disabled={saving} onClick={save}>
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
