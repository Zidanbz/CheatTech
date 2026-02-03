'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

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

  return (
    <html lang="id">
      <head>
        <title>CheatTech - Website Portofolio Instan</title>
        <meta name="description" content="Website Portofolio Mahasiswa, Siap Online dalam 10 Menit." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <FirebaseClientProvider allowAnonymous={!isAdminPage}>
          {isAdminPage ? (
             <div className="bg-background">{children}</div>
          ) : (
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
