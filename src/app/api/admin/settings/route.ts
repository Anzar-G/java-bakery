import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    settings: Record<string, string>
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

        const keys = [
            'whatsapp_number',
            'tax_rate',
            'store_name',
            'store_email',
            'delivery_notes',
            'pickup_notes',
            'home_hero_badge',
            'home_hero_title',
            'home_hero_subtitle',
            'home_hero_image_url',
            'home_categories_title',
            'home_categories_subtitle',
            'home_categories_cta',
            'home_best_sellers_title',
            'shipping_fee_jawa_tengah',
            'shipping_fee_di_yogyakarta',
            'shipping_fee_jawa_barat',
            'shipping_fee_dki_jakarta',
            'shipping_fee_banten',
            'shipping_fee_jawa_timur',
        ]

        const { data, error } = await admin.supabase.from('settings').select('key, value, description').in('key', keys)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const map: Record<string, { value: string; description: string | null }> = {}
        for (const k of keys) {
            map[k] = { value: '', description: null }
        }

        for (const row of data ?? []) {
            map[(row as any).key] = { value: String((row as any).value ?? ''), description: (row as any).description ?? null }
        }

        return NextResponse.json({ success: true, settings: map })
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
        const settings = body?.settings

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ success: false, error: 'Missing settings payload.' }, { status: 400 })
        }

        const entries = Object.entries(settings)
            .filter(([k]) => typeof k === 'string' && k.trim())
            .map(([k, v]) => ({ key: k, value: String(v ?? '') }))

        if (entries.length === 0) {
            return NextResponse.json({ success: false, error: 'No settings to update.' }, { status: 400 })
        }

        const { error } = await admin.supabase.from('settings').upsert(entries, { onConflict: 'key' })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
