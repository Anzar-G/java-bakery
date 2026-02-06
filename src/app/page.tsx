'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function HomePage() {
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
              Next Batch: Shipping this Friday
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-deep-brown dark:text-white">
              Freshly Baked <span className="text-primary italic">Happiness</span>, Delivered.
            </h2>
            <p className="text-lg text-deep-brown/70 dark:text-white/70 max-w-lg leading-relaxed">
              Artisanal sourdough, fudgy brownies, and handmade pizza baked fresh in our home kitchen. Limited batches available weekly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                Order Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-6 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                View Menu
              </Button>
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-square lg:aspect-[4/3]">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-3"></div>
            <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden border-8 border-white dark:border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1540331547168-8b63109228b7?q=80&w=1000&auto=format&fit=crop"
                alt="Fresh sourdough bread and brownies"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Our Favorite</p>
                  <p className="font-bold">Signature Chocolate Brownie</p>
                </div>
                <span className="text-primary font-bold">Rp 85.000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-extrabold mb-2">Explore Categories</h3>
            <p className="text-deep-brown/60 dark:text-white/60">Choose your favorite treat for the next batch</p>
          </div>
          <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline underline-offset-4">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-bold text-xl mb-1">{cat.name}</h4>
                <p className="opacity-70 text-sm">{cat.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-primary/5 -mx-6 lg:-mx-20 px-6 lg:px-20 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-extrabold">Best Sellers</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.map((product, idx) => (
            <Card key={idx} className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all group border-none">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <Badge className="absolute top-3 left-3 bg-terracotta text-white border-none">
                    {product.badge}
                  </Badge>
                )}
              </div>
              <h5 className="font-bold text-lg mb-1">{product.name}</h5>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-extrabold text-primary">Rp {product.price.toLocaleString()}</span>
                <Button className="bg-primary text-white p-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-bold">Add</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

const categories = [
  { name: 'Kue Kering', tagline: 'Crunchy & Sweet', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000' },
  { name: 'Brownies', tagline: 'Fudgy & Rich', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000' },
  { name: 'Roti', tagline: 'Soft & Fluffy', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000' },
  { name: 'Pizza', tagline: 'Hot & Cheesy', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000' },
]

const bestSellers = [
  {
    name: 'Artisan Sourdough Loaf',
    price: 45000,
    badge: 'MUST TRY',
    description: 'Fermented for 24 hours for the perfect tangy flavor and crunchy crust.',
    image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?q=80&w=1000'
  },
  {
    name: 'Sea Salt Dark Brownies',
    price: 75000,
    description: 'Rich Belgian chocolate with a sprinkle of Maldon sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1530610476181-d834309647bb?q=80&w=1000'
  },
  {
    name: 'Sticky Cinnamon Rolls',
    price: 65000,
    badge: 'POPULAR',
    description: 'Pack of 4 rolls with thick cream cheese frosting and organic cinnamon.',
    image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000'
  },
]
