import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !anonKey) {
            return NextResponse.json({ success: false, error: 'Missing SUPABASE env vars.' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const qRaw = String(searchParams.get('q') ?? '').trim()
        const q = qRaw.slice(0, 60)

        if (!q) {
            return NextResponse.json({ success: true, q: '', products: [], categories: [] })
        }

        const supabase = createClient(supabaseUrl, anonKey, {
            auth: { persistSession: false },
        })

        const [productsRes, categoriesRes] = await Promise.all([
            supabase
                .from('products')
                .select('id, name, slug')
                .eq('is_active', true)
                .ilike('name', `%${q}%`)
                .order('order_count', { ascending: false })
                .limit(6),
            supabase
                .from('categories')
                .select('id, name, slug')
                .eq('is_active', true)
                .ilike('name', `%${q}%`)
                .order('display_order', { ascending: true })
                .limit(6),
        ])

        if (productsRes.error) {
            return NextResponse.json({ success: false, error: productsRes.error.message }, { status: 500 })
        }

        if (categoriesRes.error) {
            return NextResponse.json({ success: false, error: categoriesRes.error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            q,
            products: productsRes.data ?? [],
            categories: categoriesRes.data ?? [],
        })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
