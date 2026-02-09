import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Bakery Umi | Freshly Baked Happiness",
  description: "Aneka kue kering, brownies, donat, dan pizza homemade. Pre-order untuk kualitas terbaik.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
