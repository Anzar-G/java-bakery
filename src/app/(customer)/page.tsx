import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'
import { ProductCard } from '@/components/product/ProductCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

type BestSeller = {
  id: string
  name: string
  slug: string
  base_price: number
  description: string | null
  featured_image: string | null
  is_pre_order: boolean
  rating_average: number | null
  order_count: number | null
}

type PublicSettings = {
  homepage?: {
    hero_badge?: string
    hero_title?: string
    hero_subtitle?: string
    hero_image_url?: string
    categories_title?: string
    categories_subtitle?: string
    categories_cta?: string
    best_sellers_title?: string
  }
}

function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).')
  }

  return createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
}

function fallbackImage() {
  return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
}

export default async function HomePage() {
  const supabase = supabaseServer()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? String(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, '')
    : ''

  const settingsRes = await fetch(`${baseUrl}/api/settings`, { cache: 'no-store' }).catch(() => null)
  const settingsJson = settingsRes ? await settingsRes.json().catch(() => null) : null
  const publicSettings = (settingsJson?.success ? (settingsJson.settings as PublicSettings) : null) ?? null
  const hp = publicSettings?.homepage ?? {}

  const [{ data: categoriesData }, { data: bestSellersData }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select('id, name, slug, base_price, description, featured_image, is_pre_order, rating_average, order_count')
      .eq('is_active', true)
      .not('rating_average', 'is', null)
      .gt('rating_average', 0)
      .order('rating_average', { ascending: false })
      .order('order_count', { ascending: false })
      .limit(3),
  ])

  const categories = (categoriesData || []) as Category[]
  const bestSellers = ((bestSellersData || []) as BestSeller[]).filter((p) => Boolean(p?.id) && Boolean(p?.slug))

  const heroBadge = (hp.hero_badge || 'Next Batch: Shipping this Friday').trim()
  const heroTitle = (hp.hero_title || 'Freshly Baked Happiness, Delivered.').trim()
  const heroSubtitle = (
    hp.hero_subtitle ||
    'Artisanal sourdough, fudgy brownies, and handmade pizza baked fresh in our home kitchen. Limited batches available weekly.'
  ).trim()
  const heroImageUrl = (hp.hero_image_url || '').trim()

  const categoriesTitle = (hp.categories_title || 'Explore Categories').trim()
  const categoriesSubtitle = (hp.categories_subtitle || 'Choose your favorite treat for the next batch').trim()
  const categoriesCta = (hp.categories_cta || 'View All Categories').trim()
  const bestSellersTitle = (hp.best_sellers_title || 'Best Sellers').trim()

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-20 overflow-hidden">
      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {heroBadge}
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-deep-brown dark:text-white">
              {heroTitle}
            </h2>
            <p className="text-lg text-deep-brown/70 dark:text-white/70 max-w-lg leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                <Link href="/products">Order Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-6 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                <Link href="/products">View Menu</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-square lg:aspect-[4/3]">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-3"></div>
            <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden border-8 border-white dark:border-white/10">
              <Image
                src={heroImageUrl || bestSellers[0]?.featured_image || fallbackImage()}
                alt="Fresh sourdough bread and brownies"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Our Favorite</p>
                  <p className="font-bold">{bestSellers[0]?.name ?? 'Bakery Umi'}</p>
                </div>
                <span className="text-primary font-bold">
                  {bestSellers[0]?.base_price ? `Rp ${Number(bestSellers[0]?.base_price).toLocaleString('id-ID')}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-extrabold mb-2">{categoriesTitle}</h3>
            <p className="text-deep-brown/60 dark:text-white/60">{categoriesSubtitle}</p>
          </div>
          <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline underline-offset-4">
            {categoriesCta}
          </Link>
        </div>
        <div className="-mx-6 px-6 md:mx-0 md:px-0">
          <div className="relative md:hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#fbfaf9] dark:from-[#1e1a14] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#fbfaf9] dark:from-[#1e1a14] to-transparent z-10" />

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative w-44 shrink-0 aspect-square rounded-2xl overflow-hidden cursor-pointer block snap-start"
                >
                  <Image
                    src={cat.image_url || fallbackImage()}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="font-bold text-base leading-tight">{cat.name}</h4>
                    <p className="opacity-70 text-xs mt-1">View products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer block"
              >
                <Image
                  src={cat.image_url || fallbackImage()}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="font-bold text-xl mb-1">{cat.name}</h4>
                  <p className="opacity-70 text-sm">View products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 bg-primary/5 -mx-6 lg:-mx-20 px-6 lg:px-20 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-extrabold">{bestSellersTitle}</h3>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="-mx-6 px-6 md:mx-0 md:px-0">
            <div className="relative md:hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#fbfaf9] dark:from-[#1e1a14] to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#fbfaf9] dark:from-[#1e1a14] to-transparent z-10" />

              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {bestSellers.map((product) => (
                  <div key={product.id} className="shrink-0 w-[240px] snap-start">
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.base_price,
                        description: product.description ?? '',
                        image: product.featured_image || fallbackImage(),
                        rating: product.rating_average ?? 0,
                        isPreOrder: product.is_pre_order,
                        badge: 'Best Seller',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.base_price,
                    description: product.description ?? '',
                    image: product.featured_image || fallbackImage(),
                    rating: product.rating_average ?? 0,
                    isPreOrder: product.is_pre_order,
                    badge: 'Best Seller',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
