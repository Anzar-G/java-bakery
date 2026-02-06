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
        <div className="space-y-4">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                <Image
                    src={images[activeIndex]?.url}
                    alt={images[activeIndex]?.alt || 'Product image'}
                    fill
                    className="object-cover transition-all"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all pointer-events-none"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`View image ${idx + 1}`}
                        className={cn(
                            "aspect-square rounded-lg overflow-hidden transition cursor-pointer relative",
                            activeIndex === idx ? "ring-2 ring-primary" : "grayscale hover:grayscale-0"
                        )}
                    >
                        <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
