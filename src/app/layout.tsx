import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers/Providers";
// import Navbar from "@/components/ui/navbar";
import MainNavigation from '@/components/ui/MainNavigation'
import { IBM_Plex_Sans } from 'next/font/google';
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
    <html lang="en">
      <body
        className={`${Plex_Sans.className} antialiased`}
      >
        <Providers>
          {/* <Navbar /> */}
          <MainNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
