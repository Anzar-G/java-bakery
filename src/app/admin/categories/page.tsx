'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Grid3X3, RefreshCcw, Save } from 'lucide-react'

type AdminCategory = {
    id: string
    name: string
    slug: string
    image_url: string | null
    is_active: boolean
    display_order: number
}

export default function AdminCategoriesPage() {
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [error, setError] = useState<string>('')

    const [uploadingId, setUploadingId] = useState<string | null>(null)

    const [categories, setCategories] = useState<AdminCategory[]>([])
    const [drafts, setDrafts] = useState<Record<string, { name: string; slug: string; image_url: string; is_active: 'true' | 'false'; display_order: string }>>(
        {}
    )

    const uploadCategoryImage = async (categoryId: string, file: File) => {
        setUploadingId(categoryId)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('scope', 'category')
            form.append('categoryId', categoryId)

            const res = await fetch('/api/admin/uploads/site-image', {
                method: 'POST',
                body: form,
            })

            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal upload gambar')
            }

            const url = String(json.url ?? '').trim()
            if (!url) throw new Error('URL upload kosong')

            setDrafts((p) => ({
                ...p,
                [categoryId]: { ...p[categoryId], image_url: url },
            }))
            toast.success('Gambar kategori berhasil diupload')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal upload gambar'
            toast.error(message)
        } finally {
            setUploadingId(null)
        }
    }

    const fetchCategories = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/categories')
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat categories')
                setCategories([])
                setDrafts({})
                setLoading(false)
                return
            }

            const list = (Array.isArray(json.categories) ? json.categories : []) as AdminCategory[]
            setCategories(list)

            const nextDrafts: Record<
                string,
                { name: string; slug: string; image_url: string; is_active: 'true' | 'false'; display_order: string }
            > = {}
            for (const c of list) {
                nextDrafts[c.id] = {
                    name: String(c.name ?? ''),
                    slug: String(c.slug ?? ''),
                    image_url: String(c.image_url ?? ''),
                    is_active: (c.is_active ? 'true' : 'false') as 'true' | 'false',
                    display_order: String(c.display_order ?? 0),
                }
            }
            setDrafts(nextDrafts)
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat categories'
            setError(message)
            setCategories([])
            setDrafts({})
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const activeCount = useMemo(() => categories.filter((c) => c.is_active).length, [categories])

    const saveCategory = async (id: string) => {
        const draft = drafts[id]
        if (!draft) return

        const name = draft.name.trim()
        const slug = draft.slug.trim()
        if (!name) {
            toast.error('Nama kategori wajib diisi')
            return
        }
        if (!slug) {
            toast.error('Slug kategori wajib diisi')
            return
        }

        const order = Number(draft.display_order)
        if (!Number.isFinite(order)) {
            toast.error('Display order tidak valid')
            return
        }

        setSavingId(id)
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    name,
                    slug,
                    image_url: draft.image_url.trim() || null,
                    is_active: draft.is_active === 'true',
                    display_order: order,
                }),
            })

            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menyimpan kategori')
            }

            const updated = json.category as AdminCategory
            setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
            toast.success('Kategori berhasil disimpan')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menyimpan kategori'
            toast.error(message)
        } finally {
            setSavingId(null)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Categories</h1>
                    <p className="text-[#8b775b]">Kelola kategori dan gambar yang tampil di homepage.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchCategories}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        disabled={loading || Boolean(savingId)}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Total Categories</CardTitle>
                        <Grid3X3 className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(categories.length)}</div>
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
                    <CardTitle className="text-lg font-bold">Daftar Categories</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none">{loading ? '...' : `${categories.length} items`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                    <th className="pb-4">Name</th>
                                    <th className="pb-4">Slug</th>
                                    <th className="pb-4">Image URL</th>
                                    <th className="pb-4">Order</th>
                                    <th className="pb-4">Status</th>
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

                                {!loading && categories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-[#8b775b]">
                                            Belum ada kategori.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    categories.map((c) => {
                                        const draft = drafts[c.id]
                                        if (!draft) return null

                                        return (
                                            <tr key={c.id} className="group hover:bg-primary/5 transition-all align-top">
                                                <td className="py-4">
                                                    <Input
                                                        value={draft.name}
                                                        onChange={(e) =>
                                                            setDrafts((p) => ({
                                                                ...p,
                                                                [c.id]: { ...p[c.id], name: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <Input
                                                        value={draft.slug}
                                                        onChange={(e) =>
                                                            setDrafts((p) => ({
                                                                ...p,
                                                                [c.id]: { ...p[c.id], slug: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={draft.image_url}
                                                            onChange={(e) =>
                                                                setDrafts((p) => ({
                                                                    ...p,
                                                                    [c.id]: { ...p[c.id], image_url: e.target.value },
                                                                }))
                                                            }
                                                            placeholder="https://..."
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) uploadCategoryImage(c.id, file)
                                                            }}
                                                            disabled={Boolean(uploadingId) || Boolean(savingId) || loading}
                                                        />
                                                        {draft.image_url.trim() && (
                                                            <img
                                                                src={draft.image_url.trim()}
                                                                alt={draft.name}
                                                                className="w-24 h-24 object-cover rounded-xl border border-[#f1eee9] dark:border-[#3a342a]"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <Input
                                                        type="number"
                                                        value={draft.display_order}
                                                        onChange={(e) =>
                                                            setDrafts((p) => ({
                                                                ...p,
                                                                [c.id]: { ...p[c.id], display_order: e.target.value },
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <Badge
                                                        className={cn(
                                                            'border-none',
                                                            draft.is_active === 'true'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-slate-100 text-slate-700'
                                                        )}
                                                    >
                                                        {draft.is_active === 'true' ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <div className="mt-2">
                                                        <select
                                                            value={draft.is_active}
                                                            onChange={(e) =>
                                                                setDrafts((p) => ({
                                                                    ...p,
                                                                    [c.id]: { ...p[c.id], is_active: e.target.value as any },
                                                                }))
                                                            }
                                                            className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark px-3 text-sm"
                                                        >
                                                            <option value="true">Active</option>
                                                            <option value="false">Inactive</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button
                                                        onClick={() => saveCategory(c.id)}
                                                        disabled={Boolean(savingId) || loading}
                                                        className="bg-primary text-white hover:bg-primary/90"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {savingId === c.id ? 'Menyimpan...' : 'Save'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
