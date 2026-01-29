'use client';
import Link from 'next/link';
import {
  LayoutGrid,
  ShoppingCart,
  Settings,
  LogOut,
  CodeXml,
  Archive,
  LayoutDashboard,
  Ticket,
  Gift,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const mainNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/products', label: 'Manajemen Produk', icon: Archive },
  { href: '/admin/landing-page', label: 'Landing Page', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Transaksi', icon: ShoppingCart },
  { href: '/admin/vouchers', label: 'Manajemen Voucher', icon: Ticket },
  { href: '/admin/referrals', label: 'Manajemen Referral', icon: Gift },
];

const systemNavItems = [{ href: '/admin/settings', label: 'Pengaturan', icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CodeXml className="h-6 w-6 text-primary" />
          <span>CheatTech</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4 px-4">
        <div className="space-y-4">
          <div>
            <h3 className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Menu Utama
            </h3>
            <div className="mt-2 grid items-start text-sm font-medium">
              {mainNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    {
                      'bg-muted text-primary': pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)),
                    }
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Sistem
            </h3>
            <div className="mt-2 grid items-start text-sm font-medium">
              {systemNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    {
                      'bg-muted text-primary': pathname === item.href,
                    }
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:text-primary"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-auto border-t p-4">
         <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150?u=admin"} alt="@admin" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{user?.displayName || 'Admin CheatTech'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
         </div>
      </div>
    </aside>
  );
}
