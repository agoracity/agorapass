import type { Metadata } from "next";
import { IBM_Plex_Sans } from 'next/font/google';

import "./globals.css";
import Providers from '@/components/Providers';
import MainNav from "@/components/layout/MainNav";

const Plex_Sans = IBM_Plex_Sans({
  weight: '200',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Agora Pass",
  description: "Join the solution to decentralize invitations into communities, such as Zuzalu and decrease the dependency on trust in centralized authorities in our community.",
  icons: '/favicon.ico',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-screen flex flex-col ">
      <body className={`${Plex_Sans.className} flex-grow flex`}>
        <Providers>
          <div className="flex flex-col flex-grow">
            <MainNav />
            <div className="flex flex-grow">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
