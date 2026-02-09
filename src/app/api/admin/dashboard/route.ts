import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type BestSellerRow = {
    product_name: string
    qty: number
}

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !anonKey || !serviceRoleKey) {
            return NextResponse.json(
                { success: false, error: 'Missing SUPABASE env vars.' },
                { status: 500 }
            )
        }

        // Validate session (auth) using anon + cookies
        const supabaseAuth = createServerClient(supabaseUrl, anonKey, {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(_name: string, _value: string, _options: CookieOptions) {
                    // no-op for read-only GET
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
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const email = user.email?.toLowerCase() ?? ''
        if (!ADMIN_EMAILS.has(email)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        // Use service role for reading dashboard aggregates
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })

        const [{ count: ordersCount, error: ordersCountError }, { count: productsCount, error: productsCountError }] = await Promise.all([
            supabase.from('orders').select('id', { count: 'exact', head: true }),
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        ])

        if (ordersCountError || productsCountError) {
            return NextResponse.json(
                {
                    success: false,
                    error: ordersCountError?.message ?? productsCountError?.message ?? 'Failed to load stats',
                },
                { status: 500 }
            )
        }

        const { data: customerRows, error: customersError } = await supabase
            .from('orders')
            .select('customer_phone, customer_email')

        if (customersError) {
            return NextResponse.json({ success: false, error: customersError.message }, { status: 500 })
        }

        const uniqueCustomers = new Set<string>()
        for (const row of customerRows ?? []) {
            const phone = String((row as any).customer_phone ?? '').trim()
            if (phone) {
                uniqueCustomers.add(`phone:${phone}`)
                continue
            }

            const emailKey = String((row as any).customer_email ?? '').trim().toLowerCase()
            if (emailKey) uniqueCustomers.add(`email:${emailKey}`)
        }

        const { data: revenueRows, error: revenueError } = await supabase
            .from('orders')
            .select('total_amount, payment_status')

        if (revenueError) {
            return NextResponse.json({ success: false, error: revenueError.message }, { status: 500 })
        }

        const totalRevenue = (revenueRows ?? [])
            .filter((r) => String((r as any).payment_status ?? '').toLowerCase() === 'paid')
            .reduce((sum, r) => sum + Number((r as any).total_amount ?? 0), 0)

        const { data: recentOrders, error: recentOrdersError } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, customer_email, status, payment_status, total_amount, created_at')
            .order('created_at', { ascending: false })
            .limit(6)

        if (recentOrdersError) {
            return NextResponse.json({ success: false, error: recentOrdersError.message }, { status: 500 })
        }

        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: bestSellerRows, error: bestSellerError } = await supabase
            .from('order_items')
            .select('product_name, quantity, orders!inner(payment_status, created_at)')
            .eq('orders.payment_status', 'paid')
            .gte('orders.created_at', since)

        if (bestSellerError) {
            return NextResponse.json({ success: false, error: bestSellerError.message }, { status: 500 })
        }

        const bestSellerMap = new Map<string, number>()
        for (const r of bestSellerRows ?? []) {
            const name = String((r as any).product_name ?? '').trim()
            if (!name) continue
            const qty = Number((r as any).quantity ?? 0)
            bestSellerMap.set(name, (bestSellerMap.get(name) ?? 0) + (Number.isFinite(qty) ? qty : 0))
        }

        const bestSellers: BestSellerRow[] = Array.from(bestSellerMap.entries())
            .map(([product_name, qty]) => ({ product_name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 3)

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders: ordersCount ?? 0,
                activeProducts: productsCount ?? 0,
                totalCustomers: uniqueCustomers.size,
            },
            recentOrders: recentOrders ?? [],
            bestSellers,
        })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
