'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function ReviewsSubmitClient(props: { products: { id: string; name: string }[] }) {
    const NONE = '__none__'
    const [open, setOpen] = useState(false)
    const [productId, setProductId] = useState<string>(NONE)
    const [customerName, setCustomerName] = useState('')
    const [rating, setRating] = useState<string>('5')
    const [title, setTitle] = useState('')
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const products = useMemo(() => props.products ?? [], [props.products])

    const submit = async () => {
        const ratingValue = Number(rating)
        if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            toast.error('Rating harus 1-5')
            return
        }

        if (customerName.trim() === '') {
            toast.error('Nama wajib diisi')
            return
        }

        if (title.trim() === '' && comment.trim() === '') {
            toast.error('Judul atau komentar wajib diisi')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId === NONE ? null : productId,
                    customer_name: customerName.trim(),
                    rating: ratingValue,
                    title: title.trim() || null,
                    comment: comment.trim() || null,
                }),
            })

            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal mengirim review')
            }

            setProductId(NONE)
            setCustomerName('')
            setRating('5')
            setTitle('')
            setComment('')
            toast.success('Review terkirim! Akan tampil setelah admin approve.')
            setOpen(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal mengirim review'
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold">Mau kasih review?</CardTitle>
                    <Button onClick={() => setOpen(true)} className="bg-primary text-white hover:bg-primary/90">
                        Tulis Review
                    </Button>
                </CardHeader>
                <CardContent className="text-sm text-[#8b775b]">
                    Review kamu akan tampil setelah admin approve.
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                        fixed right-0 top-0 h-[100dvh] w-[88vw] max-w-[420px]
                        left-auto
                        translate-x-0 translate-y-0 rounded-l-2xl rounded-r-none
                        border-l border-slate-200 dark:border-slate-800
                        p-0
                        flex flex-col gap-0 overflow-hidden
                    "
                >
                    <DialogHeader>
                        <div className="p-6 pb-4 pt-10 pr-12">
                            <DialogTitle>Tulis Review</DialogTitle>
                            <DialogDescription>Isi form berikut. Review akan masuk antrian approval.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 p-6 pt-0 flex-1 overflow-y-auto">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Nama</label>
                            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama kamu" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Produk (opsional)</label>
                            <Select value={productId} onValueChange={setProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih produk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Tanpa produk</SelectItem>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Rating</label>
                            <Select value={rating} onValueChange={setRating}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Judul (opsional)</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Enak banget!" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Komentar (opsional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1a14] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ceritain pengalaman kamu..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button disabled={submitting} onClick={submit} className="bg-primary text-white hover:bg-primary/90">
                            {submitting ? 'Mengirim...' : 'Kirim Review'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
