'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  Gift,
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
import type { Referral } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const getStatusBadge = (status: Referral['status']) => {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">{status}</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">{status}</Badge>;
    case 'Canceled':
       return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}


export default function ReferralsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const referralsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'referrals'), orderBy('referralDate', 'desc')) : null),
    [firestore]
  );
  const { data: referrals, isLoading } = useCollection<Referral>(referralsQuery);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredReferrals = useMemo(() => {
    if (!referrals) return [];
    return referrals.filter((referral) =>
      referral.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [referrals, searchTerm]);

  const stats = useMemo(() => {
    const total = referrals?.length || 0;
    const completed = referrals?.filter((v) => v.status === 'Completed').length || 0;
    const totalCommission = referrals
      ?.filter((v) => v.status === 'Completed')
      .reduce((sum, v) => sum + v.commission, 0) || 0;
    return { total, completed, totalCommission };
  }, [referrals]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Referral</h1>
          <p className="text-muted-foreground">
            Lacak dan kelola program referral Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/referrals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Referral
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Referral"
          value={stats.total.toString()}
          icon={<Users className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Referral Sukses"
          value={stats.completed.toString()}
          icon={<CheckCircle2 className="h-6 w-6 text-muted-foreground" />}
        />
         <StatCard
          title="Total Komisi"
          value={`Rp ${stats.totalCommission.toLocaleString('id-ID')}`}
          icon={<Gift className="h-6 w-6 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama perujuk atau email..."
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
                <TableHead>Perujuk (Referrer)</TableHead>
                <TableHead>Direferensikan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Komisi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(referral.referrerName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{referral.referrerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{referral.referredEmail}</div>
                    </TableCell>
                    <TableCell>
                      {format(referral.referralDate.toDate(), 'd MMM yyyy', {locale: indonesiaLocale})}
                    </TableCell>
                    <TableCell className='font-medium'>
                      Rp {referral.commission.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(referral.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    Belum ada data referral. <Link href="/admin/referrals/new" className="text-primary underline">Buat data baru</Link>.
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
