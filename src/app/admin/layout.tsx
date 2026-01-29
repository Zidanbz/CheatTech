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

  useEffect(() => {
    if (isUserLoading) {
      return; // Tunggu sampai status otentikasi selesai dimuat
    }

    const isLoginPage = pathname === '/admin/login';

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
  }, [user, isUserLoading, router, pathname]);

  // Tampilkan loading indicator saat memeriksa status otentikasi
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Jangan tampilkan layout admin di halaman login atau jika belum terotentikasi
  if (!user || user.isAnonymous || pathname === '/admin/login') {
     return <main>{children}</main>;
  }

  // Tampilkan layout admin untuk pengguna yang sudah terotentikasi
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
