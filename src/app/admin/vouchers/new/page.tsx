'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import React, { useTransition } from 'react';
import { Loader2, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  code: z.string().min(5, 'Kode minimal 5 karakter.').regex(/^[A-Z0-9]+$/, 'Kode hanya boleh berisi huruf kapital dan angka.'),
  discountType: z.enum(['percentage', 'fixed'], { required_error: 'Pilih tipe diskon.' }),
  discountValue: z.coerce.number().min(0, 'Nilai diskon tidak boleh negatif.'),
  usageLimit: z.coerce.number().int().min(0, 'Limit penggunaan tidak boleh negatif.'),
  minPurchase: z.coerce.number().nonnegative('Minimal pembelian tidak boleh negatif.').optional().or(z.literal('')),
  validityPeriod: z.object({
    from: z.date({ required_error: 'Tanggal mulai harus diisi.' }),
    to: z.date({ required_error: 'Tanggal berakhir harus diisi.' }),
  }),
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
      discountValue: 0,
      usageLimit: 100,
      minPurchase: 0,
      isActive: true,
    },
  });

  function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('code', result.toUpperCase());
  }
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !values.validityPeriod.from || !values.validityPeriod.to) return;

    startTransition(() => {
      try {
        const { validityPeriod, ...rest } = values;
        const newVoucher = {
            ...rest,
            minPurchase: Number(values.minPurchase) || 0,
            startDate: Timestamp.fromDate(validityPeriod.from),
            expiryDate: Timestamp.fromDate(validityPeriod.to),
            usageCount: 0,
        };

        addDocumentNonBlocking(collection(firestore, 'vouchers'), newVoucher);
        
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
    <div className="flex justify-center items-start md:items-center py-8 px-4 min-h-full">
      <div className="w-full max-w-3xl bg-card text-card-foreground rounded-xl shadow-lg border">
        <div className="p-6 sm:p-8">
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tambah Voucher Baru</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Buat kode promo baru untuk template portofolio Anda.
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className='-mt-2 -mr-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </Button>
            </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 pt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Kode Voucher</FormLabel>
                                <FormControl>
                                <Input placeholder="PROMOSERU" {...field} />
                                </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipe Potongan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe diskon" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="percentage">Persentase (%)</SelectItem>
                                        <SelectItem value="fixed">Potongan Harga (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nilai Potongan</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                                        {discountType === 'fixed' ? 'Rp' : '%'}
                                    </span>
                                    <Input type="number" className="pl-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="usageLimit"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Limit Penggunaan</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="minPurchase"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Minimal Pembelian <span className='text-muted-foreground'>(Opsional)</span></FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">Rp</span>
                                <Input type="number" className="pl-8" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                  control={form.control}
                  name="validityPeriod"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Masa Berlaku</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "d LLL yyyy", { locale: id })} -{" "}
                                    {format(field.value.to, "d LLL yyyy", { locale: id })}
                                  </>
                                ) : (
                                  format(field.value.from, "d LLL yyyy", { locale: id })
                                )
                              ) : (
                                <span>Pilih rentang tanggal</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Pilih tanggal mulai dan berakhir voucher ini berlaku.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-blue-50/50 dark:bg-blue-900/20 p-4">
                      <div className="flex items-center gap-4">
                        <div className='p-2 bg-background rounded-full border'>
                           <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <FormLabel>Status Aktif</FormLabel>
                            <FormDescription>
                            Voucher dapat digunakan segera setelah disimpan.
                            </FormDescription>
                        </div>
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

            </div>
            <div className="p-6 sm:p-8 pt-0 flex justify-end gap-2 border-t mt-6">
                <Button variant="outline" type="button" onClick={() => router.back()}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Voucher
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
