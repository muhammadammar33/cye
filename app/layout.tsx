import type { Metadata } from "next";
import { Baloo_2, Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://capitalyouthexpo.com"),
  title: "Capital Youth Expo 2026 | Islamabad's Largest Youth Expo",
  description:
    "Capital Youth Expo 2026 is Islamabad's largest youth engagement platform — five verticals, 40,000+ attendees, 18 November 2026 at Pak-China Friendship Center.",
  keywords: [
    "Capital Youth Expo",
    "CYE 2026",
    "Islamabad youth expo",
    "sponsorship",
    "campus ambassador",
    "volunteer",
    "competitions",
    "Pak-China Friendship Center",
  ],
  authors: [{ name: "Capital Youth Expo" }],
  openGraph: {
    type: "website",
    url: "https://capitalyouthexpo.com",
    siteName: "Capital Youth Expo 2026",
    title: "Capital Youth Expo 2026 | Islamabad's Largest Youth Expo",
    description:
      "Youth engagement platform with five verticals, 40,000+ attendees, 18 November 2026, Pak-China Friendship Center, Islamabad.",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capital Youth Expo 2026 | Islamabad's Largest Youth Expo",
    description:
      "Youth engagement platform — 5 verticals, 40,000+ attendees, 18 Nov 2026, Pak-China Friendship Center, Islamabad.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${baloo.variable} scroll-smooth`}
    >
      <body className="min-h-dvh bg-white font-sans text-cye-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cye-blue focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
