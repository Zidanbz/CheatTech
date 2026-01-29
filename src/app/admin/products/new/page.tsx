'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';

// This schema is for form validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk harus lebih dari 3 karakter.' }),
  price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif.' }),
  demoUrl: z.string().url({ message: 'URL demo tidak valid.' }).optional().or(z.literal('')),
  description: z.string().min(10, { message: 'Deskripsi harus memiliki setidaknya 10 karakter.' }),
  imageUrl: z.string().optional(), // Will be populated by file upload placeholder
  active: z.boolean().default(true),
});

export default function NewProductPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 49000,
      demoUrl: 'https://demo.portfolio.id',
      description: '',
      imageUrl: '',
      active: true,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
         toast({
          variant: "destructive",
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Actual file upload to Firebase Storage is not implemented in this step.
        // We'll use a dynamic placeholder URL based on product name for now.
        form.setValue('imageUrl', `https://picsum.photos/seed/${form.getValues('name').replace(/\s+/g, '-') || 'new-product'}/400/300`);
      };
      reader.readAsDataURL(file);
    }
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Koneksi database tidak tersedia.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const newProduct: Omit<Product, 'id'> = {
          name: values.name,
          headline: values.name, // Use name as headline
          subheadline: values.description.substring(0, 100), // Use start of description as subheadline
          description: values.description,
          price: values.price,
          // Use the generated picsum URL or a default if empty
          imageUrl: values.imageUrl || `https://picsum.photos/seed/${values.name.replace(/\s+/g, '-')}/400/300`,
          features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"], // Default features
          active: values.active,
        };

        await addDocumentNonBlocking(collection(firestore, 'products'), newProduct);
        
        toast({
          title: 'Produk Ditambahkan',
          description: `"${values.name}" telah berhasil disimpan.`,
        });
        router.push('/admin/products');
      } catch (error) {
        console.error('Gagal menambahkan produk:', error);
        toast({
          variant: 'destructive',
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat menambahkan produk baru.',
        });
      }
    });
  }

  return (
    <div className="space-y-6 pb-8">
       <div className="flex items-center gap-4">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </Link>
      </div>

      <div className='max-w-3xl mx-auto'>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Tambah Produk Baru</h1>
          <p className="text-muted-foreground mt-1">
            Lengkapi detail template portofolio untuk dipublikasikan ke toko.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="p-6 space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Minimalist Creative Folio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga (IDR)</FormLabel>
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
                    name="demoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Demo Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://demo.portfolio.id" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Produk</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan fitur unggulan template ini..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Thumbnail Website</FormLabel>
                  <FormControl>
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Pratinjau gambar" width={160} height={120} className="object-contain h-32 rounded-md" />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                  <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik untuk upload</span> atau tarik gambar ke sini</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP maksimal 5MB (Rasio 4:3)</p>
                              </div>
                            )}
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                          </label>
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>
                          Status Aktif
                        </FormLabel>
                        <FormDescription>
                        Aktifkan untuk menampilkan produk di landing page.
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
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                      Batal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Produk
                </Button>
              </div>
            </Card>
          </form>
        </Form>
      </div>
       <footer className="text-center text-sm text-muted-foreground mt-8">
         © 2024 CheatTech Dashboard System. Dibuat untuk UMKM & Mahasiswa Indonesia.
       </footer>
    </div>
  );
}
