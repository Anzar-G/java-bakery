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
import { Package, Pencil, RefreshCcw, Plus, Trash2, Save as SaveIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminProduct = {
    id: string
    name: string
    slug: string
    category_id?: string
    featured_image?: string | null
    base_price: number
    is_active: boolean
    is_pre_order: boolean
    pre_order_days: number | null
    shipping_local_only: boolean
    category?: { id: string; name: string } | { id: string; name: string }[] | null
    created_at: string
}

type AdminCategory = {
    id: string
    name: string
    slug: string
    is_active: boolean
    display_order: number
}

type AdminVariant = {
    id: string
    product_id: string
    name: string
    price_adjustment: number | null
    is_active: boolean | null
    display_order: number | null
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

    const [categories, setCategories] = useState<AdminCategory[]>([])

    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selected, setSelected] = useState<AdminProduct | null>(null)

    const [editName, setEditName] = useState('')
    const [editCategoryId, setEditCategoryId] = useState('')
    const [editFeaturedImage, setEditFeaturedImage] = useState('')
    const [editUploading, setEditUploading] = useState(false)

    const [openCreate, setOpenCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createSlug, setCreateSlug] = useState('')
    const [createCategoryId, setCreateCategoryId] = useState('')
    const [createBasePrice, setCreateBasePrice] = useState('')
    const [createFeaturedImage, setCreateFeaturedImage] = useState('')
    const [createIsActive, setCreateIsActive] = useState<'true' | 'false'>('true')
    const [createIsPreOrder, setCreateIsPreOrder] = useState<'true' | 'false'>('false')
    const [createPreOrderDays, setCreatePreOrderDays] = useState('')
    const [createShippingLocalOnly, setCreateShippingLocalOnly] = useState<'true' | 'false'>('true')

    const [basePrice, setBasePrice] = useState('')
    const [isActive, setIsActive] = useState<'true' | 'false'>('true')
    const [isPreOrder, setIsPreOrder] = useState<'true' | 'false'>('false')
    const [preOrderDays, setPreOrderDays] = useState('')
    const [shippingLocalOnly, setShippingLocalOnly] = useState<'true' | 'false'>('true')

    const [variantsLoading, setVariantsLoading] = useState(false)
    const [variants, setVariants] = useState<AdminVariant[]>([])
    const [variantDrafts, setVariantDrafts] = useState<
        Record<string, { name: string; price_adjustment: string; is_active: 'true' | 'false'; display_order: string }>
    >({})
    const [newVariant, setNewVariant] = useState({
        name: '',
        price_adjustment: '0',
        is_active: 'true' as 'true' | 'false',
        display_order: '0',
    })

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

    const deleteProduct = async () => {
        if (!selected) return
        const ok = confirm(`Hapus produk "${selected.name}"?`)
        if (!ok) return

        try {
            const res = await fetch(`/api/admin/products?id=${encodeURIComponent(selected.id)}`, { method: 'DELETE' })
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menghapus produk')
            }

            setProducts((prev) => prev.filter((p) => p.id !== selected.id))
            setSelected(null)
            setOpen(false)
            toast.success('Produk berhasil dihapus')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menghapus produk'
            toast.error(message)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories')
            const json = await res.json()
            if (!res.ok || !json?.success) {
                return
            }
            setCategories(Array.isArray(json.categories) ? json.categories : [])
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const activeCount = useMemo(() => products.filter((p) => p.is_active).length, [products])

    const openEdit = (p: AdminProduct) => {
        setSelected(p)
        setEditName(String(p.name ?? ''))
        setEditCategoryId(String((p as any).category_id ?? ''))
        setEditFeaturedImage(String((p as any).featured_image ?? ''))
        setBasePrice(String(p.base_price ?? 0))
        setIsActive(p.is_active ? 'true' : 'false')
        setIsPreOrder(p.is_pre_order ? 'true' : 'false')
        setPreOrderDays(p.pre_order_days === null || p.pre_order_days === undefined ? '' : String(p.pre_order_days))
        setShippingLocalOnly(p.shipping_local_only ? 'true' : 'false')
        setVariants([])
        setVariantDrafts({})
        setNewVariant({ name: '', price_adjustment: '0', is_active: 'true', display_order: '0' })
        setOpen(true)
    }

    const fetchVariants = async (productId: string) => {
        setVariantsLoading(true)
        try {
            const res = await fetch(`/api/admin/product-variants?productId=${encodeURIComponent(productId)}`)
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal memuat varian')
            }

            const list = (Array.isArray(json.variants) ? json.variants : []) as AdminVariant[]
            setVariants(list)

            const drafts: Record<string, { name: string; price_adjustment: string; is_active: 'true' | 'false'; display_order: string }> = {}
            for (const v of list) {
                drafts[v.id] = {
                    name: String(v.name ?? ''),
                    price_adjustment: String(v.price_adjustment ?? 0),
                    is_active: (v.is_active === false ? 'false' : 'true') as 'true' | 'false',
                    display_order: String(v.display_order ?? 0),
                }
            }
            setVariantDrafts(drafts)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat varian'
            toast.error(message)
            setVariants([])
            setVariantDrafts({})
        } finally {
            setVariantsLoading(false)
        }
    }

    useEffect(() => {
        if (!open) return
        if (!selected?.id) return
        fetchVariants(selected.id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, selected?.id])

    const addVariant = async () => {
        if (!selected) return
        const name = newVariant.name.trim()
        if (!name) {
            toast.error('Nama varian wajib diisi')
            return
        }
        const adj = Number(newVariant.price_adjustment)
        if (!Number.isFinite(adj)) {
            toast.error('Price adjustment tidak valid')
            return
        }
        const order = Number(newVariant.display_order)
        if (!Number.isFinite(order)) {
            toast.error('Display order tidak valid')
            return
        }

        try {
            const res = await fetch('/api/admin/product-variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selected.id,
                    name,
                    price_adjustment: adj,
                    is_active: newVariant.is_active === 'true',
                    display_order: order,
                }),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menambah varian')
            }

            const v = json.variant as AdminVariant
            setVariants((prev) => [...prev, v].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)))
            setVariantDrafts((prev) => ({
                ...prev,
                [v.id]: {
                    name: String(v.name ?? ''),
                    price_adjustment: String(v.price_adjustment ?? 0),
                    is_active: (v.is_active === false ? 'false' : 'true') as 'true' | 'false',
                    display_order: String(v.display_order ?? 0),
                },
            }))
            setNewVariant({ name: '', price_adjustment: '0', is_active: 'true', display_order: '0' })
            toast.success('Varian berhasil ditambahkan')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menambah varian'
            toast.error(message)
        }
    }

    const saveVariant = async (id: string) => {
        const draft = variantDrafts[id]
        if (!draft) return

        const name = draft.name.trim()
        if (!name) {
            toast.error('Nama varian wajib diisi')
            return
        }

        const adj = Number(draft.price_adjustment)
        if (!Number.isFinite(adj)) {
            toast.error('Price adjustment tidak valid')
            return
        }

        const order = Number(draft.display_order)
        if (!Number.isFinite(order)) {
            toast.error('Display order tidak valid')
            return
        }

        try {
            const res = await fetch('/api/admin/product-variants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    name,
                    price_adjustment: adj,
                    is_active: draft.is_active === 'true',
                    display_order: order,
                }),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menyimpan varian')
            }

            const updated = json.variant as AdminVariant
            setVariants((prev) =>
                prev
                    .map((v) => (v.id === updated.id ? { ...v, ...updated } : v))
                    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            )
            toast.success('Varian berhasil disimpan')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menyimpan varian'
            toast.error(message)
        }
    }

    const deleteVariant = async (id: string) => {
        if (!confirm('Hapus varian ini?')) return
        try {
            const res = await fetch(`/api/admin/product-variants?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menghapus varian')
            }

            setVariants((prev) => prev.filter((v) => v.id !== id))
            setVariantDrafts((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
            })
            toast.success('Varian berhasil dihapus')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menghapus varian'
            toast.error(message)
        }
    }

    const uploadFeaturedImage = async (file: File) => {
        if (!selected) return
        setEditUploading(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('productId', selected.id)

            const res = await fetch('/api/admin/uploads/product-image', {
                method: 'POST',
                body: form,
            })

            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal upload gambar')
            }

            const url = String(json.url ?? '')
            setEditFeaturedImage(url)

            if (url) {
                const patchRes = await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selected.id,
                        featured_image: url,
                    }),
                })

                const patchJson = await patchRes.json()
                if (!patchRes.ok || !patchJson?.success) {
                    throw new Error(patchJson?.error ?? 'Gagal menyimpan gambar')
                }

                const updated = patchJson.product as AdminProduct
                setSelected((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
                setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
            }
            toast.success('Gambar berhasil diupload')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal upload gambar'
            toast.error(message)
        } finally {
            setEditUploading(false)
        }
    }

    const openAdd = () => {
        setCreateName('')
        setCreateSlug('')
        setCreateCategoryId(categories.find((c) => c.is_active)?.id ?? '')
        setCreateBasePrice('')
        setCreateFeaturedImage('')
        setCreateIsActive('true')
        setCreateIsPreOrder('false')
        setCreatePreOrderDays('')
        setCreateShippingLocalOnly('true')
        setOpenCreate(true)
    }

    const createProduct = async () => {
        const name = createName.trim()
        if (!name) {
            toast.error('Nama produk wajib diisi')
            return
        }
        if (!createCategoryId) {
            toast.error('Kategori wajib dipilih')
            return
        }

        const basePrice = Number(createBasePrice)
        if (!Number.isFinite(basePrice) || basePrice < 0) {
            toast.error('Harga tidak valid')
            return
        }

        const preOrderDaysValue = createPreOrderDays.trim() === '' ? null : Number(createPreOrderDays)
        if (
            createPreOrderDays.trim() !== '' &&
            (!Number.isFinite(preOrderDaysValue) || Number(preOrderDaysValue) < 0)
        ) {
            toast.error('Hari pre-order tidak valid')
            return
        }

        setCreating(true)
        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    slug: createSlug.trim() || undefined,
                    category_id: createCategoryId,
                    base_price: basePrice,
                    featured_image: createFeaturedImage.trim() || null,
                    is_active: createIsActive === 'true',
                    is_pre_order: createIsPreOrder === 'true',
                    pre_order_days: preOrderDaysValue,
                    shipping_local_only: createShippingLocalOnly === 'true',
                }),
            })

            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal membuat produk')
            }

            const created = json.product as AdminProduct
            setProducts((prev) => [created, ...prev])
            toast.success('Produk berhasil dibuat')
            setOpenCreate(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal membuat produk'
            toast.error(message)
        } finally {
            setCreating(false)
        }
    }

    const save = async () => {
        if (!selected) return

        const nextName = editName.trim()
        if (!nextName) {
            toast.error('Nama produk wajib diisi')
            return
        }

        if (!editCategoryId.trim()) {
            toast.error('Kategori wajib dipilih')
            return
        }

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
                    name: nextName,
                    category_id: editCategoryId.trim(),
                    featured_image: editFeaturedImage.trim() || null,
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
                    <Button onClick={openAdd} className="bg-primary text-white hover:bg-primary/90">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
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
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Edit Produk</DialogTitle>
                    <DialogDescription>
                        Update harga dan atribut pre-order. Perubahan langsung mempengaruhi katalog.
                    </DialogDescription>
                </DialogHeader>

                    {selected && (
                        <div className="space-y-4 overflow-y-auto pr-1">
                            <div>
                                <p className="text-sm font-bold">{selected.name}</p>
                                <p className="text-xs text-[#8b775b]">/{selected.slug}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama Produk</label>
                                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kategori</label>
                                    <Select value={editCategoryId} onValueChange={(v) => setEditCategoryId(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Featured Image</label>
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            value={editFeaturedImage}
                                            onChange={(e) => setEditFeaturedImage(e.target.value)}
                                            placeholder="Auto terisi setelah upload (atau isi URL manual)"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) uploadFeaturedImage(file)
                                            }}
                                            disabled={editUploading}
                                        />
                                        {editFeaturedImage.trim() && (
                                            <img
                                                src={editFeaturedImage}
                                                alt="featured"
                                                className="w-full max-h-56 object-cover rounded-xl border border-[#f1eee9] dark:border-[#3a342a]"
                                            />
                                        )}
                                    </div>
                                </div>

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

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-bold">Variants</div>
                                        <div className="text-xs text-[#8b775b]">Tambah/kurangi pilihan di halaman produk.</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => selected?.id && fetchVariants(selected.id)}
                                        disabled={variantsLoading}
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Refresh
                                    </Button>
                                </div>

                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8b775b] bg-[#fbfaf9] dark:bg-[#1e1a14]">
                                        <div className="col-span-5">Nama</div>
                                        <div className="col-span-3">Adj Harga</div>
                                        <div className="col-span-2">Order</div>
                                        <div className="col-span-2 text-right">Action</div>
                                    </div>

                                    {variantsLoading && (
                                        <div className="px-3 py-3 text-sm text-[#8b775b]">Loading...</div>
                                    )}

                                    {!variantsLoading && variants.length === 0 && (
                                        <div className="px-3 py-3 text-sm text-[#8b775b]">Belum ada varian.</div>
                                    )}

                                    {!variantsLoading &&
                                        variants.map((v) => {
                                            const draft = variantDrafts[v.id]
                                            if (!draft) return null
                                            return (
                                                <div key={v.id} className="grid grid-cols-12 gap-2 px-3 py-3 border-t border-[#f1eee9] dark:border-[#3a342a] items-center">
                                                    <div className="col-span-5 space-y-2">
                                                        <Input
                                                            value={draft.name}
                                                            onChange={(e) =>
                                                                setVariantDrafts((p) => ({
                                                                    ...p,
                                                                    [v.id]: { ...p[v.id], name: e.target.value },
                                                                }))
                                                            }
                                                        />
                                                        <Select
                                                            value={draft.is_active}
                                                            onValueChange={(next) =>
                                                                setVariantDrafts((p) => ({
                                                                    ...p,
                                                                    [v.id]: { ...p[v.id], is_active: next as any },
                                                                }))
                                                            }
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="true">Active</SelectItem>
                                                                <SelectItem value="false">Inactive</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Input
                                                            type="number"
                                                            value={draft.price_adjustment}
                                                            onChange={(e) =>
                                                                setVariantDrafts((p) => ({
                                                                    ...p,
                                                                    [v.id]: { ...p[v.id], price_adjustment: e.target.value },
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            type="number"
                                                            value={draft.display_order}
                                                            onChange={(e) =>
                                                                setVariantDrafts((p) => ({
                                                                    ...p,
                                                                    [v.id]: { ...p[v.id], display_order: e.target.value },
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex justify-end gap-2">
                                                        <Button type="button" variant="outline" onClick={() => saveVariant(v.id)}>
                                                            <SaveIcon className="w-4 h-4" />
                                                            Save
                                                        </Button>
                                                        <Button type="button" variant="ghost" onClick={() => deleteVariant(v.id)} className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>

                                <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-3 space-y-3">
                                    <div className="text-sm font-bold">Tambah Variant</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama</label>
                                            <Input value={newVariant.name} onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))} placeholder="250gr" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Adj Harga</label>
                                            <Input type="number" value={newVariant.price_adjustment} onChange={(e) => setNewVariant((p) => ({ ...p, price_adjustment: e.target.value }))} placeholder="0" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Active</label>
                                            <Select value={newVariant.is_active} onValueChange={(v) => setNewVariant((p) => ({ ...p, is_active: v as any }))}>
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
                                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Order</label>
                                            <Input type="number" value={newVariant.display_order} onChange={(e) => setNewVariant((p) => ({ ...p, display_order: e.target.value }))} placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="button" onClick={addVariant}>
                                            <Plus className="w-4 h-4" />
                                            Tambah
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={deleteProduct}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus Produk
                            </Button>

                            <div className="flex items-center justify-end gap-3">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Batal
                                </Button>
                                <Button disabled={saving} onClick={save}>
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Produk</DialogTitle>
                        <DialogDescription>
                            Buat produk baru. Kamu bisa edit detail lain setelah produk dibuat.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama Produk</label>
                                <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Contoh: Donat Coklat" />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Slug (opsional)</label>
                                <Input value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="contoh: donat-coklat" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Kategori</label>
                                <Select value={createCategoryId} onValueChange={(v) => setCreateCategoryId(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Harga Dasar</label>
                                <Input type="number" value={createBasePrice} onChange={(e) => setCreateBasePrice(e.target.value)} />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Featured Image URL (opsional)</label>
                                <Input value={createFeaturedImage} onChange={(e) => setCreateFeaturedImage(e.target.value)} placeholder="https://..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Active</label>
                                <Select value={createIsActive} onValueChange={(v) => setCreateIsActive(v as any)}>
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
                                <Select value={createIsPreOrder} onValueChange={(v) => setCreateIsPreOrder(v as any)}>
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
                                <Input type="number" value={createPreOrderDays} onChange={(e) => setCreatePreOrderDays(e.target.value)} placeholder="Kosongkan jika tidak perlu" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Shipping</label>
                                <Select value={createShippingLocalOnly} onValueChange={(v) => setCreateShippingLocalOnly(v as any)}>
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

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreate(false)}>
                            Batal
                        </Button>
                        <Button disabled={creating} onClick={createProduct}>
                            {creating ? 'Membuat...' : 'Buat Produk'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
