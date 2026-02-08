import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        const { orderNumber } = await params

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { success: false, error: 'Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' },
                { status: 500 }
            )
        }

        if (!orderNumber) {
            return NextResponse.json({ success: false, error: 'Missing orderNumber.' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(
                'id, order_number, status, payment_method, payment_status, total_amount, subtotal, tax_amount, shipping_cost, discount_amount, customer_name, customer_phone, shipping_address, shipping_city, shipping_postal_code, created_at'
            )
            .eq('order_number', orderNumber)
            .maybeSingle()

        if (orderError) {
            return NextResponse.json({ success: false, error: orderError.message }, { status: 500 })
        }

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
        }

        const { data: items, error: itemsError } = await supabase
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
