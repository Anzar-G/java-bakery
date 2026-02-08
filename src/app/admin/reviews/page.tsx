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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Check, Eye, RefreshCcw, Star, X } from 'lucide-react'

type ReviewRow = {
    id: string
    rating: number
    title: string | null
    comment: string | null
    is_verified_purchase: boolean
    is_approved: boolean
    created_at: string
    product?: { name: string; slug: string } | { name: string; slug: string }[] | null
}

function normalizeProduct(product: ReviewRow['product']) {
    if (!product) return null
    if (Array.isArray(product)) return product[0] ?? null
    return product
}

export default function AdminReviewsPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [reviews, setReviews] = useState<ReviewRow[]>([])

    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<ReviewRow | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchReviews = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/admin/reviews?status=${filter}`)
            const json = await res.json()
            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat reviews')
                setReviews([])
                setLoading(false)
                return
            }

            setReviews(Array.isArray(json.reviews) ? json.reviews : [])
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat reviews'
            setError(message)
            setReviews([])
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    const counts = useMemo(() => {
        let pending = 0
        let approved = 0
        for (const r of reviews) {
            if (r.is_approved) approved += 1
            else pending += 1
        }
        return { pending, approved }
    }, [reviews])

    const openDetail = (r: ReviewRow) => {
        setSelected(r)
        setOpen(true)
    }

    const setApproval = async (reviewId: string, approved: boolean) => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, is_approved: approved }),
            })
            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal update review')
            }

            setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, is_approved: approved } : r)))
            if (selected?.id === reviewId) {
                setSelected({ ...selected, is_approved: approved })
            }

            toast.success(approved ? 'Review di-approve' : 'Review disembunyikan')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal update review'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Reviews</h1>
                    <p className="text-[#8b775b]">Moderasi review: approve / sembunyikan.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="min-w-[160px]">
                        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={fetchReviews}
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
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#8b775b]">Showing</CardTitle>
                        <Badge className="bg-primary/10 text-primary border-none">{filter}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{loading ? '...' : String(reviews.length)}</div>
                        <p className="text-xs text-[#8b775b] mt-1">Pending: {loading ? '...' : String(counts.pending)} | Approved: {loading ? '...' : String(counts.approved)}</p>
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
                    <CardTitle className="text-lg font-bold">Daftar Review</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none">{loading ? '...' : `${reviews.length} items`}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#f1eee9] dark:border-[#3a342a] text-[#8b775b] text-xs font-bold uppercase tracking-wider">
                                    <th className="pb-4">Product</th>
                                    <th className="pb-4">Rating</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Created</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1eee9] dark:divide-[#3a342a]">
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-[#8b775b]">Loading...</td>
                                    </tr>
                                )}

                                {!loading && reviews.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-[#8b775b]">Belum ada review.</td>
                                    </tr>
                                )}

                                {!loading &&
                                    reviews.map((r) => {
                                        const p = normalizeProduct(r.product)
                                        return (
                                            <tr key={r.id} className="group hover:bg-primary/5 transition-all">
                                                <td className="py-4">
                                                    <p className="text-sm font-bold">{p?.name ?? '-'}</p>
                                                    <p className="text-xs text-[#8b775b]">{p?.slug ? `/products/${p.slug}` : ''}</p>
                                                </td>
                                                <td className="py-4">
                                                    <span className="inline-flex items-center gap-1 text-sm font-bold">
                                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                        {r.rating}/5
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <Badge
                                                        className={cn(
                                                            'border-none',
                                                            r.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                        )}
                                                    >
                                                        {r.is_approved ? 'Approved' : 'Pending'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-sm text-[#8b775b]">
                                                    {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            onClick={() => openDetail(r)}
                                                            variant="ghost"
                                                            className="text-[#8b775b] hover:text-primary"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </Button>
                                                        <Button
                                                            disabled={saving}
                                                            onClick={() => setApproval(r.id, !r.is_approved)}
                                                            variant={r.is_approved ? 'outline' : 'default'}
                                                            className={cn(
                                                                r.is_approved
                                                                    ? 'border-primary/20 text-primary hover:bg-primary/10'
                                                                    : ''
                                                            )}
                                                        >
                                                            {r.is_approved ? (
                                                                <>
                                                                    <X className="w-4 h-4" />
                                                                    Hide
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="w-4 h-4" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>Detail Review</DialogTitle>
                        <DialogDescription>Approve untuk menampilkan review di halaman customer.</DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">{normalizeProduct(selected.product)?.name ?? '-'}</p>
                                    <p className="text-xs text-[#8b775b]">Rating: {selected.rating}/5</p>
                                </div>
                                <Badge
                                    className={cn(
                                        'border-none',
                                        selected.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    )}
                                >
                                    {selected.is_approved ? 'Approved' : 'Pending'}
                                </Badge>
                            </div>

                            <div className="rounded-xl border border-[#f1eee9] dark:border-[#3a342a] p-4 bg-white/50 dark:bg-white/5">
                                <p className="text-sm font-bold">{selected.title || 'Judul tidak diisi'}</p>
                                <p className="text-sm text-[#8b775b] mt-2 leading-relaxed">{selected.comment || '-'}</p>
                            </div>

                            <div className="text-xs text-[#8b775b]">
                                Verified purchase: {selected.is_verified_purchase ? 'yes' : 'no'}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Tutup
                        </Button>
                        {selected && (
                            <Button disabled={saving} onClick={() => setApproval(selected.id, !selected.is_approved)}>
                                {selected.is_approved ? 'Hide' : 'Approve'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
