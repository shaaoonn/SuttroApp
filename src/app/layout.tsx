import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import AppBar from "@/components/layout/AppBar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import PWARegister from "@/components/PWARegister";
import AuthGate from "@/components/AuthGate";
import NativeBridgeSync from "@/components/NativeBridgeSync";
import { ToastProvider } from "@/components/native/Toast";
import PageTransition from "@/components/native/PageTransition";
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

// ─────────────────────────────────────────────
// SEO — Primary keywords (Bangladesh NCTB Class 9-10 audience)
//   Brand:          suttro, suttro app, সূত্র, সূত্র অ্যাপ
//   Intent (EN):    class 9 physics simulation, class 10 science bangla,
//                   nctb physics simulation, ssc physics interactive,
//                   bangla physics simulation, science simulation bangladesh
//   Intent (Bn):    ক্লাস ৯ পদার্থবিজ্ঞান, ক্লাস ১০ বিজ্ঞান, বিজ্ঞান সিমুলেশন,
//                   NCTB ক্লাস ৯, পদার্থবিজ্ঞান অনলাইন, বিজ্ঞান শিখো
//   Long-tail:      ohm's law simulation bangla, newton's laws class 9,
//                   reflection of light simulation, atomic structure class 9
// ─────────────────────────────────────────────

const SITE_URL = "https://suttro.app";
const BRAND = "Suttro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // Title: brand + primary keyword + geo/curriculum signal (58 chars)
  title: {
    default: "Suttro — NCTB Class 9-10 Science Simulations in Bangla",
    template: "%s | Suttro",
  },

  // Description: mixes English (for Google BD) + Bengali (for native queries),
  // includes brand + class level + subjects + USP (interactive/free)
  description:
    "Learn Class 9-10 Physics, Chemistry, Biology with interactive simulations — free to start. NCTB-aligned, fully in বাংলা. সূত্র (Suttro) — বিজ্ঞান দেখো, বিজ্ঞান বোঝো।",

  applicationName: BRAND,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "Suttro — EJOSB IT",
  publisher: "Suttro",

  // Keywords (still used by Bing, DuckDuckGo, Yandex — safe to include)
  keywords: [
    // Brand
    "Suttro", "suttro app", "suttro.app", "সূত্র", "সূত্র অ্যাপ",
    // Class/curriculum
    "NCTB", "class 9 science", "class 10 science", "SSC physics",
    "ক্লাস ৯ পদার্থবিজ্ঞান", "ক্লাস ১০ পদার্থবিজ্ঞান",
    "NCTB ক্লাস ৯", "NCTB ক্লাস ১০",
    // Subject + medium
    "physics simulation bangla", "chemistry simulation bangla",
    "biology simulation bangla", "science simulation Bangladesh",
    "interactive physics learning", "bangla science app",
    "পদার্থবিজ্ঞান সিমুলেশন", "রসায়ন সিমুলেশন", "জীববিজ্ঞান সিমুলেশন",
    "বিজ্ঞান সিমুলেশন", "ইন্টারেক্টিভ বিজ্ঞান",
    // Long-tail chapters
    "ohm's law simulation", "newton's laws simulation",
    "reflection of light bangla", "atomic structure class 9",
    // Intent
    "online class 9 bangladesh", "online class 10 bangladesh",
    "free physics app bangla", "bigyan shikho online",
  ],

  category: "Education",

  // Search engines
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
    languages: {
      "bn-BD": SITE_URL,
      "en-US": SITE_URL,
      "x-default": SITE_URL,
    },
  },

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
    title: BRAND,
  },

  openGraph: {
    title: "Suttro — NCTB Class 9-10 Science Simulations in Bangla",
    description:
      "Interactive Physics, Chemistry, Biology simulations for NCTB Class 9-10. বিজ্ঞান দেখো, বিজ্ঞান বোঝো।",
    url: SITE_URL,
    siteName: BRAND,
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Suttro — Science simulations for Class 9-10 Bangladesh",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@suttroapp",
    creator: "@suttroapp",
    title: "Suttro — Class 9-10 Science Simulations (NCTB Bangla)",
    description:
      "Interactive Physics, Chemistry, Biology simulations in বাংলা. Free to start.",
    images: ["/twitter-image.png"],
  },

  // Google Search Console verification — update when the TXT/HTML method is
  // chosen from Search Console. The meta approach is commented out until
  // the correct token is issued, to avoid broadcasting a placeholder.
  // verification: { google: "REPLACE_WITH_TOKEN" },

  other: {
    // Bangladesh locale hint for Google
    "geo.region": "BD",
    "geo.placename": "Bangladesh",
    "google": "notranslate",
  },
};

// ─────────────────────────────────────────────
// Structured data (JSON-LD) — helps Google render rich results:
//   • Organization — knowledge panel + brand logo
//   • WebSite — sitelinks search box
//   • SoftwareApplication — Android app card in results
//   • EducationalOrganization — education-specific ranking signals
// ─────────────────────────────────────────────
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#org`,
    name: "Suttro",
    alternateName: ["সূত্র", "Suttro app", "suttro.app"],
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    sameAs: [
      "https://www.facebook.com/suttroapp",
      "https://www.youtube.com/@suttroapp",
      "https://www.instagram.com/suttroapp",
      "https://twitter.com/suttroapp",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: "Suttro",
    alternateName: "সূত্র",
    inLanguage: ["bn-BD", "en-US"],
    publisher: { "@id": `${SITE_URL}#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}#edu`,
    name: "Suttro",
    alternateName: "সূত্র",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description:
      "NCTB-aligned interactive science simulations for Class 9-10 students in Bangladesh.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
    areaServed: { "@type": "Country", name: "Bangladesh" },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}#app`,
    name: "Suttro",
    alternateName: "সূত্র",
    operatingSystem: "ANDROID",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Science Education",
    description:
      "Interactive Physics, Chemistry, and Biology simulations for NCTB Class 9-10 in বাংলা. Live video classes, MCQ exams, daily lessons.",
    inLanguage: "bn-BD",
    downloadUrl: "https://play.google.com/store/apps/details?id=com.suttro.app",
    installUrl: "https://play.google.com/store/apps/details?id=com.suttro.app",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BDT",
    },
    // Note: aggregateRating intentionally omitted until we have real Play
    // Store reviews — Google penalizes fabricated rating markup.
    publisher: { "@id": `${SITE_URL}#org` },
  },
];

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
      <head>
        {/* Structured data — single <script> with @graph so Google can
            deduplicate the Organization/WebSite/SoftwareApplication entities. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": jsonLd,
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-bengali">
        <AuthProvider>
          <ToastProvider>
            <AuthGate>
              {/* Desktop: website navbar — Mobile: native app bar */}
              <div className="hidden lg:block"><Navbar /></div>
              <AppBar />
              <main className="flex-1 flex flex-col">
                <PageTransition>{children}</PageTransition>
              </main>
              {/* Desktop only: footer */}
              <div className="hidden lg:block"><Footer /></div>
              <BottomNav />
            </AuthGate>
            <PWARegister />
            <NativeBridgeSync />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
