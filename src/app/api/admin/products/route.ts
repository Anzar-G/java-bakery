import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    id: string
    name?: string
    category_id?: string
    base_price?: number
    featured_image?: string | null
    is_active?: boolean
    is_pre_order?: boolean
    pre_order_days?: number | null
    shipping_local_only?: boolean
}

type CreateBody = {
    name: string
    slug?: string
    category_id: string
    base_price: number
    featured_image?: string | null
    is_active?: boolean
    is_pre_order?: boolean
    pre_order_days?: number | null
    shipping_local_only?: boolean
}

function slugify(input: string) {
    return String(input)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function suffix() {
    return Math.random().toString(36).slice(2, 6).toLowerCase()
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

        const { data, error } = await admin.supabase
            .from('products')
            .select(
                'id, name, slug, category_id, featured_image, base_price, is_active, is_pre_order, pre_order_days, shipping_local_only, created_at, category:categories!products_category_id_fkey(id, name)'
            )
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, products: data ?? [] })
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
            return NextResponse.json({ success: false, error: 'Missing product id.' }, { status: 400 })
        }

        const update: Record<string, any> = {}
        if (typeof body.name === 'string') update.name = body.name.trim()
        if (typeof body.category_id === 'string') update.category_id = body.category_id.trim()
        if (typeof body.base_price === 'number') update.base_price = body.base_price
        if (typeof body.featured_image === 'string' || body.featured_image === null) update.featured_image = body.featured_image
        if (typeof body.is_active === 'boolean') update.is_active = body.is_active
        if (typeof body.is_pre_order === 'boolean') update.is_pre_order = body.is_pre_order
        if (typeof body.shipping_local_only === 'boolean') update.shipping_local_only = body.shipping_local_only
        if (typeof body.pre_order_days === 'number' || body.pre_order_days === null) update.pre_order_days = body.pre_order_days

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('products')
            .update(update)
            .eq('id', body.id)
            .select(
                'id, name, slug, category_id, featured_image, base_price, is_active, is_pre_order, pre_order_days, shipping_local_only, category:categories!products_category_id_fkey(id, name)'
            )
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, product: data })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const id = request.nextUrl.searchParams.get('id') ?? ''
        if (!id.trim()) {
            return NextResponse.json({ success: false, error: 'Missing product id.' }, { status: 400 })
        }

        const { error } = await admin.supabase.from('products').delete().eq('id', id)
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const body = (await request.json()) as CreateBody

        const name = String(body?.name ?? '').trim()
        const categoryId = String(body?.category_id ?? '').trim()
        const basePrice = Number(body?.base_price)

        if (!name) {
            return NextResponse.json({ success: false, error: 'Missing name.' }, { status: 400 })
        }
        if (!categoryId) {
            return NextResponse.json({ success: false, error: 'Missing category_id.' }, { status: 400 })
        }
        if (!Number.isFinite(basePrice) || basePrice < 0) {
            return NextResponse.json({ success: false, error: 'Invalid base_price.' }, { status: 400 })
        }

        const requestedSlug = String(body?.slug ?? '').trim()
        let slug = slugify(requestedSlug || name)
        if (!slug) slug = `product-${suffix()}`

        const { data: existing } = await admin.supabase.from('products').select('id').eq('slug', slug).maybeSingle()
        if (existing) {
            slug = `${slug}-${suffix()}`
        }

        const isActive = typeof body.is_active === 'boolean' ? body.is_active : true
        const isPreOrder = typeof body.is_pre_order === 'boolean' ? body.is_pre_order : false
        const shippingLocalOnly = typeof body.shipping_local_only === 'boolean' ? body.shipping_local_only : true
        const preOrderDays = typeof body.pre_order_days === 'number' || body.pre_order_days === null ? body.pre_order_days : null
        const featuredImage = body.featured_image === undefined ? null : (body.featured_image ?? null)

        const { data, error } = await admin.supabase
            .from('products')
            .insert({
                name,
                slug,
                category_id: categoryId,
                base_price: basePrice,
                featured_image: featuredImage,
                is_active: isActive,
                is_pre_order: isPreOrder,
                pre_order_days: preOrderDays,
                shipping_local_only: shippingLocalOnly,
            })
            .select(
                'id, name, slug, base_price, is_active, is_pre_order, pre_order_days, shipping_local_only, created_at, category:categories!products_category_id_fkey(name)'
            )
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, product: data })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
