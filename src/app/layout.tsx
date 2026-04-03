import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1B6B4A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "সূত্র | suttro.app — বিজ্ঞান দেখো, বিজ্ঞান বোঝো",
  description:
    "সূত্র — বাংলাদেশের প্রথম ইন্টারেক্টিভ সায়েন্স সিমুলেশন প্ল্যাটফর্ম। NCTB ক্লাস ৯-১০ পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান সিমুলেশন।",
  keywords: [
    "সূত্র", "suttro", "science simulation", "বিজ্ঞান সিমুলেশন",
    "NCTB", "ক্লাস ৯", "ক্লাস ১০", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "সূত্র",
  },
  openGraph: {
    title: "সূত্র | suttro.app",
    description: "বিজ্ঞান দেখো, বিজ্ঞান বোঝো। ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন।",
    url: "https://suttro.app",
    siteName: "সূত্র",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-bengali">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <PWARegister />
      </body>
    </html>
  );
}
