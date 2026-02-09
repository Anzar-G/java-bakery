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

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
        const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '20'), 1), 200)
        const offset = (page - 1) * limit

        // Get total count
        const { count, error: countError } = await admin.supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            return NextResponse.json({ success: false, error: countError.message }, { status: 500 })
        }

        // Get paginated data
        const { data, error } = await admin.supabase
            .from('orders')
            .select(
                'id, order_number, status, payment_method, payment_status, total_amount, customer_name, customer_email, customer_phone, shipping_city, created_at'
            )
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, orders: data ?? [], count: count ?? 0 })
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

        const body = (await request.json().catch(() => null)) as null | { ids?: unknown }
        const ids = Array.isArray(body?.ids) ? body?.ids : []
        const safeIds = ids.map((x) => String(x ?? '').trim()).filter(Boolean)
        if (safeIds.length === 0) {
            return NextResponse.json({ success: false, error: 'Missing order id(s).' }, { status: 400 })
        }

        // Delete order items first (FK constraint)
        const { error: itemsError } = await admin.supabase.from('order_items').delete().in('order_id', safeIds)
        if (itemsError) {
            return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
        }

        // Delete orders
        const { error } = await admin.supabase.from('orders').delete().in('id', safeIds)
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
