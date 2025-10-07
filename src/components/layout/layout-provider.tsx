
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGamePage =
    pathname.startsWith('/play/') &&
    pathname.split('/').length > 2 &&
    pathname !== '/play/friend';

  return (
    <div className="flex min-h-screen flex-col">
      {!isGamePage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isGamePage && <Footer />}
    </div>
  );
}
