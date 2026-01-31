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
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { ArrowLeft, Loader2, UploadCloud, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// This schema should cover all editable product fields
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk harus lebih dari 3 karakter.' }),
  headline: z.string().min(10, { message: 'Headline harus lebih dari 10 karakter.' }),
  subheadline: z.string().min(10, { message: 'Sub-headline harus lebih dari 10 karakter.' }),
  price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif.' }),
  description: z.string().min(10, { message: 'Deskripsi harus memiliki setidaknya 10 karakter.' }),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }),
  features: z.array(z.string().min(3, "Setiap fitur harus diisi.")).max(4, "Maksimal 4 fitur."),
  active: z.boolean().default(true),
});

export default function EditProductPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const productId = params.id as string;
  
  const productRef = useMemoFirebase(
    () => (firestore && productId ? doc(firestore, 'products', productId) : null),
    [firestore, productId]
  );
  const { data: product, isLoading: isLoadingProduct } = useDoc<Product>(productRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      headline: '',
      subheadline: '',
      price: 0,
      description: '',
      imageUrl: '',
      features: [],
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features"
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
      setImagePreview(product.imageUrl);
    }
  }, [product, form]);

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
        // In a real app, you'd upload this file to storage and get a URL.
        // For now, we're just updating the preview and assuming the URL is entered manually or already exists.
        // For simplicity, if a user uploads, we'll just keep using the preview URL locally.
        // And we'll update the form value to a placeholder, as the actual URL is what matters.
        form.setValue('imageUrl', result); // this is a base64 URL. Might be too long for firestore.
        // The original new page used a picsum url. The edit page should probably just have a URL input field.
      };
      reader.readAsDataURL(file);
    }
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!productRef) return;

    startTransition(async () => {
      try {
        await updateDocumentNonBlocking(productRef, values);
        
        toast({
          title: 'Produk Diperbarui',
          description: `"${values.name}" telah berhasil diperbarui.`,
        });
        router.push('/admin/products');
      } catch (error) {
        console.error('Gagal memperbarui produk:', error);
        toast({
          variant: 'destructive',
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat memperbarui produk.',
        });
      }
    });
  }

  if (isLoadingProduct) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
        <div className="text-center py-10">
            <p>Produk tidak ditemukan.</p>
            <Button asChild className="mt-4"><Link href="/admin/products">Kembali</Link></Button>
        </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Produk</h1>
          <p className="text-muted-foreground mt-1">
            Perbarui detail untuk template <span className="font-semibold text-foreground">{product.name}</span>.
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


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Thumbnail</FormLabel>
                        <FormControl>
                          <Input placeholder="https://images.unsplash.com/..." {...field} onChange={(e) => {
                            field.onChange(e);
                            setImagePreview(e.target.value);
                          }}/>
                        </FormControl>
                        <FormDescription>Gunakan URL gambar yang valid (misal: Unsplash, Picsum).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {imagePreview && (
                     <Image src={imagePreview} alt="Pratinjau gambar" width={160} height={120} className="object-contain h-32 rounded-md border bg-muted" />
                  )}
                </div>
                
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
                        Non-aktifkan untuk menyembunyikan produk dari landing page.
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
                  Simpan Perubahan
                </Button>
              </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
