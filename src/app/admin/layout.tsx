'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Sidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isUserLoading) {
      return; // Tunggu sampai status otentikasi selesai dimuat
    }

    // Jika pengguna tidak login atau anonim, alihkan ke halaman login
    if (!user || user.isAnonymous) {
      if (!isLoginPage) {
        router.replace('/admin/login');
      }
    } else {
      // Jika pengguna sudah login dan berada di halaman login, alihkan ke dasbor
      if (isLoginPage) {
        router.replace('/admin');
      }
    }
  }, [user, isUserLoading, router, pathname, isLoginPage]);

  const showLoader = isUserLoading ||
                     (!isLoginPage && (!user || user.isAnonymous)) ||
                     (isLoginPage && user && !user.isAnonymous);

  if (showLoader) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika ini adalah halaman login (dan pengguna belum login), tampilkan tanpa layout admin
  if (isLoginPage) {
     return <main>{children}</main>;
  }

  // Tampilkan layout admin untuk pengguna yang sudah terotentikasi di halaman lain
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col w-full">
        <AdminHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}
