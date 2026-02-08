import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    status?: string
    payment_status?: string
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params

        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Missing orderId.' }, { status: 400 })
        }

        const { data: order, error: orderError } = await admin.supabase
            .from('orders')
            .select(
                'id, order_number, status, payment_method, payment_status, total_amount, subtotal, tax_amount, shipping_cost, discount_amount, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_postal_code, customer_notes, created_at'
            )
            .eq('id', orderId)
            .maybeSingle()

        if (orderError) {
            return NextResponse.json({ success: false, error: orderError.message }, { status: 500 })
        }

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
        }

        const { data: items, error: itemsError } = await admin.supabase
            .from('order_items')
            .select('id, product_name, variant_name, unit_price, quantity, subtotal, created_at')
            .eq('order_id', order.id)
            .order('created_at', { ascending: true })

        if (itemsError) {
            return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, order, items: items ?? [] })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params

        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Missing orderId.' }, { status: 400 })
        }

        const body = (await request.json()) as PatchBody

        const update: Record<string, any> = {}
        if (typeof body.status === 'string' && body.status.trim()) update.status = body.status.trim()
        if (typeof body.payment_status === 'string' && body.payment_status.trim()) update.payment_status = body.payment_status.trim()

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('orders')
            .update(update)
            .eq('id', orderId)
            .select('id, order_number, status, payment_status')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, order: data })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
