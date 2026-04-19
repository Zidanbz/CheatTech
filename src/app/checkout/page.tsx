"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  email: z.string().email({ message: "Harap masukkan alamat email yang valid." }),
  fulfillmentMode: z.enum(['self', 'assisted']).default('self'),
});

function CheckoutView() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementsChecked, setRequirementsChecked] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  useEffect(() => {
    async function getProduct() {
        if (!firestore || !productId) {
            setIsLoadingProduct(false);
            return;
        };

        const docRef = doc(firestore, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
            toast({
                title: "Produk Tidak Ditemukan",
                description: "Sepertinya produk yang ingin Anda beli tidak ada.",
                variant: "destructive"
            });
            router.push('/produk');
        }
        setIsLoadingProduct(false);
    }
    if (firestore) {
      getProduct();
    }
  }, [firestore, productId, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      fulfillmentMode: 'self',
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (product?.requirements && product.requirements.length > 0 && !requirementsChecked) {
      toast({
        title: "Persyaratan Belum Dipenuhi",
        description: "Harap konfirmasi bahwa Anda memenuhi semua persyaratan sebelum melanjutkan.",
        variant: "destructive"
      });
      return;
    }
    if (!product || !firestore || !user) {
        toast({
            title: "Error",
            description: "Informasi produk, koneksi database, atau sesi pengguna tidak tersedia. Coba lagi nanti.",
            variant: "destructive"
        });
        return;
    }

    try {
      setIsSubmitting(true);
      const token = user ? await user.getIdToken() : null;

      const response = await fetch('/api/midtrans/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: product.id,
          customerName: values.name,
          customerEmail: values.email,
          fulfillmentMode: values.fulfillmentMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Gagal membuat transaksi Midtrans.' }));
        toast({
          title: 'Gagal Membuat Pembayaran',
          description: error.message || 'Silakan coba lagi.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const { redirectUrl } = await response.json();
      if (!redirectUrl) {
        toast({
          title: 'Gagal Membuat Pembayaran',
          description: 'URL pembayaran tidak tersedia.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      router.push(redirectUrl);
    } catch (e) {
      console.error('Gagal membuat pesanan:', e);
      toast({
        title: 'Terjadi Kesalahan',
        description: 'Gagal membuat transaksi Midtrans. Silakan coba lagi.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || isLoadingProduct) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!productId) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <h2 className="text-2xl font-semibold">Tidak Ada Produk Dipilih</h2>
        <p className="text-muted-foreground mt-2">Silakan pilih template terlebih dahulu untuk melanjutkan.</p>
        <Button asChild className="mt-6">
            <Link href="/produk">Lihat Semua Template</Link>
        </Button>
      </div>
     )
  }
  
  if (!product) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          {/* This state is handled by the redirect in useEffect, but adding a fallback UI */}
          <p>Mengarahkan Anda kembali...</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <div className="rounded-[26px] border border-white/60 bg-[#b8e7ff]/70 px-8 py-7 shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
            <h1 className="text-2xl font-semibold text-[#000c26]">Checkout</h1>
            <p className="mt-2 text-sm text-slate-600">
              Selesaikan pesanan Anda dengan mengisi formulir di bawah ini.
            </p>

            <div className="mt-7">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-[#000c26]">
                          Nama Lengkap
                        </FormLabel>
                        <FormControl>
	                          <Input
	                            placeholder="Contoh: Budi Santoso"
	                            className="h-11 rounded-full border border-slate-500/35 bg-transparent px-5 text-slate-700 placeholder:text-slate-500 focus-visible:ring-[#000c26]/20"
	                            {...field}
	                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-[#000c26]">
                          Email
                        </FormLabel>
                        <FormControl>
	                          <Input
	                            placeholder="Contoh: budi.santoso@gmail.com"
	                            className="h-11 rounded-full border border-slate-500/35 bg-transparent px-5 text-slate-700 placeholder:text-slate-500 focus-visible:ring-[#000c26]/20"
	                            {...field}
	                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {product.requirements && product.requirements.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-[#000c26]">
                        Persyaratan Pembelian
                      </p>
                      <ul className="mt-3 space-y-1.5 pl-5 text-sm text-slate-600">
                        {product.requirements.map((requirement, index) => (
                          <li key={`${requirement}-${index}`} className="list-disc">
                            {requirement}
                          </li>
                        ))}
                      </ul>

                      <label
                        className="mt-4 flex items-center gap-3 text-sm text-red-500"
                        htmlFor="requirements-confirmation"
                      >
                        <Checkbox
                          id="requirements-confirmation"
                          checked={requirementsChecked}
                          onCheckedChange={(value) => setRequirementsChecked(value === true)}
                          className="border-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                        />
                        Saya memenuhi semua persyaratan di atas
                      </label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="mt-6 w-full rounded-full border border-[#000c26]/75 bg-[linear-gradient(90deg,#dcdedf_0%,#c0d5e0_50%,#a1cae0_100%)] text-base font-semibold text-[#000c26] shadow-[0_18px_45px_rgba(15,23,42,0.12)] hover:bg-[linear-gradient(90deg,#d7d9db_0%,#bbd0db_50%,#9bc3db_100%)]"
                    disabled={
                      isSubmitting ||
                      !user ||
                      (product.requirements && product.requirements.length > 0 && !requirementsChecked)
                    }
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Bayar
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-[26px] border border-white/60 bg-[#b8e7ff]/70 px-8 py-7 shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
            <h2 className="text-2xl font-semibold text-[#000c26]">
              Ringkasan Pesanan
            </h2>
            <div className="mt-3 h-px w-full bg-slate-700/70" />

            <div className="mt-4 flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-slate-700">{product.name}</p>
                {product.headline?.trim() && (
                  <p className="text-sm text-slate-600">{product.headline}</p>
                )}
              </div>
              <p className="text-base font-semibold text-[#000c26]">
                Rp{product.price.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="mt-4 h-px w-full bg-slate-700/70" />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-base font-semibold text-[#000c26]">Total :</p>
              <p className="text-base font-semibold text-[#000c26]">
                Rp{product.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-sm text-xs text-slate-600">
            Dengan mengklik tombol bayar, Anda menyetujui Syarat dan Ketentuan kami.
            Anda akan diarahkan ke halaman pembayaran setelah ini.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <CheckoutView />
        </Suspense>
    );
}
