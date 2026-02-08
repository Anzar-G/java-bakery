import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CustomerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="min-h-screen pb-[60px] md:pb-0">
                {children}
            </main>
            <Footer />
            <BottomNav />
        </>
    );
}
