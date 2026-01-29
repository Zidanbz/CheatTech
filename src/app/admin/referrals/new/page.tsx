'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { Loader2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Referral } from '@/lib/types';

const formSchema = z.object({
  referrerName: z.string().min(2, 'Nama perujuk harus diisi.'),
  referredEmail: z.string().email('Email yang dirujuk tidak valid.'),
  commission: z.coerce.number().min(0, 'Komisi tidak boleh negatif.'),
  status: z.enum(['Pending', 'Completed', 'Canceled'], { required_error: 'Pilih status referral.' }),
});

export default function NewReferralPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referrerName: '',
      referredEmail: '',
      commission: 10000,
      status: 'Pending',
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;

    startTransition(async () => {
      try {
        const newReferral: Omit<Referral, 'id'> = {
            ...values,
            referrerId: user.uid, // Assume the admin creating this is the referrer for simplicity
            referralDate: Timestamp.now(),
        };

        await addDocumentNonBlocking(collection(firestore, 'referrals'), newReferral);
        
        toast({
          title: 'Referral Ditambahkan',
          description: `Referral untuk ${values.referredEmail} telah berhasil dibuat.`,
        });
        router.push('/admin/referrals');
      } catch (error) {
        console.error('Gagal menambahkan referral:', error);
        toast({
          variant: 'destructive',
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat menambahkan referral baru.',
        });
      }
    });
  }

  return (
    <div className="space-y-6 pb-8">
       <div className="flex items-center gap-4">
        <Link href="/admin/referrals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Manajemen Referral
        </Link>
      </div>

      <div className='max-w-xl mx-auto'>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Tambah Data Referral</h1>
          <p className="text-muted-foreground mt-1">
            Lengkapi detail untuk mencatat referral baru.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="p-6 border rounded-lg bg-card space-y-6">
                <FormField
                    control={form.control}
                    name="referrerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nama Perujuk (Referrer)</FormLabel>
                            <FormControl>
                            <Input placeholder="Contoh: Budi Santoso" {...field} />
                            </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="referredEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email yang Direferensikan</FormLabel>
                            <FormControl>
                            <Input type='email' placeholder="user.baru@example.com" {...field} />
                            </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="commission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Komisi (IDR)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">Rp</span>
                            <Input type="number" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status Referral</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Referral
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
