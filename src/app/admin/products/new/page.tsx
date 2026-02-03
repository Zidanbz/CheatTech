'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { useFirestore, useStorage, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadString } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2, UploadCloud, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk harus lebih dari 3 karakter.' }),
  headline: z.string().min(10, { message: 'Headline harus lebih dari 10 karakter.' }),
  subheadline: z.string().min(10, { message: 'Sub-headline harus lebih dari 10 karakter.' }),
  price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif.' }),
  description: z.string().min(10, { message: 'Deskripsi harus memiliki setidaknya 10 karakter.' }),
  features: z.array(
    z.object({
      value: z.string().min(3, "Setiap fitur harus diisi."),
    })
  ).max(4, "Maksimal 4 fitur."),
  active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof formSchema>;

function getSubmitErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: string }).code;
    if (code === 'storage/unauthorized') {
      return 'Akses upload ditolak. Pastikan akun admin dan field isAdmin di users/{uid} bernilai true.';
    }
    if (code === 'storage/retry-limit-exceeded') {
      return 'Upload gagal karena koneksi tidak stabil. Coba lagi beberapa saat.';
    }
    if (code === 'permission-denied') {
      return 'Tidak punya izin menyimpan produk. Pastikan akun admin sudah benar.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Terjadi kesalahan saat menyimpan produk. Coba lagi.';
}

export default function NewProductPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitStep, setSubmitStep] = useState<'idle' | 'uploading' | 'saving'>('idle');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      headline: '',
      subheadline: '',
      price: 49000,
      description: '',
      features: [
        { value: "Desain Modern & Responsif" },
        { value: "Mudah Disesuaikan" },
        { value: "SEO-Friendly" },
        { value: "Dukungan Penuh" },
      ],
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features"
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const timeout = (ms: number) => new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Operasi timeout')), ms));

  async function onSubmit(values: ProductFormData) {
    console.log('onSubmit called with values:', values);
    if (!firestore || !storage) {
      console.log('Firestore or storage not available');
      toast({ variant: 'destructive', title: 'Error', description: 'Koneksi database tidak tersedia.' });
      return;
    }
    if (!imagePreview) {
      console.log('No image preview');
      toast({ variant: 'destructive', title: 'Gambar Diperlukan', description: 'Harap unggah gambar thumbnail untuk produk.' });
      return;
    }

    console.log('Setting isSubmitting to true');
    setIsSubmitting(true);
    try {
      setSubmitStep('uploading');
      const filePath = `products/${Date.now()}-${values.name.replace(/\s+/g, '-')}`;
      console.log('File path:', filePath);
      const fileRef = storageRef(storage, filePath);
      console.log('Starting upload...');
      await Promise.race([uploadString(fileRef, imagePreview, 'data_url'), timeout(60000)]);
      console.log('Upload completed, getting download URL...');
      const imageUrl = await (Promise.race([getDownloadURL(fileRef), timeout(30000)]) as Promise<string>);
      console.log('Download URL obtained:', imageUrl);

      setSubmitStep('saving');
      const newProduct: Omit<Product, 'id'> = {
        ...values,
        features: values.features.map((feature) => feature.value),
        imageUrl: imageUrl,
      };
      console.log('New product data:', newProduct);

      console.log('Adding document non-blocking...');
      addDocumentNonBlocking(collection(firestore, 'products'), newProduct);

      console.log('Toast success and redirect');
      toast({
        title: 'Produk Ditambahkan',
        description: `"${values.name}" telah berhasil disimpan.`,
      });
      router.push('/admin/products');
    } catch (error: unknown) {
      console.error('Error in onSubmit:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: getSubmitErrorMessage(error),
      });
    } finally {
      console.log('Finally: setting isSubmitting to false');
      setIsSubmitting(false);
      setSubmitStep('idle');
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="p-6 grid gap-6">
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
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline</FormLabel>
                      <FormControl>
                        <Input placeholder="Headline utama untuk produk" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Textarea placeholder="Deskripsi singkat yang tampil di bawah nama produk" {...field} />
                      </FormControl>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Lengkap Produk</FormLabel>
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

                <div className="space-y-4">
                  <FormLabel>Fitur Unggulan (Maksimal 4)</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`features.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder={`Fitur ${index + 1}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {fields.length < 4 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Fitur
                    </Button>
                  )}
                </div>

                <FormItem>
                  <FormLabel>Thumbnail Produk</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                        {imagePreview ? (
                          <Image src={imagePreview} alt="Pratinjau gambar" fill className="object-contain rounded-md p-2" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klik untuk upload</span> atau tarik gambar ke sini</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WebP (Maks. 5MB)</p>
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
            </Card>
            <div className="flex justify-end gap-2 mt-8">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? (submitStep === 'uploading' ? 'Mengunggah...' : 'Menyimpan...') : 'Simpan Produk'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
