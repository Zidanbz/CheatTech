'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { useToast } from '@/hooks/use-toast';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  updateDocumentNonBlocking,
  useStorage,
  useCollection,
} from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadString } from 'firebase/storage';
import { useState, useTransition, useEffect } from 'react';
import { Loader2, PlusCircle, Trash2, UploadCloud } from 'lucide-react';
import type { LandingPage, Product } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
  DEFAULT_SHOWCASE_CATEGORIES,
  PRODUCT_CATEGORIES,
  findProductCategoryBySlug,
  normalizeLandingPageShowcaseCategories,
} from '@/lib/product-categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AUTO_SHOWCASE_PRODUCT_VALUE = '__auto__';

const formSchema = z.object({
  heroHeadline: z.string().min(10, { message: 'Headline minimal 10 karakter.' }),
  heroSubheadline: z.string().min(20, { message: 'Sub-headline minimal 20 karakter.' }),
  heroImageUrl: z.string().url({ message: 'URL gambar tidak valid.' }),
  problemHeadline: z.string().min(1, 'Judul harus diisi.'),
  problemText: z.string().min(1, 'Teks harus diisi.'),
  featuresSectionBadge: z.string().min(1, 'Badge harus diisi.'),
  featuresSectionHeadline: z.string().min(1, 'Judul harus diisi.'),
  featuresSectionSubheadline: z.string().min(1, 'Sub-headline harus diisi.'),
  features: z.array(
    z.object({
      title: z.string().min(1, 'Judul fitur harus diisi.'),
      description: z.string().min(1, 'Deskripsi fitur harus diisi.'),
    })
  ).max(3, 'Maksimal 3 fitur.'),
  stepsSectionHeadline: z.string().min(1, 'Judul harus diisi.'),
  stepsSectionSubheadline: z.string().min(1, 'Sub-headline harus diisi.'),
  steps: z.array(
    z.object({
      title: z.string().min(1, 'Judul langkah harus diisi.'),
      description: z.string().min(1, 'Deskripsi langkah harus diisi.'),
    })
  ).max(3, 'Maksimal 3 langkah.'),
  testimonialsSectionHeadline: z.string().min(1, 'Judul harus diisi.'),
  testimonials: z.array(
    z.object({
      name: z.string().min(1, 'Nama harus diisi.'),
      role: z.string().min(1, 'Peran harus diisi.'),
      quote: z.string().min(1, 'Kutipan harus diisi.'),
      avatar: z.string().url('URL avatar tidak valid.'),
    })
  ),
  showcaseCategories: z.array(
    z.object({
      categorySlug: z.string().min(1, 'Kategori utama harus dipilih.'),
      label: z.string().min(1, 'Label kategori harus diisi.'),
      imageHint: z.string().min(1, 'Hint gambar harus diisi.'),
      productId: z.string(),
    })
  ).length(4, 'Kategori unggulan harus berjumlah 4 item.'),
});

