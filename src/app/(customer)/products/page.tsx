import React, { Suspense } from 'react'
import ProductsClient from './ProductsClient'

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20 text-center">Loading...</div>}>
            <ProductsClient />
        </Suspense>
    )
}
