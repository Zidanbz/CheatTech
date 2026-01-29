'use client';

import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';
import { updateProductAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { CardContent } from '@/components/ui/card';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  headline: z.string().min(1, "Headline tidak boleh kosong"),
  subheadline: z.string().min(1, "Subheadline tidak boleh kosong"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  price: z.coerce.number().min(0, "Harga harus positif"),
  features: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function ProductForm({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name || '',
      headline: product.headline || '',
      subheadline: product.subheadline || '',
      description: product.description || '',
      price: product.price || 0,
      features: product.features?.join(', ') || '',
    },
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    startTransition(async () => {
      const result = await updateProductAction(product.id, formData);
      if (result?.error) {
        toast({
          title: 'Error',
          description: `Gagal memperbarui: ${JSON.stringify(result.error)}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sukses',
          description: 'Produk berhasil diperbarui.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headline</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subheadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-headline</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl><Textarea {...field} rows={5} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (IDR)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fitur</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormDescription>Pisahkan setiap fitur dengan koma (,).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}
