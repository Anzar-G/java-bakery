'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { RefreshCcw, Save, Settings as SettingsIcon } from 'lucide-react'

type SettingRow = {
    value: string
    description: string | null
}

type SettingsResponse = {
    whatsapp_number: SettingRow
    tax_rate: SettingRow
    store_name: SettingRow
    store_email: SettingRow
    delivery_notes: SettingRow
    pickup_notes: SettingRow
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>('')

    const [values, setValues] = useState({
        whatsapp_number: '',
        tax_rate: '0.11',
        store_name: '',
        store_email: '',
        delivery_notes: '',
        pickup_notes: '',
    })

    const fetchSettings = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/settings')
            const json = await res.json()

            if (!res.ok || !json?.success) {
                setError(json?.error ?? 'Gagal memuat settings')
                setLoading(false)
                return
            }

            const s = (json.settings ?? {}) as Partial<SettingsResponse>
            setValues({
                whatsapp_number: s.whatsapp_number?.value ?? '',
                tax_rate: s.tax_rate?.value ?? '0.11',
                store_name: s.store_name?.value ?? '',
                store_email: s.store_email?.value ?? '',
                delivery_notes: s.delivery_notes?.value ?? '',
                pickup_notes: s.pickup_notes?.value ?? '',
            })

            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal memuat settings'
            setError(message)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const save = async () => {
        const tax = Number(values.tax_rate)
        if (!Number.isFinite(tax) || tax < 0 || tax > 1) {
            toast.error('Tax rate harus angka 0 sampai 1 (contoh: 0.11)')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        whatsapp_number: values.whatsapp_number,
                        tax_rate: values.tax_rate,
                        store_name: values.store_name,
                        store_email: values.store_email,
                        delivery_notes: values.delivery_notes,
                        pickup_notes: values.pickup_notes,
                    },
                }),
            })

            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal menyimpan settings')
            }

            toast.success('Settings berhasil disimpan')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal menyimpan settings'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Settings</h1>
                    <p className="text-[#8b775b]">Pengaturan toko yang dipakai di checkout dan WhatsApp.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchSettings}
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        disabled={loading}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                    <Button onClick={save} disabled={saving || loading}>
                        <Save className="w-4 h-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-primary" />
                        Pengaturan Utama
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <div className="py-4 text-sm text-red-600 font-semibold">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">WhatsApp Number</label>
                            <Input
                                value={values.whatsapp_number}
                                onChange={(e) => setValues((p) => ({ ...p, whatsapp_number: e.target.value }))}
                                placeholder="628996853721"
                            />
                            <p className="text-xs text-[#8b775b]">Tanpa +, tanpa spasi. Contoh: 628996853721</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Tax Rate</label>
                            <Input
                                value={values.tax_rate}
                                onChange={(e) => setValues((p) => ({ ...p, tax_rate: e.target.value }))}
                                placeholder="0.11"
                            />
                            <p className="text-xs text-[#8b775b]">Format desimal. 0.11 = 11%</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Store Name</label>
                            <Input
                                value={values.store_name}
                                onChange={(e) => setValues((p) => ({ ...p, store_name: e.target.value }))}
                                placeholder="Bakery Umi"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Store Email</label>
                            <Input
                                value={values.store_email}
                                onChange={(e) => setValues((p) => ({ ...p, store_email: e.target.value }))}
                                placeholder="hello@bakeryumi.id"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Delivery Notes</label>
                            <Input
                                value={values.delivery_notes}
                                onChange={(e) => setValues((p) => ({ ...p, delivery_notes: e.target.value }))}
                                placeholder="Pengiriman Jumat. Local delivery untuk area kota."
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Pickup Notes</label>
                            <Input
                                value={values.pickup_notes}
                                onChange={(e) => setValues((p) => ({ ...p, pickup_notes: e.target.value }))}
                                placeholder="Pickup by appointment."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
