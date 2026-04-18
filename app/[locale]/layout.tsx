import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { Providers } from "@/components/providers";
import { routing } from "@/lib/i18n/routing";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kmedtour.com";

// Viewport / theme color — exported separately per Next.js 15 requirement
export const viewport: Viewport = {
  themeColor: "#1D4ED8",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};
const RTL_LOCALES = new Set<string>(["ar"]);

export const metadata: Metadata = {
  title: {
    default: "KmedTour – Trusted Medical Tourism from Africa to Korea",
    template: "%s | KmedTour",
  },
  description:
    "Connect with verified, KAHF-accredited Korean medical clinics for world-class treatments. Expert concierge guidance for African patients seeking quality healthcare abroad.",
  metadataBase: new URL(APP_URL),
  // PWA manifest
  manifest: "/manifest.webmanifest",
  // Icons — full PWA set
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // PWA / mobile meta
  applicationName: "KmedTour",
  appleWebApp: {
    capable: true,
    title: "KmedTour",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "KmedTour",
    title: "KmedTour – Trusted Medical Tourism from Africa to Korea",
    description:
      "Verified Korean clinics, transparent pricing, and dedicated coordinator support for African patients.",
    url: APP_URL,
    images: [{ url: "/modern-korean-hospital-building-with-medical-excel.jpg", width: 1280, height: 720 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KmedTour – Medical Tourism from Africa to Korea",
    description:
      "Verified Korean clinics, transparent pricing, and dedicated coordinator support for African patients.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