const defaultContent: Omit<LandingPage, 'id'> = {
  heroHeadline:
    'Website Portofolio Mahasiswa, <span class="text-primary">Siap Online</span> dalam 10 Menit',
  heroSubheadline:
    'Tingkatkan personal branding kamu dan pikat HRD dengan website profesional tanpa perlu belajar coding yang rumit.',
  heroImageUrl: 'https://picsum.photos/seed/hero-image/600/400',
  problemHeadline: 'Kenapa Sulit Dapat Kerja?',
  problemText:
    'Ratusan lamaran kerja terkirim, namun tak ada panggilan? Mungkin bukan skill kamu yang kurang, tapi cara kamu menampilkannya. Di era digital yang kompetitif ini, CV statis saja tidak akan membuatmu dilirik. Kamu butuh sebuah panggung—sebuah portofolio online profesional—untuk membuktikan kemampuanmu dan bersinar di antara kandidat lain.',
  featuresSectionBadge: 'KEUNTUNGAN',
  featuresSectionHeadline: 'Kenapa Harus Template Ini?',
  featuresSectionSubheadline:
    'Desain premium dengan harga mahasiswa. Dibuat khusus untuk kebutuhan karirmu.',
  features: [
    {
      title: 'Tampil Profesional',
      description:
        'Desain bersih dan modern yang membuatmu terlihat lebih kredibel dan "mahal" di mata HRD atau klien potensial.',
    },
    {
      title: 'Setup Mudah & Cepat',
      description:
        'Integrasi mudah dengan Notion atau text file, tidak perlu pusing coding, cukup fokus pada isi konten portofoliomu.',
    },
    {
      title: 'SEO Friendly',
      description:
        'Struktur kode yang optimal agar namamu mudah ditemukan di halaman pertama Google saat recruiter mencarimu.',
    },
  ],
  stepsSectionHeadline: 'Hanya 3 Langkah Mudah',
  stepsSectionSubheadline:
    'Siapapun bisa melakukannya, bahkan jika kamu baru pertama kali membuat website.',
  steps: [
    {
      title: 'Pilih & Beli',
      description:
        'Pilih template yang kamu suka, lakukan pembayaran, dan dapatkan akses file selamanya.',
    },
    {
      title: 'Deploy ke Vercel',
      description:
        'Hubungkan akun Github kamu ke Vercel, klik deploy, dan website live dalam hitungan detik.',
    },
    {
      title: 'Edit & Online',
      description:
        'Ubah teks dan foto sesuai keinginanmu lewat file config yang simpel. Selesai!',
    },
  ],
  testimonialsSectionHeadline: 'Kata Mereka',
  testimonials: [
    {
      name: 'Sarah Amalia',
      role: 'Mahasiswa DKV, Bandung',
      quote:
        'Baru lulus kemarin bingung mau apply di banyak portofolio sama HRD. Untung ada simple web, jadi pake template ini. Tampilannya pro banget, HRD langsung interest.',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
    },
    {
      name: 'Andi Pratama',
      role: 'Fresh Graduate IT, Jakarta',
      quote:
        '"Investasi terbaik 49rb seumur hidup. Template-nya ciamik, loading wush wush, SEO nya juga oke, nama saya muncul di Google."',
      avatar: 'https://i.pravatar.cc/150?u=andi',
    },
    {
      name: 'Jessica Tan',
      role: 'Content Writer, Surabaya',
      quote:
        '"Awalnya ragu, tapi setelah coba, ternyata gampang banget pakenya. Gak perlu pusing ngoding, tinggal ganti teks dan gambar. Thanks CheatTech!"',
      avatar: 'https://i.pravatar.cc/150?u=jessica',
    },
  ],
  showcaseCategories: DEFAULT_SHOWCASE_CATEGORIES,
};

