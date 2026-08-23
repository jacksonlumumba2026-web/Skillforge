import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITLE = "SkillPath Africa — Learn Digital Skills. Build Your Future.";
const DESCRIPTION =
  "Learn practical digital skills step by step through simple, structured courses designed for beginners.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — SkillPath Africa" },
  description: DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    // iOS only fires Web Push for a site added to the home screen —
    // this is what makes "Add to Home Screen" turn the site into a
    // real installable app instead of just a bookmark.
    capable: true,
    statusBarStyle: "default",
    title: "SkillPath",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "SkillPath Africa",
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === "sw" ? "sw" : "en";

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>
          <Navbar locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
        </LocaleProvider>
      </body>
    </html>
  );
}
