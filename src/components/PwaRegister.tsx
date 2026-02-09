'use client'

import { useEffect } from 'react'

export function PwaRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!('serviceWorker' in navigator)) return

        const run = async () => {
            try {
                await navigator.serviceWorker.register('/sw.js')
            } catch {
                // ignore
            }
        }

        run()
    }, [])

    return null
}
