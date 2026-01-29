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
import { submitOrder } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { getProduct } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  email: z.string().email({ message: "Harap masukkan alamat email yang valid." }),
});

export default function CheckoutPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      const p = await getProduct('main-template');
      setProduct(p);
    }
    fetchProduct();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!product) {
        toast({
            title: "Error",
            description: "Informasi produk tidak ditemukan. Coba lagi nanti.",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      const result = await submitOrder(values, product);
      if (result.error) {
        toast({
          title: "Terjadi Kesalahan",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }
  
  if (!product) {
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
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
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
