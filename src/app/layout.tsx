
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Chess Arena',
//   description: 'Play, Challenge, and Conquer the Board',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const isGamePage = pathname.startsWith('/play/') && pathname !== '/play/friend';
  const showHeaderFooter = !isGamePage || pathname === '/play';

  if (!isMounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Chess Arena</title>
          <meta name="description" content="Play, Challenge, and Conquer the Board" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-body antialiased">
            <div className="flex min-h-screen flex-col">
              <main className="flex-grow">{children}</main>
            </div>
        </body>
      </html>
    );
  }
  
  const isPlayPage = pathname.startsWith('/play');
  const dynamicGamePath = isPlayPage && (pathname.split('/').length > 2 && pathname !== '/play/friend');


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Chess Arena</title>
        <meta name="description" content="Play, Challenge, and Conquer the Board" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              {!dynamicGamePath && <Header />}
              <main className="flex-grow">{children}</main>
              {!dynamicGamePath && <Footer />}
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
