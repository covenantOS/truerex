import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Oswald } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TrueRex Local — Turn Every Job Into 5 More | Marketing for Plumbers, HVAC & Electricians",
  description:
    "The all-in-one local marketing platform for home service contractors. Auto-post to Google Business Profile, get more 5-star reviews via iMessage, rank in the Map Pack, and target neighbors around every job. Built by a guy who ran a home service empire.",
  keywords: [
    "home service marketing",
    "plumber marketing",
    "HVAC marketing",
    "electrician marketing",
    "Google Business Profile automation",
    "Map Pack ranking",
    "contractor marketing software",
    "review management home services",
    "neighborhood marketing",
    "local service business growth",
    "TrueRex Marketing",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "TrueRex Local — Turn Every Job Into 5 More",
    description: "Auto GBP posts, iMessage reviews, Map Pack ranking, and neighborhood targeting for home service contractors. An arm of TrueRex Marketing.",
    type: "website",
    siteName: "TrueRex Local",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueRex Local — Turn Every Job Into 5 More",
    description: "The all-in-one growth platform for plumbers, HVAC techs, and electricians. Built by TrueRex Marketing.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrueRex Local",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
