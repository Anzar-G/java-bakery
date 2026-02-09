'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Globe, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
    const [storeName, setStoreName] = useState('Bakery Umi')
    const [storeEmail, setStoreEmail] = useState('')

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            try {
                const res = await fetch('/api/settings')
                const json = await res.json()
                if (!res.ok || !json?.success) return
                if (cancelled) return

                const name = String(json?.settings?.store_name ?? '').trim()
                const email = String(json?.settings?.store_email ?? '').trim()
                if (name) setStoreName(name)
                if (email) setStoreEmail(email)
            } catch {
                // ignore
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <footer className="bg-white dark:bg-background-dark border-t border-gray-100 dark:border-white/5 py-16 px-6 lg:px-20 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#f1eee9] dark:border-[#3a342a] bg-white">
                            <Image src="/favicon.png" alt={storeName} fill className="object-contain p-1" />
                        </div>
                        <h1 className="text-deep-brown dark:text-white text-xl font-extrabold">{storeName}</h1>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Crafting small-batch baked goods with love and the finest ingredients since 2021. Home-baked, heart-delivered.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full bg-[#f1eee9] dark:bg-white/5 hover:bg-primary hover:text-white transition-colors">
                            <Globe className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full bg-[#f1eee9] dark:bg-white/5 hover:bg-primary hover:text-white transition-colors">
                            <MessageCircle className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div>
                    <h6 className="font-bold mb-6">Quick Links</h6>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><Link href="/products" className="hover:text-primary transition-colors break-all">Shop All</Link></li>
                        <li><Link href="/schedule" className="hover:text-primary transition-colors break-all">Baking Schedule</Link></li>
                        <li><Link href="/shipping" className="hover:text-primary transition-colors break-all">Shipping Info</Link></li>
                        <li><Link href="/bulk" className="hover:text-primary transition-colors break-all">Bulk Orders</Link></li>
                    </ul>
                </div>

                <div>
                    <h6 className="font-bold mb-6">Contact Us</h6>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li className="flex items-start gap-3">
                            <MapPin className="text-primary w-5 h-5 shrink-0" />
                            <span>Kebon Jeruk, West Jakarta<br />Indonesia</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="text-primary w-5 h-5 shrink-0" />
                            <span>+62 899-6853-721</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="text-primary w-5 h-5 shrink-0" />
                            <span>{storeEmail}</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h6 className="font-bold mb-6">Join the Bake Club</h6>
                    <p className="text-sm text-gray-500 mb-4">Get notified when a new batch is ready!</p>
                    <form className="flex flex-col gap-3">
                        <Input
                            className="bg-[#f1eee9] dark:bg-white/5 border-none rounded-xl px-4 py-3 focus-visible:ring-primary text-sm h-12"
                            placeholder="Your email address"
                            type="email"
                        />
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors h-12">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-400">© 2023 {storeName}. All rights reserved.</p>
                <div className="flex gap-8">
                    <Link href="/privacy" className="text-xs text-gray-400 hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms" className="text-xs text-gray-400 hover:text-primary">Terms of Service</Link>
                </div>
            </div>
        </footer>
    )
}
