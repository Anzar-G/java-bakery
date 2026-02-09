import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
                },
                { status: 500 }
            )
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        })

        const keys = [
            'whatsapp_number',
            'tax_rate',
            'store_name',
            'store_email',
            'delivery_notes',
            'pickup_notes',
            'shipping_fee_jawa_tengah',
            'shipping_fee_di_yogyakarta',
            'shipping_fee_jawa_barat',
            'shipping_fee_dki_jakarta',
            'shipping_fee_banten',
            'shipping_fee_jawa_timur',
        ]

        const { data, error } = await supabase.from('settings').select('key, value').in('key', keys)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const map: Record<string, string> = {}
        for (const k of keys) map[k] = ''

        for (const row of data ?? []) {
            map[String((row as any).key)] = String((row as any).value ?? '')
        }

        const taxRate = Number(map.tax_rate)

        const parseFee = (key: string, fallback: number) => {
            const n = Number(map[key])
            return Number.isFinite(n) && n >= 0 ? n : fallback
        }

        return NextResponse.json({
            success: true,
            settings: {
                whatsapp_number: map.whatsapp_number,
                tax_rate: Number.isFinite(taxRate) && taxRate >= 0 && taxRate <= 1 ? taxRate : 0.11,
                store_name: map.store_name,
                store_email: map.store_email,
                delivery_notes: map.delivery_notes,
                pickup_notes: map.pickup_notes,
                shipping_fees: {
                    jawa_tengah: parseFee('shipping_fee_jawa_tengah', 10_000),
                    di_yogyakarta: parseFee('shipping_fee_di_yogyakarta', 10_000),
                    jawa_barat: parseFee('shipping_fee_jawa_barat', 13_000),
                    dki_jakarta: parseFee('shipping_fee_dki_jakarta', 13_000),
                    banten: parseFee('shipping_fee_banten', 13_000),
                    jawa_timur: parseFee('shipping_fee_jawa_timur', 13_000),
                },
            },
        })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
