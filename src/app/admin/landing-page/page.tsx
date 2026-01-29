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
} from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState, useTransition, useEffect } from 'react';
import { Loader2, Wand2, PlusCircle, Trash2 } from 'lucide-react';
import type { LandingPage } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateHeadlineSuggestions } from '@/ai/flows/generate-headline-suggestions';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  heroHeadline: z.string().min(10, { message: 'Headline minimal 10 karakter.' }),
  heroSubheadline: z.string().min(20, { message: 'Sub-headline minimal 20 karakter.' }),
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
});

const defaultContent: Omit<LandingPage, 'id'> = {
  heroHeadline:
    'Website Portofolio Mahasiswa, <span class="text-primary">Siap Online</span> dalam 10 Menit',
  heroSubheadline:
    'Tingkatkan personal branding kamu dan pikat HRD dengan website profesional tanpa perlu belajar coding yang rumit.',
  problemHeadline: 'Kenapa Sulit Dapat Kerja?',
  problemText:
    'Lamar kerja ratusan kali tapi tidak dipanggil? Mungkin CV kamu kurang menarik. Di era digital yang kompetitif ini, sekadar CV PDF tidak cukup. Kamu butuh portofolio online yang hidup untuk menvalidasi skill dan membedakan dirimu dari kandidat lain.',
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
        '"Awalnya ragu, tapi setelah coba, ternyata gampang banget pakenya. Gak perlu pusing ngoding, tinggal ganti teks dan gambar. Thanks Portofoloku!"',
      avatar: 'https://i.pravatar.cc/150?u=jessica',
    },
  ],
};

export default function LandingPageManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const pageRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'landingPage', 'main') : null),
    [firestore]
  );
  const { data: pageContent, isLoading: isLoadingContent } =
    useDoc<LandingPage>(pageRef);

  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultContent,
  });
  
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: 'features' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control: form.control, name: 'steps' });
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({ control: form.control, name: 'testimonials' });

  useEffect(() => {
    const initializeContent = async () => {
      if (firestore && !isLoadingContent) {
        if (pageContent) {
          form.reset(pageContent);
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

  async function handleGenerateSuggestions() {
    setIsGenerating(true);
    setShowSuggestionsDialog(true);
    setSuggestions([]);
    try {
      const currentHeadline = form
        .getValues('heroHeadline')
        .replace(/<[^>]*>?/gm, ''); // remove html tags
      const productDescription =
        'Template website portofolio untuk mahasiswa dan fresh graduate untuk meningkatkan personal branding dan memikat HRD.';

      const result = await generateHeadlineSuggestions({
        currentHeadline,
        productDescription,
      });
      setSuggestions(result.suggestedHeadlines);
    } catch (error) {
      console.error('Gagal membuat saran:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Saran',
        description: 'Terjadi kesalahan dari AI.',
      });
      setShowSuggestionsDialog(false);
    } finally {
      setIsGenerating(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!pageRef) return;
    startTransition(() => {
      updateDocumentNonBlocking(pageRef, values);
      toast({
        title: 'Tersimpan!',
        description: 'Perubahan pada landing page telah disimpan.',
      });
    });
  }
  
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
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input placeholder="Headline utama landing page..." {...field} />
                                </FormControl>
                                <Button type="button" variant="outline" onClick={handleGenerateSuggestions} disabled={isGenerating}>
                                  <Wand2 className="mr-0 md:mr-2 h-4 w-4" />
                                  <span className="hidden md:inline">{isGenerating ? 'Membuat...' : 'Beri Ide'}</span>
                                </Button>
                              </div>
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

      <Dialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saran Headline dari AI</DialogTitle>
            <DialogDescription>
              Klik salah satu untuk menggunakannya. Anda bisa menambahkan tag span secara manual nanti.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <Button
                      variant="outline"
                      className="w-full h-auto text-left justify-start py-2"
                      onClick={() => {
                        form.setValue('heroHeadline', s);
                        setShowSuggestionsDialog(false);
                      }}
                    >
                      {s}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
