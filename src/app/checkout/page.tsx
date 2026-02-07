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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition, useEffect, Suspense } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  email: z.string().email({ message: "Harap masukkan alamat email yang valid." }),
});

function CheckoutView() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isPending, startTransition] = useTransition();
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
    },
  });
  
  useEffect(() => {
    if (user && !user.isAnonymous) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [user, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
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

    startTransition(() => {
        try {
            const orderData = {
              customerName: values.name,
              customerEmail: values.email,
              productId: product.id,
              productName: product.name,
              price: product.price,
              orderDate: Timestamp.now(),
              userId: user.uid,
              status: 'Pending' as const,
            };
            const ordersCollection = collection(firestore, 'orders');
            addDocumentNonBlocking(ordersCollection, orderData);
            
            router.push('/sukses');
          } catch (e) {
            console.error("Gagal membuat pesanan:", e);
            toast({
              title: "Terjadi Kesalahan",
              description: "Gagal menyimpan pesanan. Silakan coba lagi.",
              variant: "destructive",
            });
          }
    });
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
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Selesaikan pesanan Anda dengan mengisi formulir di bawah ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="anda@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {product.requirements && product.requirements.length > 0 && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="text-sm font-semibold">Persyaratan Pembelian</div>
                      <ul className="space-y-2 text-sm">
                        {product.requirements.map((requirement, index) => (
                          <li key={`${requirement}-${index}`} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                            <span className="text-yellow-500">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                      <label className="flex items-center gap-2 text-sm" htmlFor="requirements-confirmation">
                        <Checkbox
                          id="requirements-confirmation"
                          checked={requirementsChecked}
                          onCheckedChange={(value) => setRequirementsChecked(value === true)}
                        />
                        Saya memenuhi semua persyaratan di atas
                      </label>
                      {!requirementsChecked && (
                        <p className="text-xs text-muted-foreground">
                          Centang untuk melanjutkan pembayaran.
                        </p>
                      )}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || !user || (product.requirements && product.requirements.length > 0 && !requirementsChecked)}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Bayar Rp{product.price.toLocaleString('id-ID')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Ringkasan Pesanan</h2>
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">{product.name}</span>
                        <span className="font-bold">Rp{product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <hr className="my-4"/>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>Rp{product.price.toLocaleString('id-ID')}</span>
                    </div>
                </CardContent>
            </Card>
            <p className="text-xs text-foreground/60">
              Dengan mengklik tombol bayar, Anda menyetujui Syarat dan Ketentuan kami. Anda akan diarahkan ke halaman pembayaran setelah ini.
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
