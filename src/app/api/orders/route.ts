import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type CartItemPayload = {
    productId: string
    variantId?: string
    productName: string
    variantName?: string
    price: number
    quantity: number
}

type CreateOrderPayload = {
    shipping: {
        fullName: string
        phone: string
        email?: string
        address: string
        city: string
        postalCode?: string
        notes?: string
    }
    paymentMethod: 'whatsapp' | 'online'
    items: CartItemPayload[]
}

function generateOrderNumber() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `ORD-${y}${m}${d}-${rand}`
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { success: false, error: 'Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' },
                { status: 500 }
            )
        }

        const body = (await request.json()) as CreateOrderPayload

        if (!body?.items?.length) {
            return NextResponse.json({ success: false, error: 'Cart is empty.' }, { status: 400 })
        }

        if (!body?.shipping?.fullName || !body?.shipping?.phone || !body?.shipping?.address || !body?.shipping?.city) {
            return NextResponse.json({ success: false, error: 'Missing shipping fields.' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })

        const { data: taxRow } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'tax_rate')
            .maybeSingle()

        const taxRateRaw = taxRow ? Number((taxRow as any).value) : NaN
        const taxRate = Number.isFinite(taxRateRaw) && taxRateRaw >= 0 && taxRateRaw <= 1 ? taxRateRaw : 0.11

        const subtotal = body.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
        const taxAmount = subtotal * taxRate
        const totalAmount = subtotal + taxAmount

        const orderNumber = generateOrderNumber()

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_id: null,
                customer_name: body.shipping.fullName,
                customer_phone: body.shipping.phone,
                customer_email: body.shipping.email ?? null,
                shipping_address: body.shipping.address,
                shipping_city: body.shipping.city,
                shipping_postal_code: body.shipping.postalCode ?? null,
                subtotal,
                tax_amount: taxAmount,
                shipping_cost: 0,
                discount_amount: 0,
                total_amount: totalAmount,
                payment_method: body.paymentMethod === 'online' ? 'online' : 'whatsapp',
                payment_status: 'pending',
                status: 'pending',
                customer_notes: body.shipping.notes ?? null,
            })
            .select('id, order_number, total_amount')
            .single()

        if (orderError || !order) {
            return NextResponse.json({ success: false, error: orderError?.message ?? 'Failed to create order.' }, { status: 500 })
        }

        const orderItems = body.items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId ?? null,
            product_name: item.productName,
            variant_name: item.variantName ?? null,
            unit_price: item.price,
            quantity: item.quantity,
            subtotal: Number(item.price) * Number(item.quantity),
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

        if (itemsError) {
            await supabase.from('orders').delete().eq('id', order.id)
            return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, order })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
