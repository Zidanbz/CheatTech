'use client';
import Link from 'next/link';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users2,
  Settings,
  LogOut,
  CodeXml,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/firebase';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CodeXml className="h-6 w-6 text-primary" />
          <span>PortofolioKu</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
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
        </div>
      </nav>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => auth.signOut()}>
            <LogOut className="h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
