import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    id: string
    base_price?: number
    is_active?: boolean
    is_pre_order?: boolean
    pre_order_days?: number | null
    shipping_local_only?: boolean
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
                'id, name, slug, base_price, is_active, is_pre_order, pre_order_days, shipping_local_only, created_at, category:categories!products_category_id_fkey(name)'
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
        if (typeof body.base_price === 'number') update.base_price = body.base_price
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
            .select('id, name, slug, base_price, is_active, is_pre_order, pre_order_days, shipping_local_only')
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
