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

function safeExt(contentType: string) {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
    }
    return map[contentType] ?? ''
}

export async function POST(request: NextRequest) {
    try {
        const admin = await assertAdmin(request)
        if (!admin.ok) {
            return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
        }

        const form = await request.formData()
        const file = form.get('file')
        const productId = String(form.get('productId') ?? '').trim()

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: false, error: 'Missing file.' }, { status: 400 })
        }

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Missing productId.' }, { status: 400 })
        }

        const contentType = file.type
        const ext = safeExt(contentType)
        if (!ext) {
            return NextResponse.json({ success: false, error: 'Unsupported image type. Use JPG/PNG/WEBP.' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'Max image size is 5MB.' }, { status: 400 })
        }

        const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const path = `${productId}/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { error: uploadError } = await admin.supabase.storage
            .from(bucket)
            .upload(path, buffer, { contentType, upsert: false })

        if (uploadError) {
            return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
        }

        const { data } = admin.supabase.storage.from(bucket).getPublicUrl(path)

        return NextResponse.json({
            success: true,
            url: data.publicUrl,
            bucket,
            path,
        })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
