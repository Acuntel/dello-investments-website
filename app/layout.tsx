import type { Metadata, Viewport } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteChrome from "@/components/layout/SiteChrome";
import Preloader from "@/components/ui/Preloader";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ChatWidget from "@/components/ui/ChatWidget";
import GoatCounter from "@/components/analytics/GoatCounter";
import { SITE_URL } from "@/lib/constants";
import {
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  parseExtraJsonLd,
} from "@/lib/schema";
import {
  loadOverrides,
  resolveBusiness,
  resolveImageByLocale,
} from "@/lib/admin/store";

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
      "We Buy Houses Chicago for Cash | Offer in 24 Hours | Dello Investments",
    template: "%s | Dello Investments",
  },
  description:
    "Woman-owned Chicago cash home buyer. Fair offers in 24 hours, close in 7-14 days. Any condition, all 77 neighborhoods. No repairs, no commissions, no closing costs.",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0C2F25",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const overrides = await loadOverrides();
  const business = resolveBusiness(overrides);
  const extra = parseExtraJsonLd(business.extraJsonLd);

  return (
    <html lang="en" className={`${playfair.variable} ${vietnam.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema(business)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
        {extra.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
        <GoatCounter />
      </head>
      <body className="grain">
        <SiteChrome
          header={
            <>
              <Preloader />
              <Header logo={resolveImageByLocale(overrides, "logo")} />
            </>
          }
          footer={
            <>
              <Footer logo={resolveImageByLocale(overrides, "logo")} />
              <ScrollToTop />
              <ChatWidget />
            </>
          }
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
