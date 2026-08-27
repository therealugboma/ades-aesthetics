import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/lib/convex-provider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ades Aesthetics | Premium Beauty Services",
  description:
    "Ades Aesthetics offers premium beauty services in Lagos, Nigeria. Experience luxury nail care, lash extensions, brow styling, and skin treatments by expert aestheticians.",
  keywords: [
    "beauty salon Lagos",
    "nail studio Lagos",
    "lash extensions Nigeria",
    "brow styling Lagos",
    "skin treatments Lagos",
    "beauty services Nigeria",
    "Ades Aesthetics",
  ],
  openGraph: {
    title: "Ades Aesthetics | Premium Beauty Services",
    description:
      "Experience luxury beauty services in Lagos, Nigeria. Premium nails, lashes, brows, and skin treatments.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-body text-foreground antialiased">
        <ConvexClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
