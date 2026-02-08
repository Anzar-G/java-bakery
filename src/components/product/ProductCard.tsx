'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingBag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug?: string
        price: number
        description: string
        image: string
        badge?: string
        rating: number
        isPreOrder?: boolean
    }
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)
    const router = useRouter()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
        })
        toast.success(`${product.name} added to cart!`)
    }

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const params = new URLSearchParams({
            mode: 'now',
            productId: product.id,
            qty: '1',
        })
        router.push(`/checkout?${params.toString()}`)
    }

    return (
        <Link
            href={product.slug ? `/products/${product.slug}` : '#'}
            className="group flex flex-col bg-white dark:bg-surface-dark rounded-lg overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300 h-full"
        >
            <div className="relative aspect-square w-full bg-slate-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
                {/* Shopee-style badges */}
                <div className="absolute top-0 left-0 flex flex-col gap-1 p-2">
                    {product.badge && (
                        <div className="bg-[#EE4D2D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm inline-block">
                            {product.badge}
                        </div>
                    )}
                    {product.isPreOrder && (
                        <div className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm inline-block">
                            PRE-ORDER
                        </div>
                    )}
                </div>
            </div>

            <div className="p-2 flex flex-col flex-1">
                {/* Title: 2 lines max, 14px */}
                <h3 className="text-[14px] leading-[18px] h-[36px] font-normal text-slate-800 dark:text-slate-100 line-clamp-2 mb-2">
                    {product.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                        {/* Price: #EE4D2D, 16px font-bold */}
                        <span className="text-[16px] font-bold text-[#EE4D2D]">
                            Rp {product.price.toLocaleString('id-ID')}
                        </span>

                        {/* Rating */}
                        <div className="flex items-center text-xs text-slate-500">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-0.5" />
                            <span>{product.rating}</span>
                        </div>
                    </div>

                    {/* Buy Button: 36px height, #EE4D2D, rounded 4px */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={handleAddToCart}
                            variant="outline"
                            className="h-[36px] px-0 rounded-[4px] border-[#EE4D2D] text-[#EE4D2D] hover:bg-[#EE4D2D]/5 hover:text-[#EE4D2D]"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleBuyNow}
                            className="h-[36px] px-0 rounded-[4px] bg-[#EE4D2D] hover:bg-[#d03e1f] text-white font-medium"
                        >
                            Beli
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
