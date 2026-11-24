import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, DM_Sans, DM_Serif_Display } from 'next/font/google';
import { env } from '@/lib/env';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export const viewport: Viewport = {
  themeColor: '#F9F9F9',
  colorScheme: 'light dark',
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
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
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
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="min-h-screen bg-[#0C0C0C] text-[#EDEDED] font-sans antialiased selection:bg-[#0B7658]/20 selection:text-[#0B7658]">
        {children}
      </body>
    </html>
  );
}
