'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname } from 'next/navigation';

// Metadata can't be exported from a client component.
// We can define it here, but it won't be used by Next.js in this file.
// export const metadata: Metadata = {
//   title: 'CheatTech - Website Portofolio Instan',
//   description: 'Website Portofolio Mahasiswa, Siap Online dalam 10 Menit.',
//   icons: {
//     icon: '/favicon.ico',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isHome = pathname === '/';
  const isProductsPage = pathname.startsWith('/produk');
  const rootStyle = {
    ["--header-offset" as any]: isAdminPage ? "0px" : "96px",
  };
  const pageBackdropClass = pathname.startsWith('/demo')
    ? 'bg-[linear-gradient(180deg,#87bfd8_0%,#8ad0ef_18%,#6aa2c2_52%,#4a718f_76%,#32506c_100%)]'
    : pathname === '/checkout'
      ? 'bg-[radial-gradient(72%_90%_at_50%_42%,#ade4ff_0%,#bcecff_38%,#ffffff_78%),linear-gradient(180deg,#ffffff_0%,#f4fcff_58%,#ffffff_100%)]'
      : pathname.startsWith('/produk/') && pathname !== '/produk/'
        ? 'bg-[radial-gradient(70%_80%_at_25%_10%,#e9f8ff_0%,#cfefff_42%,#ffffff_80%)]'
        : null;

  return (
    <html lang="id" style={rootStyle}>
      <head>
        <title>CheatTech - Website Portofolio Instan</title>
        <meta name="description" content="Website Portofolio Mahasiswa, Siap Online dalam 10 Menit." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased')}
      >
        <FirebaseClientProvider allowAnonymous={!isAdminPage}>
          {isAdminPage ? (
             <div className="bg-background">{children}</div>
          ) : (
            <div className="relative flex min-h-dvh flex-col bg-background">
              {pageBackdropClass && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none fixed inset-0 z-0 ${pageBackdropClass}`}
                />
              )}
              <div className="relative z-10 flex flex-col">
                <Header />
                <main className={cn(!isHome && 'flex-1', !isHome && !isProductsPage && 'pt-24 md:pt-28')}>
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          )}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
