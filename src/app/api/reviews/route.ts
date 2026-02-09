import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type CreateReviewBody = {
    product_id?: string | null
    customer_name?: string | null
    rating: number
    title?: string | null
    comment?: string | null
}

const NAME_PREFIX = '__name__:'

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ success: false, error: 'Missing SUPABASE env vars.' }, { status: 500 })
        }

        const body = (await request.json()) as CreateReviewBody

        const rating = Number(body?.rating)
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, error: 'Invalid rating. Must be 1-5.' }, { status: 400 })
        }

        const productId = body?.product_id ? String(body.product_id).trim() : null
        const customerName = String(body?.customer_name ?? '').trim()
        const title = body?.title === undefined ? null : (body.title ?? null)
        const comment = body?.comment === undefined ? null : (body.comment ?? null)

        if (!customerName) {
            return NextResponse.json({ success: false, error: 'Nama wajib diisi.' }, { status: 400 })
        }

        if ((title === null || String(title).trim() === '') && (comment === null || String(comment).trim() === '')) {
            return NextResponse.json({ success: false, error: 'Title atau comment wajib diisi.' }, { status: 400 })
        }

        const commentText = comment === null ? '' : String(comment).trim()
        const storedComment = `${NAME_PREFIX}${customerName}\n${commentText}`

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                product_id: productId,
                rating,
                title: title === null ? null : String(title).trim() || null,
                comment: storedComment || null,
                is_approved: false,
                is_verified_purchase: false,
            })
            .select('id')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, reviewId: data?.id })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
