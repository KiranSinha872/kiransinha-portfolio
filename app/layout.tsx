import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Kanit } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-kanit',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiransinha.dev';

export const viewport: Viewport = {
  themeColor: '#0C0C0C',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Kiran Sinha',
    default: 'Kiran Sinha | B.Tech AI/ML Student | Aspiring Software Engineer',
  },
  description:
    'Portfolio of Kiran Sinha — B.Tech AI/ML Student & Aspiring Software Engineer building robust full-stack applications, algorithms, and real-world solutions.',
  keywords: [
    'Kiran Sinha',
    'B.Tech AI/ML',
    'Software Engineer',
    'Full Stack Developer',
    'Next.js',
    'TypeScript',
    'React',
    'Tailwind CSS',
    'Firebase',
    'Cloud Architecture',
    'Web Developer Portfolio',
  ],
  authors: [{ name: 'Kiran Sinha', url: siteUrl }],
  creator: 'Kiran Sinha',
  publisher: 'Kiran Sinha',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kiran Sinha | B.Tech AI/ML Student | Aspiring Software Engineer',
    description:
      'Explore projects, skills, education, and credentials of Kiran Sinha — B.Tech AI/ML Student and Aspiring Software Engineer.',
    url: siteUrl,
    siteName: 'Kiran Sinha Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Kiran Sinha — B.Tech AI/ML Student | Aspiring Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiran Sinha | B.Tech AI/ML Student | Aspiring Software Engineer',
    description:
      'Portfolio of Kiran Sinha — B.Tech AI/ML Student & Aspiring Software Engineer.',
    creator: '@kiransinha',
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kanit.variable} dark`}>
      <body className="min-h-screen bg-[#0C0C0C] text-[#EDEDED] font-sans antialiased selection:bg-slate-700 selection:text-white">
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
