import React, { Suspense } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import ReviewsSubmitClient from './ReviewsSubmitClient'

type ReviewRow = {
    id: string
    rating: number
    title: string | null
    comment: string | null
    created_at: string
    product: { name: string; slug: string } | { name: string; slug: string }[] | null
}

const NAME_PREFIX = '__name__:'

function supabaseServer() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
        throw new Error('Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).')
    }

    return createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
}

function normalizeProduct(product: ReviewRow['product']) {
    if (!product) return null
    if (Array.isArray(product)) return product[0] ?? null
    return product
}

export default async function ReviewsPage() {
    const supabase = supabaseServer()

    const { data: productsData } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200)

    const { data } = await supabase
        .from('reviews')
        .select('id, rating, title, comment, created_at, product:products!reviews_product_id_fkey(name, slug)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(12)

    const reviews = (Array.isArray(data) ? (data as any) : []) as ReviewRow[]
    const products = (Array.isArray(productsData) ? (productsData as any) : []) as { id: string; name: string }[]

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none">Social Proof</Badge>
                <h1 className="text-4xl font-black">Reviews</h1>
                <p className="text-[#8b775b]">Ulasan pelanggan yang sudah kami approve.</p>
            </div>

            <Suspense>
                <ReviewsSubmitClient products={products} />
            </Suspense>

            {reviews.length === 0 ? (
                <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                    <CardContent className="py-10 text-center text-sm text-[#8b775b]">
                        Belum ada review yang tampil.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((r) => {
                        const p = normalizeProduct(r.product)
                        const rawComment = String(r.comment ?? '')
                        let reviewerName = ''
                        let cleanedComment = rawComment
                        if (rawComment.startsWith(NAME_PREFIX)) {
                            const newlineIdx = rawComment.indexOf('\n')
                            if (newlineIdx > -1) {
                                reviewerName = rawComment.slice(NAME_PREFIX.length, newlineIdx).trim()
                                cleanedComment = rawComment.slice(newlineIdx + 1)
                            } else {
                                reviewerName = rawComment.slice(NAME_PREFIX.length).trim()
                                cleanedComment = ''
                            }
                        }
                        return (
                            <Card key={r.id} className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">
                                        {r.title || 'Review'}
                                    </CardTitle>
                                    <div className="text-xs text-[#8b775b]">
                                        Rating: {r.rating}/5
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {reviewerName && <div className="text-xs font-bold text-[#8b775b]">{reviewerName}</div>}
                                    <p className="text-sm text-[#8b775b] leading-relaxed">{cleanedComment || '-'}</p>
                                    {p?.slug && (
                                        <Link className="text-primary font-bold text-sm hover:underline" href={`/products/${encodeURIComponent(p.slug)}`}>
                                            Lihat produk: {p.name}
                                        </Link>
                                    )}
                                    <div className="text-xs text-[#8b775b]">
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : ''}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
