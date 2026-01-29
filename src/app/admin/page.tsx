'use client';
import StatCard from '@/components/admin/stat-card';
import OrdersTable from '@/components/admin/orders-table';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order, Product } from '@/lib/types';
import {
  WalletCards,
  ShoppingBag,
  PackageCheck,
  Hourglass,
  Loader2,
} from 'lucide-react';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null),
    [firestore]
  );
  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const stats = useMemo(() => {
    if (!orders || !products) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeProducts: 0,
        pendingOrders: 0,
      };
    }

    const totalRevenue = orders
      .filter((order) => order.status === 'Completed')
      .reduce((acc, order) => acc + order.price, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === 'Pending'
    ).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeProducts: products.length,
      pendingOrders,
    };
  }, [orders, products]);

  const isLoading = isLoadingOrders || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Penjualan"
          value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
          icon={<WalletCards className="h-6 w-6 text-muted-foreground" />}
          change="+12.5%"
        />
        <StatCard
          title="Total Order"
          value={stats.totalOrders.toString()}
          icon={<ShoppingBag className="h-6 w-6 text-muted-foreground" />}
          change="+8.2%"
        />
        <StatCard
          title="Produk Aktif"
          value={stats.activeProducts.toString()}
          icon={<PackageCheck className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Order Pending"
          value={stats.pendingOrders.toString()}
          icon={<Hourglass className="h-6 w-6 text-muted-foreground" />}
          change="High"
          changeColor="text-yellow-500"
        />
      </div>
      <OrdersTable orders={orders || []} />
    </div>
  );
}
