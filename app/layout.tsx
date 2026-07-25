import type { Metadata, Viewport } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ChatWidget from "@/components/ui/ChatWidget";
import { SITE_URL } from "@/lib/constants";
import {
  generateLocalBusinessSchema,
  generateWebSiteSchema,
} from "@/lib/schema";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const vietnam = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "We Buy Houses Chicago for Cash | Offer in 24 Hours — Dello Investments",
    template: "%s | Dello Investments",
  },
  description:
    "Woman-owned Chicago cash home buyer. Fair offers in 24 hours, close in 7–14 days. Any condition, all 77 neighborhoods. No repairs, no commissions, no closing costs.",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0F1F31",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${vietnam.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
      </head>
      <body className="grain">
        <Preloader />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <ScrollToTop />
        <ChatWidget />
      </body>
    </html>
  );
}
