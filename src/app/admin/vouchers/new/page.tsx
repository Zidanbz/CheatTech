'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, Loader2, CalendarIcon, Percent, Tag } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  code: z.string().min(5, { message: 'Kode minimal 5 karakter.' }).regex(/^[A-Z0-9]+$/, 'Kode hanya boleh berisi huruf kapital dan angka.'),
  discountType: z.enum(['percentage', 'fixed'], { required_error: 'Pilih tipe diskon.' }),
  discountValue: z.coerce.number().positive({ message: 'Nilai diskon harus positif.' }),
  expiryDate: z.date({ required_error: 'Tanggal kedaluwarsa harus diisi.' }),
  isActive: z.boolean().default(true),
}).refine(data => !(data.discountType === 'percentage' && data.discountValue > 100), {
  message: 'Diskon persentase tidak boleh lebih dari 100.',
  path: ['discountValue'],
});

export default function NewVoucherPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
    },
  });

  function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('code', result);
  }
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    startTransition(async () => {
      try {
        const newVoucher = {
          ...values,
          expiryDate: Timestamp.fromDate(values.expiryDate),
          usageCount: 0,
        };

        await addDocumentNonBlocking(collection(firestore, 'vouchers'), newVoucher);
        
        toast({
          title: 'Voucher Dibuat',
          description: `Voucher dengan kode "${values.code}" telah berhasil ditambahkan.`,
        });
        router.push('/admin/vouchers');
      } catch (error) {
        console.error('Gagal menambahkan voucher:', error);
        toast({
          variant: 'destructive',
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat menambahkan voucher baru.',
        });
      }
    });
  }

  const discountType = form.watch('discountType');

  return (
    <div className="space-y-6 pb-8">
       <Link href="/admin/vouchers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
         <ArrowLeft className="h-4 w-4" />
         Kembali ke Manajemen Voucher
       </Link>

      <div className='max-w-2xl'>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Buat Voucher Baru</h1>
          <p className="text-muted-foreground mt-1">
            Konfigurasi detail kode diskon yang ingin Anda tawarkan.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Voucher</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Contoh: DISKONBARU" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={generateRandomCode}>Generate</Button>
                      </div>
                      <FormDescription>Kode unik yang akan digunakan pelanggan (huruf kapital dan angka).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipe Diskon</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="percentage" />
                            </FormControl>
                            <FormLabel className="font-normal">Persentase</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixed" />
                            </FormControl>
                            <FormLabel className="font-normal">Potongan Harga Tetap</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Diskon</FormLabel>
                       <FormControl>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                {discountType === 'fixed' ? (
                                    <span className="text-muted-foreground sm:text-sm">Rp</span>
                                ) : (
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <Input type="number" className={cn(discountType === 'fixed' ? 'pl-8' : 'pl-9')} {...field} />
                            {discountType === 'percentage' && (
                               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">%</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Kedaluwarsa</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Aktifkan Voucher</FormLabel>
                        <FormDescription>
                          Jika aktif, voucher bisa langsung digunakan pelanggan.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

              </CardContent>
               <div className="p-6 pt-0 flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => router.back()}>Batal</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Voucher
                  </Button>
              </div>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
