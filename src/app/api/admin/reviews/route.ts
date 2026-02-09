import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    id: string
    is_approved: boolean
}

async function assertAdmin(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
        return { ok: false as const, status: 500, error: 'Missing SUPABASE env vars.' }
    }

    const supabaseAuth = createServerClient(supabaseUrl, anonKey, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value
            },
            set(_name: string, _value: string, _options: CookieOptions) {
                // no-op
            },
            remove(_name: string, _options: CookieOptions) {
                // no-op
            },
        },
    })

    const {
        data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
        return { ok: false as const, status: 401, error: 'Unauthorized' }
    }

    const email = user.email?.toLowerCase() ?? ''
    if (!ADMIN_EMAILS.has(email)) {
        return { ok: false as const, status: 403, error: 'Forbidden' }
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    })

    return { ok: true as const, supabase }
}

export async function GET(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const { searchParams } = new URL(request.url)
        const status = (searchParams.get('status') ?? 'all').toLowerCase()
        const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '100'), 1), 300)

        let query = admin.supabase
            .from('reviews')
            .select(
                'id, rating, title, comment, is_verified_purchase, is_approved, created_at, product:products!reviews_product_id_fkey(name, slug)'
            )
            .order('created_at', { ascending: false })
            .limit(limit)

        if (status === 'approved') {
            query = query.eq('is_approved', true)
        } else if (status === 'pending') {
            query = query.eq('is_approved', false)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, reviews: data ?? [] })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const body = (await request.json()) as PatchBody

        if (!body?.id) {
            return NextResponse.json({ success: false, error: 'Missing review id.' }, { status: 400 })
        }

        if (typeof body.is_approved !== 'boolean') {
            return NextResponse.json({ success: false, error: 'Missing is_approved boolean.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('reviews')
            .update({ is_approved: body.is_approved })
            .eq('id', body.id)
            .select('id, is_approved, product_id')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const productId = (data as any)?.product_id as string | null | undefined
        if (productId) {
            const { data: approvedRows, error: approvedError } = await admin.supabase
                .from('reviews')
                .select('rating')
                .eq('product_id', productId)
                .eq('is_approved', true)

            if (approvedError) {
                return NextResponse.json({ success: false, error: approvedError.message }, { status: 500 })
            }

            const ratings = (approvedRows ?? []).map((r: any) => Number(r.rating)).filter((n) => Number.isFinite(n))
            const count = ratings.length
            const avg = count === 0 ? 0 : ratings.reduce((a, b) => a + b, 0) / count

            const { error: prodError } = await admin.supabase
                .from('products')
                .update({
                    rating_average: count === 0 ? null : avg,
                    review_count: count,
                })
                .eq('id', productId)

            if (prodError) {
                return NextResponse.json({ success: false, error: prodError.message }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, review: data })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
