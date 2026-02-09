import Link from 'next/link'

export default function OfflinePage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-black mb-3">Kamu sedang offline</h1>
            <p className="text-[#8b775b] mb-8">Cek koneksi internetmu, lalu coba lagi.</p>
            <Link className="inline-flex items-center justify-center bg-primary text-white font-bold px-6 py-3 rounded-xl" href="/">
                Kembali ke Beranda
            </Link>
        </div>
    )
}
