'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
    images: {
        url: string
        alt: string
    }[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <div className="space-y-3">
            <div className="relative w-full h-72 md:h-80 lg:h-[420px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                <Image
                    src={images[activeIndex]?.url}
                    alt={images[activeIndex]?.alt || 'Product image'}
                    fill
                    className="object-cover transition-all"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all pointer-events-none"></div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`View image ${idx + 1}`}
                        className={cn(
                            "relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden transition flex-none",
                            activeIndex === idx ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                        )}
                    >
                        <Image src={img.url} alt={img.alt} fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    )
}
