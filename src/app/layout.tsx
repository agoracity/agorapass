import React from 'react';
import type { Metadata } from "next";
import { IBM_Plex_Sans } from 'next/font/google';
import "./globals.css";
import Providers from "@/components/providers/Providers";
import MainNavigation from '@/components/ui/MainNavigation'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { siteName } from '@/config/site';

const Plex_Sans = IBM_Plex_Sans({
  weight: '200',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: siteName,
  description: siteName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">{/* Changed from "dark" to "light" */}
      <body className={`${Plex_Sans.className} antialiased bg-background text-foreground`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white relative">{/* Changed from bg-black to bg-white */}
            <BackgroundBeams />
            <MainNavigation />
            <main className="flex-grow z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
