import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PWARegister from "@/components/PWARegister";
import { AuthProvider } from "@/lib/auth-context";
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
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "সূত্র | suttro.app — বিজ্ঞান দেখো, বিজ্ঞান বোঝো",
  description:
    "সূত্র — বাংলাদেশের প্রথম ইন্টারেক্টিভ সায়েন্স সিমুলেশন প্ল্যাটফর্ম। NCTB ক্লাস ৯-১০ পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, সাধারণ গণিত, উচ্চতর গণিত, ইংরেজি।",
  keywords: [
    "সূত্র", "suttro", "science simulation", "বিজ্ঞান সিমুলেশন",
    "NCTB", "ক্লাস ৯", "ক্লাস ১০", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান",
    "সাধারণ গণিত", "উচ্চতর গণিত", "ইংরেজি",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "সূত্র — বিজ্ঞান দেখো, বিজ্ঞান বোঝো" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "সূত্র | suttro.app",
    description: "বিজ্ঞান দেখো, বিজ্ঞান বোঝো। ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন।",
    images: ["/twitter-image.png"],
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
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <BottomNav />
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
