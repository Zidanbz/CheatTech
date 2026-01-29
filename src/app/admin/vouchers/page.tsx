'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Loader2,
  Ticket,
  Percent,
  Tag,
  Trash2,
  FileEdit,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/admin/stat-card';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Voucher } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function VouchersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const vouchersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'vouchers') : null),
    [firestore]
  );
  const { data: vouchers, isLoading } = useCollection<Voucher>(vouchersQuery);

  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = async (voucherId: string, newStatus: boolean) => {
    if (!firestore) return;
    const voucherRef = doc(firestore, 'vouchers', voucherId);
    try {
      updateDocumentNonBlocking(voucherRef, { isActive: newStatus });
      toast({
        title: "Status Diperbarui",
        description: `Voucher telah ditandai sebagai ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
      });
    } catch (error) {
      console.error("Error updating voucher status:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui status voucher.",
      });
    }
  };

  const filteredVouchers = useMemo(() => {
    if (!vouchers) return [];
    return vouchers.filter((voucher) =>
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vouchers, searchTerm]);

  const stats = useMemo(() => {
    const total = vouchers?.length || 0;
    const active = vouchers?.filter((v) => v.isActive).length || 0;
    return { total, active };
  }, [vouchers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Voucher</h1>
          <p className="text-muted-foreground">
            Buat dan kelola kode diskon untuk pelanggan Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vouchers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Voucher
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Voucher"
          value={stats.total.toString()}
          icon={<Ticket className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Voucher Aktif"
          value={stats.active.toString()}
          icon={<Percent className="h-6 w-6 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari kode voucher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Voucher</TableHead>
                <TableHead>Tipe Diskon</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Tanggal Kedaluwarsa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{voucher.code}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{voucher.discountType}</TableCell>
                    <TableCell>
                      {voucher.discountType === 'percentage'
                        ? `${voucher.discountValue}%`
                        : `Rp ${voucher.discountValue.toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell>
                      {format(voucher.expiryDate.toDate(), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={voucher.isActive}
                        onCheckedChange={(newStatus) =>
                          handleStatusChange(voucher.id, newStatus)
                        }
                      />
                    </TableCell>
                     <TableCell>
                      <div className="flex items-center gap-0">
                        <Button variant="ghost" size="icon">
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit Voucher</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus Voucher</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-48">
                    Belum ada voucher. <Link href="/admin/vouchers/new" className="text-primary underline">Buat voucher baru</Link>.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
