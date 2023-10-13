import '@/styles/globals.scss';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import * as config from '@/client/config.json';
import Providers from '@/client/contexts/providers';

const inter = Inter({ subsets: ['latin'] });
const { title, description, keywords, developer, url, favicon, twitter } = config;

export const metadata: Metadata = {
  title,
  applicationName: title,
  description,
  authors: [{ name: developer, url }],
  publisher: developer,
  generator: "Next.js",
  metadataBase: new URL(url),
  alternates: {
    canonical: '/',
    languages: {
      'de-DE': '/de-DE',
    },
  },
  keywords: keywords,
  viewport: "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0",
  robots: "index,follow",
  icons: [
    {rel: "icon", url: favicon },
    { rel: "apple-touch-icon", url: favicon }
  ],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: title,
    url: url,
    images: [{
      url: favicon,
    }]
  },
  twitter: {
    card: "summary_large_image",
    site: twitter,
    creator: twitter,
    images: favicon
  },
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "black-translucent"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
