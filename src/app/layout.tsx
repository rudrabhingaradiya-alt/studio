
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/context/theme-context';
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
  
  const showHeaderFooter = !pathname.startsWith('/play/') || pathname === '/play';

  if (!isMounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body></body>
      </html>
    );
  }

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
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {showHeaderFooter && <Header />}
            <main className="flex-grow">{children}</main>
            {showHeaderFooter && <Footer />}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
