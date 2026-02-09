import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_EMAILS = new Set(['javabakery@java.com'])

type PatchBody = {
    id: string
    name?: string
    slug?: string
    image_url?: string | null
    is_active?: boolean
    display_order?: number
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

        const { data, error } = await admin.supabase
            .from('categories')
            .select('id, name, slug, image_url, is_active, display_order')
            .order('display_order', { ascending: true })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, categories: data ?? [] })
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
        if (!body?.id || !String(body.id).trim()) {
            return NextResponse.json({ success: false, error: 'Missing category id.' }, { status: 400 })
        }

        const update: Record<string, any> = {}
        if (typeof body.name === 'string') update.name = body.name.trim()
        if (typeof body.slug === 'string') update.slug = body.slug.trim()
        if (typeof body.image_url === 'string' || body.image_url === null) update.image_url = body.image_url
        if (typeof body.is_active === 'boolean') update.is_active = body.is_active
        if (typeof body.display_order === 'number') update.display_order = body.display_order

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
        }

        const { data, error } = await admin.supabase
            .from('categories')
            .update(update)
            .eq('id', body.id)
            .select('id, name, slug, image_url, is_active, display_order')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, category: data })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
