import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

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

        const productId = request.nextUrl.searchParams.get('productId') ?? ''
        if (!productId.trim()) {
            return NextResponse.json({ success: false, error: 'Missing productId.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('product_variants')
            .select('id, product_id, name, price_adjustment, is_active, display_order, created_at')
            .eq('product_id', productId)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, variants: data ?? [] })
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

        const body = (await request.json()) as any
        const productId = String(body?.productId ?? '').trim()
        const name = String(body?.name ?? '').trim()
        const priceAdjustment = Number(body?.price_adjustment ?? 0)
        const isActive = typeof body?.is_active === 'boolean' ? body.is_active : true
        const displayOrderRaw = body?.display_order
        const displayOrder = displayOrderRaw === null || displayOrderRaw === undefined || String(displayOrderRaw).trim() === '' ? 0 : Number(displayOrderRaw)

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Missing productId.' }, { status: 400 })
        }
        if (!name) {
            return NextResponse.json({ success: false, error: 'Missing name.' }, { status: 400 })
        }
        if (!Number.isFinite(priceAdjustment)) {
            return NextResponse.json({ success: false, error: 'Invalid price_adjustment.' }, { status: 400 })
        }
        if (!Number.isFinite(displayOrder)) {
            return NextResponse.json({ success: false, error: 'Invalid display_order.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('product_variants')
            .insert({
                product_id: productId,
                name,
                price_adjustment: priceAdjustment,
                is_active: isActive,
                display_order: displayOrder,
            })
            .select('id, product_id, name, price_adjustment, is_active, display_order, created_at')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, variant: data })
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

        const body = (await request.json()) as any
        const id = String(body?.id ?? '').trim()
        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing id.' }, { status: 400 })
        }

        const update: Record<string, any> = {}
        if (typeof body?.name === 'string') update.name = body.name.trim()
        if (body?.price_adjustment !== undefined) {
            const n = Number(body.price_adjustment)
            if (!Number.isFinite(n)) {
                return NextResponse.json({ success: false, error: 'Invalid price_adjustment.' }, { status: 400 })
            }
            update.price_adjustment = n
        }
        if (typeof body?.is_active === 'boolean') update.is_active = body.is_active
        if (body?.display_order !== undefined) {
            const n = body.display_order === null || String(body.display_order).trim() === '' ? 0 : Number(body.display_order)
            if (!Number.isFinite(n)) {
                return NextResponse.json({ success: false, error: 'Invalid display_order.' }, { status: 400 })
            }
            update.display_order = n
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('product_variants')
            .update(update)
            .eq('id', id)
            .select('id, product_id, name, price_adjustment, is_active, display_order, created_at')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, variant: data })
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
            return NextResponse.json({ success: false, error: 'Missing id.' }, { status: 400 })
        }

        const { error } = await admin.supabase.from('product_variants').delete().eq('id', id)
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
