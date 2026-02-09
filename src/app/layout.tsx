import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/PwaRegister";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase:
    process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined,
  title: "Bakery Umi | Freshly Baked Happiness",
  description: "Aneka kue kering, brownies, donat, dan pizza homemade. Pre-order untuk kualitas terbaik.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=1', type: 'image/x-icon' },
      { url: '/favicon.png?v=1', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico?v=1', '/favicon.png?v=1'],
    apple: [
      { url: '/favicon.png?v=1', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Bakery Umi | Freshly Baked Happiness",
    description: "Aneka kue kering, brownies, donat, dan pizza homemade. Pre-order untuk kualitas terbaik.",
    images: [
      {
        url: '/favicon.png',
        width: 1024,
        height: 1024,
        alt: 'Bakery Umi',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: "Bakery Umi | Freshly Baked Happiness",
    description: "Aneka kue kering, brownies, donat, dan pizza homemade. Pre-order untuk kualitas terbaik.",
    images: ['/favicon.png'],
  },
  applicationName: 'Bakery Umi',
  themeColor: '#EE4D2D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased bg-background-light dark:bg-background-dark text-deep-brown dark:text-background-light`}
      >
        <PwaRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
