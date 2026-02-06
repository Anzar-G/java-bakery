'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingBag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'

interface ProductCardProps {
    product: {
        id: string
        name: string
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

    const handleAddToCart = () => {
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

    return (
        <div className="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.badge && (
                        <Badge className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border-none">
                            {product.badge}
                        </Badge>
                    )}
                    {product.isPreOrder && (
                        <Badge className="bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border-none">
                            Pre-Order
                        </Badge>
                    )}
                </div>
                <Button
                    onClick={handleAddToCart}
                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-primary hover:text-white text-slate-900 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
                >
                    <ShoppingBag className="w-5 h-5" />
                </Button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3 truncate">{product.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">Rp {product.price.toLocaleString()}</span>
                    <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{product.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