export default function LandingPageManagementPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const pageRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'landingPage', 'main') : null),
    [firestore]
  );
  const { data: pageContent, isLoading: isLoadingContent } =
    useDoc<LandingPage>(pageRef);
  const productsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products } = useCollection<Product>(productsRef);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultContent,
  });
  
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: 'features' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control: form.control, name: 'steps' });
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({ control: form.control, name: 'testimonials' });
  const { fields: showcaseCategoryFields } = useFieldArray({
    control: form.control,
    name: 'showcaseCategories',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "File terlalu besar",
          description: "Ukuran file maksimal 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // We don't set the form value directly with the data URL anymore
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const initializeContent = async () => {
      if (firestore && !isLoadingContent) {
        if (pageContent) {
          form.reset({
            ...defaultContent,
            ...pageContent,
            showcaseCategories: normalizeLandingPageShowcaseCategories(
              pageContent.showcaseCategories
            ),
          });
          if (pageContent.heroImageUrl) {
            setImagePreview(pageContent.heroImageUrl);
          }
        } else {
          try {
            await setDoc(doc(firestore, 'landingPage', 'main'), defaultContent);
            form.reset(defaultContent);
            toast({
              title: 'Inisialisasi Konten',
              description: 'Konten landing page default telah dibuat.',
            });
          } catch (error) {
            console.error('Gagal membuat konten default:', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Gagal membuat konten landing page default.',
            });
          }
        }
      }
    };
    initializeContent();
  }, [firestore, pageContent, isLoadingContent, form, toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!pageRef || !storage) return;
    startTransition(async () => {
      try {
        let finalImageUrl = pageContent?.heroImageUrl || '';

        // Only upload if the preview is a data URL (meaning a new file was selected)
        if (imagePreview && imagePreview.startsWith('data:image')) {
          const filePath = `landing-page/hero-${Date.now()}`;
          const fileRef = storageRef(storage, filePath);
          await uploadString(fileRef, imagePreview, 'data_url');
          finalImageUrl = await getDownloadURL(fileRef);
        }
        
        const updatedValues = {
          ...values,
          heroImageUrl: finalImageUrl,
        };

        updateDocumentNonBlocking(pageRef, updatedValues);
        
        toast({
          title: 'Tersimpan!',
          description: 'Perubahan pada landing page telah disimpan.',
        });
      } catch (error) {
        console.error('Gagal memperbarui landing page:', error);
        toast({
          variant: 'destructive',
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat memperbarui landing page.',
        });
      }
    });
  }

  const sortedProducts = [...(products ?? [])].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    return a.name.localeCompare(b.name, 'id');
  });
  
  if (isLoadingContent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Landing Page</h1>
        <p className="text-muted-foreground mt-1">
          Ubah konten yang tampil di halaman utama website.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Accordion type="multiple" defaultValue={['hero']} className="w-full space-y-4">
            
            <Card>
              <AccordionItem value="hero" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle>Bagian Hero</CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6">
                    <div className="space-y-6">
                      <FormField
                          control={form.control}
                          name="heroHeadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Headline Utama</FormLabel>
                              <FormControl>
                                <Input placeholder="Headline utama landing page..." {...field} />
                              </FormControl>
                              <FormDescription>
                                Gunakan tag &lt;span class="text-primary"&gt;...&lt;/span&gt; untuk memberi warna pada teks.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="heroSubheadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sub-headline</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Tulis sub-headline yang menarik..." className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="heroImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gambar Hero</FormLabel>
                              <FormControl>
                                <div className="flex items-center justify-center w-full">
                                  <label
                                    htmlFor="dropzone-file"
                                    className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50"
                                  >
                                    {imagePreview ? (
                                      <>
                                        <Image
                                          src={imagePreview}
                                          alt="Pratinjau gambar"
                                          fill
                                          className="object-contain rounded-md p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                          <p className="text-white text-center">
                                            Klik atau tarik gambar untuk mengganti
                                          </p>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                          <span className="font-semibold">Klik untuk upload</span> atau
                                          tarik gambar ke sini
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          PNG, JPG, WebP (Maks. 2MB)
                                        </p>
                                      </div>
                                    )}
                                    <input
                                      id="dropzone-file"
                                      type="file"
                                      className="hidden"
                                      onChange={handleFileChange}
                                      accept="image/png, image/jpeg, image/webp"
                                    />
                                  </label>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Ganti gambar utama yang tampil di halaman depan.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="problem" className="border-b-0">
                <AccordionTrigger className="p-6"><CardTitle>Bagian "Kenapa Sulit Dapat Kerja?"</CardTitle></AccordionTrigger>
                <AccordionContent className="px-6">
                  <div className="space-y-6">
                    <FormField control={form.control} name="problemHeadline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="problemText" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teks Paragraf</FormLabel>
                          <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="features" className="border-b-0">
                <AccordionTrigger className="p-6"><CardTitle>Bagian Keuntungan (Fitur)</CardTitle></AccordionTrigger>
                <AccordionContent className="px-6">
                    <div className="space-y-6">
                      <FormField control={form.control} name="featuresSectionBadge" render={({ field }) => (<FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="featuresSectionHeadline" render={({ field }) => (<FormItem><FormLabel>Judul</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="featuresSectionSubheadline" render={({ field }) => (<FormItem><FormLabel>Sub-headline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="space-y-4">
                        <FormLabel>Daftar Fitur (Maksimal 3)</FormLabel>
                        {featureFields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                              <div className="space-y-2">
                                <FormField control={form.control} name={`features.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Judul Fitur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`features.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Deskripsi Fitur</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                              </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="showcaseCategories" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle>Bagian Kategori Template Terbaik</CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  <div className="space-y-6">
                    <div>
                      <FormLabel>Template unggulan per kategori</FormLabel>
                      <FormDescription>
                        Atur label kategori dan produk yang tampil di 4 kartu kategori pada halaman utama.
                      </FormDescription>
                    </div>

                    {showcaseCategoryFields.map((showcaseField, index) => {
                      const selectedSlug = form.watch(
                        `showcaseCategories.${index}.categorySlug`
                      );
                      const categoryPreset =
                        findProductCategoryBySlug(selectedSlug) ??
                        PRODUCT_CATEGORIES[index] ??
                        PRODUCT_CATEGORIES[0];

                      return (
                        <Card key={showcaseField.id} className="p-4">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Kartu kategori {index + 1}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Pengunjung akan diarahkan ke halaman produk kategori {categoryPreset.label}.
                              </p>
                            </div>

                            <FormField
                              control={form.control}
                              name={`showcaseCategories.${index}.categorySlug`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kategori utama</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      const matchedCategory = PRODUCT_CATEGORIES.find(
                                        (category) => category.slug === value
                                      );
                                      field.onChange(value);
                                      if (!matchedCategory) {
                                        return;
                                      }
                                      form.setValue(
                                        `showcaseCategories.${index}.label`,
                                        matchedCategory.label,
                                        { shouldDirty: true }
                                      );
                                      form.setValue(
                                        `showcaseCategories.${index}.imageHint`,
                                        matchedCategory.imageHint,
                                        { shouldDirty: true }
                                      );
                                    }}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {PRODUCT_CATEGORIES.map((category) => (
                                        <SelectItem
                                          key={category.slug}
                                          value={category.slug}
                                        >
                                          {category.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`showcaseCategories.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Label yang tampil</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Contoh: Portofolio"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Teks ini tampil di badge tengah kartu kategori.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`showcaseCategories.${index}.productId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Produk yang ditampilkan</FormLabel>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(
                                        value === AUTO_SHOWCASE_PRODUCT_VALUE
                                          ? ''
                                          : value
                                      )
                                    }
                                    value={
                                      field.value || AUTO_SHOWCASE_PRODUCT_VALUE
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih produk" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={AUTO_SHOWCASE_PRODUCT_VALUE}>
                                        Pilih otomatis sesuai kategori
                                      </SelectItem>
                                      {sortedProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                          {product.name}
                                          {product.active ? '' : ' (Nonaktif)'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Jika kosong, sistem akan memilih produk aktif pertama yang cocok dengan kategori. Produk nonaktif tidak akan tampil di homepage.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`showcaseCategories.${index}.imageHint`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hint gambar</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Contoh: portfolio website"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Dipakai sebagai hint internal untuk gambar kartu kategori.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="steps" className="border-b-0">
                <AccordionTrigger className="p-6"><CardTitle>Bagian 3 Langkah Mudah</CardTitle></AccordionTrigger>
                <AccordionContent className="px-6">
                    <div className="space-y-6">
                        <FormField control={form.control} name="stepsSectionHeadline" render={({ field }) => (<FormItem><FormLabel>Judul</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="stepsSectionSubheadline" render={({ field }) => (<FormItem><FormLabel>Sub-headline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="space-y-4">
                          <FormLabel>Daftar Langkah (Maksimal 3)</FormLabel>
                           {stepFields.map((field, index) => (
                              <Card key={field.id} className="p-4">
                                <FormLabel>Langkah {index + 1}</FormLabel>
                                <div className="space-y-2 mt-2">
                                  <FormField control={form.control} name={`steps.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Judul</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                  <FormField control={form.control} name={`steps.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                              </Card>
                          ))}
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

             <Card>
              <AccordionItem value="testimonials" className="border-b-0">
                <AccordionTrigger className="p-6"><CardTitle>Bagian Testimoni</CardTitle></AccordionTrigger>
                <AccordionContent className="px-6">
                  <div className="space-y-6">
                    <FormField control={form.control} name="testimonialsSectionHeadline" render={({ field }) => (<FormItem><FormLabel>Judul</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <FormLabel>Daftar Testimoni</FormLabel>
                         <Button size="sm" variant="outline" type="button" onClick={() => appendTestimonial({ name: '', role: '', quote: '', avatar: 'https://i.pravatar.cc/150?u=new' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Testimoni
                          </Button>
                      </div>
                       {testimonialFields.map((field, index) => (
                          <Card key={field.id} className="p-4 relative">
                             <Button size="icon" variant="ghost" type="button" className="absolute top-2 right-2 text-destructive" onClick={() => removeTestimonial(index)}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                            <div className="space-y-2 mt-2">
                              <FormField control={form.control} name={`testimonials.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name={`testimonials.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Peran / Jabatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name={`testimonials.${index}.quote`} render={({ field }) => (<FormItem><FormLabel>Kutipan</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name={`testimonials.${index}.avatar`} render={({ field }) => (<FormItem><FormLabel>URL Avatar</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </Card>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

          </Accordion>
          
          <div className="flex justify-end">
             <Button type="submit" disabled={isPending || isLoadingContent}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Semua Perubahan
              </Button>
          </div>
        </form>
      </Form>

    </div>
  );
}
