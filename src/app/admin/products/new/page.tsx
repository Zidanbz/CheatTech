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
import { useFirestore, useStorage } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadString } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  features: z.array(z.string().min(3, "Setiap fitur harus diisi.")).max(4, "Maksimal 4 fitur."),
  active: z.boolean().default(true),
  // imageUrl is handled separately via imagePreview state, not direct form input
});


export default function NewProductPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      headline: '',
      subheadline: '',
      price: 49000,
      description: '',
      features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"],
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
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Koneksi database tidak tersedia.' });
      return;
    }
    if (!imagePreview) {
      toast({ variant: 'destructive', title: 'Gambar Diperlukan', description: 'Harap unggah gambar thumbnail untuk produk.' });
      return;
    }

    startTransition(async () => {
      try {
        // 1. Upload image to Firebase Storage
        const filePath = `products/${Date.now()}-${values.name.replace(/\s+/g, '-')}`;
        const fileRef = storageRef(storage, filePath);
        await uploadString(fileRef, imagePreview, 'data_url');
        const imageUrl = await getDownloadURL(fileRef);

        // 2. Prepare product data with the new image URL
        const newProduct: Omit<Product, 'id'> = {
          ...values,
          imageUrl: imageUrl,
        };

        // 3. Save product data to Firestore
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
                        name={`features.${index}`}
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
                    <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Fitur
                    </Button>
                  )}
                </div>

                <FormItem>
                  <FormLabel>Thumbnail Produk</FormLabel>
                  <FormControl>
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Pratinjau gambar" fill className="object-contain h-32 rounded-md p-2" />
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
                  <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Produk
                </Button>
              </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
