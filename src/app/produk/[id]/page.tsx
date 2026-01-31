'use client';

import { Button } from "@/components/ui/button";
import { CheckCircle, Palette, LayoutTemplate, Zap, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from "@/lib/types";

const featureDetails = {
  "Desain Modern & Responsif": {
    icon: <Palette className="h-10 w-10 text-primary" />,
    description: "Tampil memukau di semua perangkat, dari desktop hingga ponsel. Desain kami mengikuti tren terkini untuk memastikan portofolio Anda terlihat profesional dan menarik."
  },
  "Mudah Disesuaikan": {
    icon: <LayoutTemplate className="h-10 w-10 text-primary" />,
    description: "Ubah warna, font, dan tata letak dengan mudah tanpa perlu pengetahuan koding. Sesuaikan template untuk mencerminkan kepribadian unik Anda."
  },
  "SEO-Friendly": {
    icon: <Zap className="h-10 w-10 text-primary" />,
    description: "Struktur kode yang dioptimalkan untuk mesin pencari membantu portofolio Anda lebih mudah ditemukan di Google, membuka lebih banyak peluang."
  },
  "Dukungan Penuh": {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    description: "Kami menyediakan panduan lengkap dan dukungan pelanggan untuk membantu Anda setiap saat. Anda tidak akan pernah sendirian dalam proses ini."
  }
};


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', params.id) : null),
    [firestore, params.id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <h2 className="text-2xl font-semibold">Produk Tidak Ditemukan</h2>
        <p className="text-muted-foreground mt-2">Produk yang Anda cari tidak ada atau mungkin telah dihapus.</p>
        <Button asChild className="mt-6">
            <Link href="/produk">Lihat Semua Template</Link>
        </Button>
      </div>
     )
  }
  
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-4">
             <div className="aspect-video overflow-hidden rounded-xl border-2 border-primary/20 shadow-lg">
                 <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={1200}
                    height={800}
                    className="object-cover w-full h-full"
                    data-ai-hint="portfolio website"
                  />
            </div>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold font-headline sm:text-4xl">{product.name}</h1>
          <p className="text-foreground/80 text-lg">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-primary">Rp{product.price.toLocaleString('id-ID')}</span>
            <span className="text-sm text-foreground/60">Pembayaran sekali seumur hidup</span>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/checkout?productId=${product.id}`}>Beli Sekarang</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Fitur yang Mengubah Permainan</h2>
            <p className="max-w-2xl mx-auto mt-4 text-foreground/80 md:text-xl/relaxed">
                Jelajahi fungsionalitas canggih yang membuat template kami menjadi pilihan terbaik.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
            {product.features.map(feature => {
                const details = featureDetails[feature as keyof typeof featureDetails];
                return (
                    <div key={feature} className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">{details?.icon || <CheckCircle className="h-10 w-10 text-primary"/>}</div>
                        <div>
                            <h3 className="text-xl font-bold">{feature}</h3>
                            <p className="text-foreground/70 mt-2">{details?.description || "Deskripsi detail fitur akan muncul di sini."}</p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  )
}
