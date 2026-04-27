'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';

const SEEN_COMPLETED_ORDER_IDS_KEY = 'cheattech:admin:seen-completed-order-ids';

function getNotificationDateLabel(orderDate?: Order['orderDate']) {
  if (!orderDate || typeof orderDate.toDate !== 'function') {
    return '-';
  }

  return orderDate.toDate().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminHeader() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState('');
  const [seenCompletedOrderIds, setSeenCompletedOrderIds] = useState<string[]>([]);
  const [hasStoredSeenIds, setHasStoredSeenIds] = useState(false);
  const hasHydratedSeenIds = useRef(false);
  const hasBootstrappedSeenIds = useRef(false);
  const initializedCompletedOrders = useRef(false);
  const lastKnownCompletedOrderIds = useRef<Set<string>>(new Set());

  const completedOrdersQuery = useMemoFirebase(
    () => (
      firestore
        ? query(collection(firestore, 'orders'), orderBy('processedAt', 'desc'), limit(25))
        : null
    ),
    [firestore]
  );
  const { data: recentOrders } = useCollection<Order>(completedOrdersQuery);

  const completedOrders = useMemo(
    () => (recentOrders ?? []).filter((order) => order.status === 'Completed'),
    [recentOrders]
  );

  const seenCompletedOrderIdsSet = useMemo(
    () => new Set(seenCompletedOrderIds),
    [seenCompletedOrderIds]
  );

  const unreadCompletedOrders = useMemo(
    () => completedOrders.filter((order) => !seenCompletedOrderIdsSet.has(order.id)),
    [completedOrders, seenCompletedOrderIdsSet]
  );

  const unreadCount = unreadCompletedOrders.length;
  const visibleNotifications = completedOrders.slice(0, 6);

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Intl.DateTimeFormat('id-ID', options).format(date));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedIds = window.localStorage.getItem(SEEN_COMPLETED_ORDER_IDS_KEY);
      if (!storedIds) {
        hasHydratedSeenIds.current = true;
        return;
      }

      setHasStoredSeenIds(true);
      const parsed = JSON.parse(storedIds);
      if (Array.isArray(parsed)) {
        setSeenCompletedOrderIds(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch (error) {
      console.warn('Failed to read seen order notifications', error);
    } finally {
      hasHydratedSeenIds.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedSeenIds.current || hasStoredSeenIds || hasBootstrappedSeenIds.current) {
      return;
    }
    if (recentOrders === null) {
      return;
    }

    const baselineIds = recentOrders
      .filter((order) => order.status === 'Completed')
      .map((order) => order.id)
      .slice(0, 200);

    setSeenCompletedOrderIds(baselineIds);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SEEN_COMPLETED_ORDER_IDS_KEY, JSON.stringify(baselineIds));
    }
    hasBootstrappedSeenIds.current = true;
  }, [hasStoredSeenIds, recentOrders]);

  const markAllNotificationsAsSeen = () => {
    if (!completedOrders.length || !hasHydratedSeenIds.current) return;

    const mergedSeenIds = Array.from(
      new Set([...seenCompletedOrderIds, ...completedOrders.map((order) => order.id)])
    ).slice(0, 200);

    setSeenCompletedOrderIds(mergedSeenIds);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SEEN_COMPLETED_ORDER_IDS_KEY, JSON.stringify(mergedSeenIds));
    }
  };

  useEffect(() => {
    if (recentOrders === null) {
      return;
    }

    const completedIds = new Set(completedOrders.map((order) => order.id));

    if (!initializedCompletedOrders.current) {
      initializedCompletedOrders.current = true;
      lastKnownCompletedOrderIds.current = completedIds;
      return;
    }

    const newCompletedOrders = completedOrders.filter(
      (order) => !lastKnownCompletedOrderIds.current.has(order.id)
    );

    if (newCompletedOrders.length > 0) {
      newCompletedOrders.forEach((order) => {
        toast({
          title: 'Order berhasil masuk',
          description: `${order.customerName} berhasil order ${order.productName}.`,
        });
      });
    }

    lastKnownCompletedOrderIds.current = completedIds;
  }, [completedOrders, recentOrders, toast]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            markAllNotificationsAsSeen();
          }
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifikasi order</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi Order Berhasil</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((order) => {
                const isUnread = !seenCompletedOrderIdsSet.has(order.id);

                return (
                  <DropdownMenuItem
                    key={order.id}
                    onSelect={(event) => event.preventDefault()}
                    className="flex flex-col items-start gap-1 py-2"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">
                        {order.customerName}
                      </span>
                      {isUnread && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      Order {order.productName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {getNotificationDateLabel(order.processedAt ?? order.orderDate)}
                    </span>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <DropdownMenuItem disabled>Belum ada order berhasil.</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                router.push('/admin/orders');
              }}
            >
              Lihat semua order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150?u=admin"} alt="@admin" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p>{user?.displayName || 'Admin Utama'}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.email || 'Super Admin'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
