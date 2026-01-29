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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  email: z.string().email({ message: "Harap masukkan alamat email yang valid." }),
});

const defaultProductData: Omit<Product, 'id' | 'active'> & { active: boolean } = {
    name: "Template Portfolio Instan",
    headline: "Buat Kesan Pertama yang Tak Terlupakan",
    subheadline: "Tingkatkan personal branding Anda dengan template portfolio yang modern, profesional, dan mudah disesuaikan. Dapatkan pekerjaan impian Anda sekarang!",
    description: "Buat portfolio profesional dalam hitungan menit dengan template siap pakai kami. Dirancang untuk mahasiswa dan fresh graduate untuk memamerkan proyek dan keterampilan mereka secara efektif.",
    features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"],
    price: 149000,
    imageUrl: "https://picsum.photos/seed/cheatsheet/1200/800",
    active: true,
};

export default function CheckoutPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function getProduct(id: string): Promise<Product> {
        if (!firestore) throw new Error("Firestore not initialized");
        const docRef = doc(firestore, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            await setDoc(docRef, defaultProductData);
            return { id, ...defaultProductData, active: true };
        }
    }
    if(firestore) {
      getProduct('main-template').then(setProduct);
    }
  }, [firestore]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!product || !firestore || !user) {
        toast({
            title: "Error",
            description: "Informasi produk, koneksi database, atau sesi pengguna tidak tersedia. Coba lagi nanti.",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
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
            await addDocumentNonBlocking(ordersCollection, orderData);
            
            // For demo purposes, let's also create a "Completed" and "Processed" order
            const randomStatus = Math.random() > 0.4 ? 'Completed' : 'Processed';
            const demoOrderData = {
              ...orderData,
              status: randomStatus as ('Completed' | 'Processed'),
              orderDate: Timestamp.fromMillis(Timestamp.now().toMillis() - 86400000 * Math.floor(Math.random() * 5) ), // random date in last 5 days
              customerName: ['Andi Pratama', 'Jessica Tan', 'Budi Wijaya', 'Sarah Amalia', 'Budi Kurniawan'][Math.floor(Math.random() * 5)],
              productName: ['Minimalist Folio', 'Creative Dev', 'Business Pro'][Math.floor(Math.random() * 3)],
            };
            await addDocumentNonBlocking(ordersCollection, demoOrderData);

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
  
  if (!product || isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending || !user}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pesan Sekarang
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
              Dengan mengklik "Pesan Sekarang", Anda menyetujui Syarat dan Ketentuan kami. Anda akan diarahkan ke halaman pembayaran setelah ini.
            </p>
        </div>
      </div>
    </div>
  );
}
