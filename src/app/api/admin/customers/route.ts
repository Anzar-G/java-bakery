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
        const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '100'), 1), 500)

        const { data: orders, error } = await admin.supabase
            .from('orders')
            .select('customer_name, customer_phone, customer_email, total_amount, payment_status, created_at')
            .order('created_at', { ascending: false })
            .limit(2000)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const map = new Map<
            string,
            {
                customer_name: string
                customer_phone: string
                customer_email: string | null
                total_orders: number
                total_spent_paid: number
                last_order_at: string
            }
        >()

        for (const row of orders ?? []) {
            const phone = String((row as any).customer_phone ?? '').trim()
            if (!phone) continue

            const existing = map.get(phone)
            const paid = String((row as any).payment_status ?? '').toLowerCase() === 'paid'
            const amount = Number((row as any).total_amount ?? 0)
            const createdAt = String((row as any).created_at ?? '')

            if (!existing) {
                map.set(phone, {
                    customer_name: String((row as any).customer_name ?? ''),
                    customer_phone: phone,
                    customer_email: (row as any).customer_email ?? null,
                    total_orders: 1,
                    total_spent_paid: paid ? amount : 0,
                    last_order_at: createdAt,
                })
                continue
            }

            existing.total_orders += 1
            if (paid) existing.total_spent_paid += amount
            if (createdAt && (!existing.last_order_at || createdAt > existing.last_order_at)) {
                existing.last_order_at = createdAt
            }
            if (!existing.customer_email && (row as any).customer_email) {
                existing.customer_email = (row as any).customer_email
            }
            if (!existing.customer_name && (row as any).customer_name) {
                existing.customer_name = (row as any).customer_name
            }
        }

        const customers = Array.from(map.values())
            .sort((a, b) => (b.last_order_at || '').localeCompare(a.last_order_at || ''))
            .slice(0, limit)

        return NextResponse.json({ success: true, customers })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
