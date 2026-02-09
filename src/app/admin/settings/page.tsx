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
    home_hero_badge: SettingRow
    home_hero_title: SettingRow
    home_hero_subtitle: SettingRow
    home_hero_image_url: SettingRow
    home_categories_title: SettingRow
    home_categories_subtitle: SettingRow
    home_categories_cta: SettingRow
    home_best_sellers_title: SettingRow
    shipping_fee_jawa_tengah: SettingRow
    shipping_fee_di_yogyakarta: SettingRow
    shipping_fee_jawa_barat: SettingRow
    shipping_fee_dki_jakarta: SettingRow
    shipping_fee_banten: SettingRow
    shipping_fee_jawa_timur: SettingRow
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>('')

    const [uploadingHero, setUploadingHero] = useState(false)

    const [values, setValues] = useState({
        whatsapp_number: '',
        tax_rate: '0.11',
        store_name: '',
        store_email: '',
        delivery_notes: '',
        pickup_notes: '',
        home_hero_badge: 'Next Batch: Shipping this Friday',
        home_hero_title: 'Freshly Baked Happiness, Delivered.',
        home_hero_subtitle:
            'Artisanal sourdough, fudgy brownies, and handmade pizza baked fresh in our home kitchen. Limited batches available weekly.',
        home_hero_image_url: '',
        home_categories_title: 'Explore Categories',
        home_categories_subtitle: 'Choose your favorite treat for the next batch',
        home_categories_cta: 'View All Categories',
        home_best_sellers_title: 'Best Sellers',
        shipping_fee_jawa_tengah: '10000',
        shipping_fee_di_yogyakarta: '10000',
        shipping_fee_jawa_barat: '13000',
        shipping_fee_dki_jakarta: '13000',
        shipping_fee_banten: '13000',
        shipping_fee_jawa_timur: '13000',
    })

    const uploadHeroImage = async (file: File) => {
        setUploadingHero(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('scope', 'home_hero')

            const res = await fetch('/api/admin/uploads/site-image', {
                method: 'POST',
                body: form,
            })

            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.success) {
                throw new Error(json?.error ?? 'Gagal upload gambar')
            }

            const url = String(json.url ?? '').trim()
            if (!url) throw new Error('URL upload kosong')

            setValues((p) => ({ ...p, home_hero_image_url: url }))
            toast.success('Gambar hero berhasil diupload')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Gagal upload gambar'
            toast.error(message)
        } finally {
            setUploadingHero(false)
        }
    }

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
                home_hero_badge: s.home_hero_badge?.value ?? 'Next Batch: Shipping this Friday',
                home_hero_title: s.home_hero_title?.value ?? 'Freshly Baked Happiness, Delivered.',
                home_hero_subtitle:
                    s.home_hero_subtitle?.value ??
                    'Artisanal sourdough, fudgy brownies, and handmade pizza baked fresh in our home kitchen. Limited batches available weekly.',
                home_hero_image_url: s.home_hero_image_url?.value ?? '',
                home_categories_title: s.home_categories_title?.value ?? 'Explore Categories',
                home_categories_subtitle: s.home_categories_subtitle?.value ?? 'Choose your favorite treat for the next batch',
                home_categories_cta: s.home_categories_cta?.value ?? 'View All Categories',
                home_best_sellers_title: s.home_best_sellers_title?.value ?? 'Best Sellers',
                shipping_fee_jawa_tengah: s.shipping_fee_jawa_tengah?.value ?? '10000',
                shipping_fee_di_yogyakarta: s.shipping_fee_di_yogyakarta?.value ?? '10000',
                shipping_fee_jawa_barat: s.shipping_fee_jawa_barat?.value ?? '13000',
                shipping_fee_dki_jakarta: s.shipping_fee_dki_jakarta?.value ?? '13000',
                shipping_fee_banten: s.shipping_fee_banten?.value ?? '13000',
                shipping_fee_jawa_timur: s.shipping_fee_jawa_timur?.value ?? '13000',
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

        const feeKeys: Array<keyof typeof values> = [
            'shipping_fee_jawa_tengah',
            'shipping_fee_di_yogyakarta',
            'shipping_fee_jawa_barat',
            'shipping_fee_dki_jakarta',
            'shipping_fee_banten',
            'shipping_fee_jawa_timur',
        ]
        for (const k of feeKeys) {
            const n = Number(values[k])
            if (!Number.isFinite(n) || n < 0) {
                toast.error('Ongkir harus angka >= 0')
                return
            }
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
                        home_hero_badge: values.home_hero_badge,
                        home_hero_title: values.home_hero_title,
                        home_hero_subtitle: values.home_hero_subtitle,
                        home_hero_image_url: values.home_hero_image_url,
                        home_categories_title: values.home_categories_title,
                        home_categories_subtitle: values.home_categories_subtitle,
                        home_categories_cta: values.home_categories_cta,
                        home_best_sellers_title: values.home_best_sellers_title,
                        shipping_fee_jawa_tengah: values.shipping_fee_jawa_tengah,
                        shipping_fee_di_yogyakarta: values.shipping_fee_di_yogyakarta,
                        shipping_fee_jawa_barat: values.shipping_fee_jawa_barat,
                        shipping_fee_dki_jakarta: values.shipping_fee_dki_jakarta,
                        shipping_fee_banten: values.shipping_fee_banten,
                        shipping_fee_jawa_timur: values.shipping_fee_jawa_timur,
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

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">Homepage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Hero Badge</label>
                            <Input
                                value={values.home_hero_badge}
                                onChange={(e) => setValues((p) => ({ ...p, home_hero_badge: e.target.value }))}
                                placeholder="Next Batch: Shipping this Friday"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Hero Title</label>
                            <Input
                                value={values.home_hero_title}
                                onChange={(e) => setValues((p) => ({ ...p, home_hero_title: e.target.value }))}
                                placeholder="Freshly Baked Happiness, Delivered."
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Hero Subtitle</label>
                            <Input
                                value={values.home_hero_subtitle}
                                onChange={(e) => setValues((p) => ({ ...p, home_hero_subtitle: e.target.value }))}
                                placeholder="Deskripsi singkat di bawah judul"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Hero Image URL</label>
                            <Input
                                value={values.home_hero_image_url}
                                onChange={(e) => setValues((p) => ({ ...p, home_hero_image_url: e.target.value }))}
                                placeholder="https://..."
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadHeroImage(file)
                                }}
                                disabled={uploadingHero || saving || loading}
                            />
                            <p className="text-xs text-[#8b775b]">Kalau kosong, akan pakai gambar produk favorit / fallback.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Categories Title</label>
                            <Input
                                value={values.home_categories_title}
                                onChange={(e) => setValues((p) => ({ ...p, home_categories_title: e.target.value }))}
                                placeholder="Explore Categories"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Categories CTA</label>
                            <Input
                                value={values.home_categories_cta}
                                onChange={(e) => setValues((p) => ({ ...p, home_categories_cta: e.target.value }))}
                                placeholder="View All Categories"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Categories Subtitle</label>
                            <Input
                                value={values.home_categories_subtitle}
                                onChange={(e) => setValues((p) => ({ ...p, home_categories_subtitle: e.target.value }))}
                                placeholder="Choose your favorite treat for the next batch"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Best Sellers Title</label>
                            <Input
                                value={values.home_best_sellers_title}
                                onChange={(e) => setValues((p) => ({ ...p, home_best_sellers_title: e.target.value }))}
                                placeholder="Best Sellers"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#f1eee9] dark:border-[#3a342a] bg-white dark:bg-[#2a241c] rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">Ongkir per Provinsi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Jawa Tengah</label>
                            <Input value={values.shipping_fee_jawa_tengah} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_jawa_tengah: e.target.value }))} placeholder="10000" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">DI Yogyakarta</label>
                            <Input value={values.shipping_fee_di_yogyakarta} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_di_yogyakarta: e.target.value }))} placeholder="10000" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Jawa Barat</label>
                            <Input value={values.shipping_fee_jawa_barat} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_jawa_barat: e.target.value }))} placeholder="13000" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">DKI Jakarta</label>
                            <Input value={values.shipping_fee_dki_jakarta} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_dki_jakarta: e.target.value }))} placeholder="13000" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Banten</label>
                            <Input value={values.shipping_fee_banten} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_banten: e.target.value }))} placeholder="13000" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#8b775b] uppercase tracking-wider">Jawa Timur</label>
                            <Input value={values.shipping_fee_jawa_timur} onChange={(e) => setValues((p) => ({ ...p, shipping_fee_jawa_timur: e.target.value }))} placeholder="13000" />
                        </div>
                        <div className="md:col-span-2 text-xs text-[#8b775b]">
                            Luar Pulau Jawa: ongkir akan ditampilkan sebagai “Konfirmasi via WhatsApp” dan tidak masuk total.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
