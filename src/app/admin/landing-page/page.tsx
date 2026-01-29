'use client';

import { useForm } from 'react-hook-form';
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
import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import type { LandingPage } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateHeadlineSuggestions } from '@/ai/flows/generate-headline-suggestions';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  heroHeadline: z.string().min(10, { message: 'Headline minimal 10 karakter.' }),
  heroSubheadline: z.string().min(20, { message: 'Sub-headline minimal 20 karakter.' }),
});

const defaultContent = {
  heroHeadline:
    'Website Portofolio Mahasiswa, <span class="text-primary">Siap Online</span> dalam 10 Menit',
  heroSubheadline:
    'Tingkatkan personal branding kamu dan pikat HRD dengan website profesional tanpa perlu belajar coding yang rumit.',
};

export default function LandingPageManagementPage() {
  const firestore = useFirestore();
  const router = useRouter();
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
        const currentHeadline = form.getValues('heroHeadline').replace(/<[^>]*>?/gm, ''); // remove html tags
        const productDescription = "Template website portofolio untuk mahasiswa dan fresh graduate untuk meningkatkan personal branding dan memikat HRD.";
        
        const result = await generateHeadlineSuggestions({
            currentHeadline,
            productDescription,
        });
        setSuggestions(result.suggestedHeadlines);
    } catch (error) {
        console.error("Gagal membuat saran:", error);
        toast({ variant: 'destructive', title: 'Gagal Membuat Saran', description: 'Terjadi kesalahan dari AI.' });
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
          <Card>
            <CardHeader>
              <CardTitle>Bagian Hero</CardTitle>
              <CardDescription>
                Konten utama yang dilihat pengunjung pertama kali saat mengunjungi website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingContent ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="heroHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline Utama</FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input placeholder="Headline utama landing page..." {...field} />
                          </FormControl>
                           <Button type="button" variant="outline" onClick={handleGenerateSuggestions} disabled={isGenerating}>
                              <Wand2 className="mr-0 md:mr-2 h-4 w-4" />
                              <span className='hidden md:inline'>{isGenerating ? 'Membuat...' : 'Beri Ide'}</span>
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
                          <Textarea
                            placeholder="Tulis sub-headline yang menarik..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending || isLoadingContent}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      <Dialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Saran Headline dari AI</DialogTitle>
                <DialogDescription>Klik salah satu untuk menggunakannya. Anda bisa menambahkan tag span secara manual nanti.</DialogDescription>
            </DialogHeader>
            <div className='py-4'>
            {isGenerating ? (
              <div className='flex items-center justify-center'>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
                <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <Button variant="outline" className="w-full h-auto text-left justify-start py-2" onClick={() => {
                                form.setValue('heroHeadline', s);
                                setShowSuggestionsDialog(false);
                            }}>{s}</Button>
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
