'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  Filter,
  Search,
  WalletCards,
  PackageCheck,
  Hourglass,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/admin/stat-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Completed</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">Pending</Badge>;
    case 'Processed':
       return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100/80">Processed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};


export default function OrdersPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null),
    [firestore]
  );

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const stats = useMemo(() => {
    if (!orders) {
      return { totalRevenue: 0, completedOrders: 0, pendingOrders: 0 };
    }
    const totalRevenue = orders
      .filter((order) => order.status === 'Completed')
      .reduce((sum, order) => sum + order.price, 0);
    const completedOrders = orders.filter((order) => order.status === 'Completed').length;
    const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
    return { totalRevenue, completedOrders, pendingOrders };
  }, [orders]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, currentPage]);
  
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Pesanan</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau transaksi masuk secara real-time.
          </p>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Penjualan"
          value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
          icon={<WalletCards className="h-6 w-6 text-muted-foreground" />}
          change="+12.5%"
        />
        <StatCard
          title="Pesanan Selesai"
          value={stats.completedOrders.toString()}
          icon={<PackageCheck className="h-6 w-6 text-muted-foreground" />}
           change="+8.2%"
        />
        <StatCard
          title="Pesanan Pending"
          value={stats.pendingOrders.toString()}
          icon={<Hourglass className="h-6 w-6 text-muted-foreground" />}
          change="-1.5%"
          changeColor='text-red-500'
        />
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pesanan..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pembeli</TableHead>
                <TableHead>Produk yang Dibeli</TableHead>
                <TableHead>Tanggal Transaksi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <div className="flex justify-center items-center">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(order.customerName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.productName}</div>
                      <div className="text-sm text-muted-foreground">ID: #{order.id.substring(0, 8).toUpperCase()}</div>
                    </TableCell>
                    <TableCell>
                      {order.orderDate.toDate().toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Detail</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    Tidak ada pesanan ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Menampilkan {paginatedOrders.length > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0}-
              {Math.min(currentPage * ordersPerPage, filteredOrders.length)} dari {filteredOrders.length} pesanan
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((p) => (
                <Button
                  key={p}
                  variant={currentPage === p ? 'default' : 'outline'}
                  size="sm"
                  className="w-9"
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
