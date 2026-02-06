'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success('Login berhasil!')
            router.push('/admin/dashboard')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal login'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
            <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-[#2a241c] rounded-3xl border border-[#f1eee9] dark:border-[#3a342a] shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-primary uppercase tracking-wider mb-2">Bakery Admin</h1>
                    <p className="text-[#8b775b]">Silakan masuk untuk mengelola toko lo.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Email Admin</label>
                        <Input
                            type="email"
                            placeholder="admin@bakery.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-background-light dark:bg-background-dark border-[#f1eee9] dark:border-[#3a342a]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-background-light dark:bg-background-dark border-[#f1eee9] dark:border-[#3a342a]"
                        />
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full py-7 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                        {loading ? 'Sedang Masuk...' : 'Masuk ke Dashboard'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
