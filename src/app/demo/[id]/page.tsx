'use client';

import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';

export default function DemoPage() {
  const firestore = useFirestore();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];

  const productRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'products', id) : null),
    [firestore, id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);
  const [iframeFailed, setIframeFailed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-semibold">Demo Tidak Ditemukan</h2>
        <p className="text-muted-foreground mt-2">Template tidak tersedia atau sudah dihapus.</p>
        <Button asChild className="mt-6">
          <Link href="/produk">Kembali ke Semua Template</Link>
        </Button>
      </div>
    );
  }

  const demoUrl = product.demoUrl?.trim();
  const showInteractiveDemo = Boolean(demoUrl) && !iframeFailed;

  return (
    <div className="bg-transparent">
      <div className="container pb-16 md:pb-20">
        <div className="inline-flex items-center rounded-full bg-white/35 px-5 py-1.5 text-sm font-semibold text-[#000c26] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          Demo
        </div>

        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[#000c26] md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/85 md:text-lg">
          Jelajahi semua template portofolio profesional kami yang siap pakai.
        </p>

        <div className="mt-10 overflow-hidden rounded-[18px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-[16/9] w-full">
            {showInteractiveDemo ? (
              <iframe
                src={demoUrl}
                title={`Demo ${product.name}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setIframeFailed(true)}
              />
            ) : (
              <Image
                src={product.imageUrl}
                alt={`Preview ${product.name}`}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                data-ai-hint="website preview"
                priority
              />
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-white/35 bg-white/15 px-10 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <Link href={`/produk/${product.id}`}>Kembali ke Produk</Link>
          </Button>
          {demoUrl && (
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-white/35 bg-white/15 px-10 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <a href={demoUrl} target="_blank" rel="noreferrer">
                Buka Demo
              </a>
            </Button>
          )}
        </div>

        {!showInteractiveDemo && (
          <p className="mt-5 text-center text-sm text-white/80">
            {demoUrl
              ? "Demo interaktif tidak bisa ditampilkan di halaman ini. Coba tombol 'Buka Demo'."
              : 'Demo belum tersedia untuk template ini.'}
          </p>
        )}
      </div>
    </div>
  );
}
