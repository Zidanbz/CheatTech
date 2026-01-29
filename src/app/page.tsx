'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Palette, LayoutTemplate, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const featureIcons = {
  "Desain Modern & Responsif": <Palette className="size-8 text-primary" />,
  "Mudah Disesuaikan": <LayoutTemplate className="size-8 text-primary" />,
  "SEO-Friendly": <Zap className="size-8 text-primary" />,
  "Dukungan Penuh": <ShieldCheck className="size-8 text-primary" />,
};

const defaultProductData: Omit<Product, 'id'> = {
    name: "Template Portfolio Instan",
    headline: "Buat Kesan Pertama yang Tak Terlupakan",
    subheadline: "Tingkatkan personal branding Anda dengan template portfolio yang modern, profesional, dan mudah disesuaikan. Dapatkan pekerjaan impian Anda sekarang!",
    description: "Buat portfolio profesional dalam hitungan menit dengan template siap pakai kami. Dirancang untuk mahasiswa dan fresh graduate untuk memamerkan proyek dan keterampilan mereka secara efektif.",
    features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"],
    price: 149000,
    imageUrl: "https://picsum.photos/seed/cheatsheet/1200/800",
};

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    async function getProduct(id: string): Promise<Product> {
        const docRef = doc(firestore, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            await setDoc(docRef, defaultProductData);
            console.log(`Default product created with ID: ${id}`);
            return { id, ...defaultProductData };
        }
    }

    if (firestore) {
      setIsLoading(true);
      getProduct('main-template').then(p => {
        setProduct(p);
        setIsLoading(false);
      });
    }
  }, [firestore]);

  const productImage = PlaceHolderImages.find(p => p.id === 'product-template-preview');

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  {product.headline}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  {product.subheadline}
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/checkout">Beli Sekarang</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/produk">Lihat Demo</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {productImage && (
                  <Image
                    src={productImage.imageUrl}
                    width={600}
                    height={400}
                    alt="Product preview"
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                    data-ai-hint={productImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Fitur Utama</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Dapatkan Keunggulan Kompetitif</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Template kami dirancang untuk membantu Anda tampil menonjol dan mendapatkan pekerjaan impian Anda.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2">
              {product.features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {featureIcons[feature as keyof typeof featureIcons] || <CheckCircle className="size-8 text-primary" />}
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{feature}</h3>
                    <p className="text-sm text-foreground/80">
                      Deskripsi singkat tentang bagaimana fitur ini memberikan manfaat luar biasa bagi pengguna.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing/CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Mulai Karir Anda Hari Ini</h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Investasi kecil untuk masa depan besar. Dapatkan template portofolio Anda sekarang.
              </p>
            </div>
            <Card className="max-w-sm mx-auto">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>Semua yang Anda butuhkan dalam satu paket.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="text-4xl font-bold">
                  Rp{product.price.toLocaleString('id-ID')}
                  <span className="text-lg font-normal text-foreground/70"> /sekali bayar</span>
                </div>
                <ul className="grid gap-2 text-left text-sm">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/checkout">Beli Sekarang</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
