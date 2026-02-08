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

function yyyyMmDd(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export async function GET(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const { searchParams } = new URL(request.url)
        const days = Math.min(Math.max(Number(searchParams.get('days') ?? '14'), 7), 60)

        const start = new Date()
        start.setDate(start.getDate() - (days - 1))
        start.setHours(0, 0, 0, 0)

        const { data: orders, error } = await admin.supabase
            .from('orders')
            .select('created_at, total_amount, payment_status, status')
            .gte('created_at', start.toISOString())
            .order('created_at', { ascending: true })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const dailyMap = new Map<
            string,
            {
                date: string
                orders: number
                paid_orders: number
                revenue_paid: number
            }
        >()

        for (let i = 0; i < days; i++) {
            const d = new Date(start)
            d.setDate(start.getDate() + i)
            const key = yyyyMmDd(d)
            dailyMap.set(key, { date: key, orders: 0, paid_orders: 0, revenue_paid: 0 })
        }

        let totalOrders = 0
        let paidOrders = 0
        let revenuePaid = 0

        const statusCounts: Record<string, number> = {}
        const paymentCounts: Record<string, number> = {}

        for (const row of orders ?? []) {
            const createdAt = String((row as any).created_at ?? '')
            const dateKey = createdAt ? createdAt.slice(0, 10) : ''
            const paymentStatus = String((row as any).payment_status ?? '').toLowerCase()
            const status = String((row as any).status ?? '').toLowerCase()
            const amount = Number((row as any).total_amount ?? 0)

            totalOrders += 1
            statusCounts[status] = (statusCounts[status] ?? 0) + 1
            paymentCounts[paymentStatus] = (paymentCounts[paymentStatus] ?? 0) + 1

            const daily = dailyMap.get(dateKey)
            if (daily) {
                daily.orders += 1
            }

            if (paymentStatus === 'paid') {
                paidOrders += 1
                revenuePaid += amount
                if (daily) {
                    daily.paid_orders += 1
                    daily.revenue_paid += amount
                }
            }
        }

        const daily = Array.from(dailyMap.values())

        return NextResponse.json({
            success: true,
            summary: {
                days,
                totalOrders,
                paidOrders,
                revenuePaid,
            },
            breakdown: {
                statusCounts,
                paymentCounts,
            },
            daily,
        })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
