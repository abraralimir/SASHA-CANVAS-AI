import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LogoIcon } from '@/components/icons';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const APP_NAME = 'Sasha Canvas AI';
const APP_DESCRIPTION = 'Unleash your creativity with an AI-powered drawing canvas that can generate, edit, and enhance images with natural language.';
const APP_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';


export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['AI drawing', 'image generation', 'art tool', 'creative canvas', 'Sasha AI', 'AI painting'],
  applicationName: APP_NAME,
  authors: [{ name: 'Sasha AI Team' }],
  creator: 'Sasha AI Team',
  
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png', // Make sure to create this file in your /public folder
        width: 1200,
        height: 630,
        alt: 'Sasha Canvas AI promotional image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'], // Make sure to create this file
  },
  
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The Poppins font is already being loaded via next/font, so the direct link tags are not needed here and can cause performance issues. */}
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          poppins.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
