import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css';
import { GameProvider } from '@/context/game-context';
import { SettingsProvider } from '@/context/settings-context';
import { ThemeWatcher } from '@/components/theme-watcher';

export const metadata: Metadata = {
  title: 'Dastan AI RPG',
  description: 'An endless AI-powered text-based RPG.',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        <SettingsProvider>
          <GameProvider>
            <ThemeWatcher />
            {children}
            <Toaster />
          </GameProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
