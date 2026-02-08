import React, { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20 text-center">Loading...</div>}>
            <CheckoutClient />
        </Suspense>
    )
}
