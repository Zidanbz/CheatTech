'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Palette, LayoutTemplate, Zap, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from "@/lib/types";

const featureDetails = {
  "Desain Modern & Responsif": {
    icon: Palette,
    description: "Tampil memukau di semua perangkat, dari desktop hingga ponsel. Desain kami mengikuti tren terkini untuk memastikan portofolio Anda terlihat profesional dan menarik."
  },
  "Mudah Disesuaikan": {
    icon: LayoutTemplate,
    description: "Ubah warna, font, dan tata letak dengan mudah tanpa perlu pengetahuan koding. Sesuaikan template untuk mencerminkan kepribadian unik Anda."
  },
  "SEO-Friendly": {
    icon: Zap,
    description: "Struktur kode yang dioptimalkan untuk mesin pencari membantu portofolio Anda lebih mudah ditemukan di Google, membuka lebih banyak peluang."
  },
  "Dukungan Penuh": {
    icon: ShieldCheck,
    description: "Kami menyediakan panduan lengkap dan dukungan pelanggan untuk membantu Anda setiap saat. Anda tidak akan pernah sendirian dalam proses ini."
  }
};


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const resolvedParams = React.use(params as unknown as Promise<{ id: string }>);
  const id = resolvedParams.id;

  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', id) : null),
    [firestore, id]
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
    <div className="relative overflow-hidden">
      <div className="ct-site-bg" aria-hidden="true">
        <div className="ct-site-gradient" />
        <div className="ct-site-grid" />
        <div className="ct-site-orb ct-site-orb-1" />
        <div className="ct-site-orb ct-site-orb-2" />
        <div className="ct-site-prism ct-site-prism-1" />
        <div className="ct-site-prism ct-site-prism-2" />
        <div className="ct-site-ring ct-site-ring-1" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:px-6 md:py-16">
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
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/checkout?productId=${product.id}`}>Beli Sekarang</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href={`/demo/${product.id}`}>Lihat Demo</Link>
              </Button>
            </div>
            {product.requirements && product.requirements.length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Persyaratan Sebelum Membeli</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {product.requirements.map((requirement, index) => (
                    <li key={`${requirement}-${index}`} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                      <span className="text-yellow-500">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Fitur yang Mengubah Permainan</h2>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl/relaxed">
                  Jelajahi fungsionalitas canggih yang membuat template kami menjadi pilihan terbaik.
              </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
              {product.features.map(feature => {
                  const details = featureDetails[feature as keyof typeof featureDetails];
                  const Icon = details?.icon || CheckCircle;
                  return (
                      <div key={feature} className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold">{feature}</h3>
                              <p className="text-muted-foreground mt-2">{details?.description || "Deskripsi detail fitur akan muncul di sini."}</p>
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ct-site-bg {
          position: absolute;
          inset: -120px;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          perspective: 1200px;
        }

        .ct-site-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 60% at 20% 20%, rgba(56, 189, 248, 0.2), transparent 70%),
            radial-gradient(50% 50% at 80% 30%, rgba(34, 197, 94, 0.14), transparent 70%),
            radial-gradient(60% 60% at 30% 80%, rgba(59, 130, 246, 0.18), transparent 70%);
          opacity: 0.9;
        }

        .ct-site-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.75), transparent 70%);
          opacity: 0.35;
        }

        .ct-site-orb {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(59, 130, 246, 0.35) 45%, rgba(14, 165, 233, 0.12) 70%);
          box-shadow: 0 40px 120px rgba(14, 165, 233, 0.22);
          transform-style: preserve-3d;
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        .ct-site-orb-1 {
          width: 360px;
          height: 360px;
          top: -160px;
          right: -120px;
          animation: ct-site-float 14s ease-in-out infinite;
        }

        .ct-site-orb-2 {
          width: 260px;
          height: 260px;
          bottom: -140px;
          left: -80px;
          animation: ct-site-float 16s ease-in-out infinite reverse;
        }

        .ct-site-prism {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(148, 163, 184, 0.35), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 45px 90px rgba(15, 23, 42, 0.2);
          transform-style: preserve-3d;
          backdrop-filter: blur(2px);
          opacity: 0.75;
        }

        .ct-site-prism::before {
          content: '';
          position: absolute;
          inset: 14px;
          border-radius: 22px;
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.5), rgba(59, 130, 246, 0.08));
          transform: translateZ(-28px);
          opacity: 0.7;
        }

        .ct-site-prism-1 {
          top: 140px;
          left: 6%;
          animation: ct-site-tilt 18s ease-in-out infinite;
        }

        .ct-site-prism-2 {
          bottom: 120px;
          right: 8%;
          width: 220px;
          height: 220px;
          animation: ct-site-tilt 22s ease-in-out infinite reverse;
        }

        .ct-site-ring {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 9999px;
          border: 2px solid rgba(59, 130, 246, 0.25);
          box-shadow: inset 0 0 40px rgba(14, 165, 233, 0.2);
          transform: rotateX(68deg) rotateZ(25deg);
          opacity: 0.6;
          animation: ct-site-spin 26s linear infinite;
        }

        .ct-site-ring-1 {
          top: 42%;
          right: 28%;
        }

        @keyframes ct-site-float {
          0% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translate3d(0, -24px, 10px) rotateX(12deg) rotateY(18deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
          }
        }

        @keyframes ct-site-tilt {
          0% {
            transform: rotateX(12deg) rotateY(-18deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotateX(22deg) rotateY(8deg) translate3d(0, -18px, 12px);
          }
          100% {
            transform: rotateX(12deg) rotateY(-18deg) translate3d(0, 0, 0);
          }
        }

        @keyframes ct-site-spin {
          0% {
            transform: rotateX(68deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(68deg) rotateZ(360deg);
          }
        }

        @media (max-width: 768px) {
          .ct-site-orb-1 {
            width: 240px;
            height: 240px;
            top: -120px;
            right: -140px;
          }

          .ct-site-orb-2 {
            width: 200px;
            height: 200px;
            bottom: -120px;
            left: -120px;
          }

          .ct-site-prism {
            width: 200px;
            height: 200px;
          }

          .ct-site-ring {
            width: 220px;
            height: 220px;
            right: 12%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ct-site-orb,
          .ct-site-prism,
          .ct-site-ring {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
