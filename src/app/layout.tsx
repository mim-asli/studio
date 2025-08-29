import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { Inter, VT323 } from 'next/font/google'
import './globals.css';

export const metadata: Metadata = {
  title: 'داستان - یک بازی نقش‌آفرینی با هوش مصنوعی',
  description: 'یک بازی نقش‌آفرینی بی‌پایان با هوش مصنوعی',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${inter.variable} ${vt323.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
