'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Star } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Product } from "@/lib/types";
import ProductCard from '@/components/products/product-card';

const REVIEW_COUNT_LABEL = '1.2k Reviews';
const DEFAULT_RATING = 5.0;
const RATING_COLOR = '#f3a84f';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const firestore = useFirestore();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', id) : null),
    [firestore, id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'products'), where('active', '==', true))
        : null,
    [firestore]
  );
  const { data: products } = useCollection<Product>(productsQuery);

  const relatedProducts = React.useMemo(() => {
    if (!products?.length) return [];
    return products.filter((item) => item.id !== id).slice(0, 3);
  }, [products, id]);

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
  
  const images = [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
  ];
  const activeImage = images[Math.min(activeImageIndex, images.length - 1)]!;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[radial-gradient(70%_80%_at_25%_10%,#e9f8ff_0%,#cfefff_42%,#ffffff_80%)]">
        <div className="container py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[26px] border-4 border-[#000c26] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                  data-ai-hint="portfolio website"
                  priority
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 md:gap-6">
                {images.slice(1, 4).map((src, index) => {
                  const effectiveIndex = index + 1;
                  const isActive = activeImageIndex === effectiveIndex;
                  return (
                    <button
                      key={`thumb-${effectiveIndex}`}
                      type="button"
                      onClick={() => setActiveImageIndex(effectiveIndex)}
                      className="group text-left"
                    >
                      <div
                        className={`relative aspect-[16/10] overflow-hidden rounded-[22px] border-4 border-[#000c26] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:-translate-y-0.5 ${
                          isActive ? 'ring-2 ring-[#000c26]/70 ring-offset-4 ring-offset-white' : ''
                        }`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 18vw, 30vw"
                          className="object-cover"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[#000c26]">
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: RATING_COLOR }}>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`rating-star-${index}`} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span>{DEFAULT_RATING.toFixed(1)}</span>
                <span>[{REVIEW_COUNT_LABEL}]</span>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-semibold text-slate-600 md:text-5xl">
                  Rp{product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-base text-slate-700">
                  / Pembayaran sekali seumur hidup
                </span>
              </div>

              <div className="mt-8 rounded-[26px] bg-[#f3f3f3] px-7 py-7 shadow-[0_28px_70px_rgba(15,23,42,0.12)] md:px-8">
                <h2 className="text-xl font-semibold">Deskripsi</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
                  {product.description}
                </p>

                {product.requirements && product.requirements.length > 0 && (
                  <>
                    <h3 className="mt-6 text-lg font-semibold">
                      Persyaratan Sebelum Membeli
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700 md:text-base">
                      {product.requirements.map((requirement, index) => (
                        <li key={`${requirement}-${index}`} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 h-5 w-5 text-slate-600" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#000c26] px-10 text-base font-semibold text-white shadow-[0_18px_45px_rgba(0,12,38,0.22)] hover:bg-[#071a43]"
                >
                  <Link href={`/checkout?productId=${product.id}`}>Beli Sekarang</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-2 border-[#000c26] bg-transparent px-10 text-base font-semibold text-[#000c26] hover:bg-[#000c26]/5 hover:text-[#000c26]"
                >
                  <Link href={`/demo/${product.id}`}>Lihat Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#000c26] py-16 md:py-20">
        <div className="container">
          <h2 className="text-center text-4xl font-semibold tracking-tight text-[#9ed9ff] md:text-5xl">
            Fitur yang Dimiliki
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
            {(product.features?.length ? product.features : ['Fitur 1', 'Fitur 2', 'Fitur 3', 'Fitur 4'])
              .slice(0, 4)
              .map((feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="min-h-[140px] rounded-[26px] bg-[#2f3a4e] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                >
                  <div className="h-full px-6 py-7 text-white/80">
                    <p className="text-lg font-semibold text-white">{feature}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Detail fitur akan tampil di sini sesuai kebutuhan template.
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container">
          <h2 className="text-3xl font-semibold tracking-tight text-[#000c26] md:text-4xl">
            Rating &amp; Reviews
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-[26px] bg-[#f3f3f3] px-7 py-8 shadow-[0_20px_55px_rgba(15,23,42,0.10)] md:px-10">
              <div className="grid gap-8 md:grid-cols-[0.42fr_0.58fr] md:items-start">
                <div>
                  <div className="text-7xl font-semibold tracking-tight text-[#000c26]">
                    5,0
                  </div>
                  <p className="mt-3 text-base text-slate-600">[{REVIEW_COUNT_LABEL}]</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 5, value: 92 },
                    { label: 4, value: 6 },
                    { label: 3, value: 2 },
                    { label: 2, value: 0 },
                    { label: 1, value: 0 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="flex w-10 items-center gap-1 text-slate-700">
                        <Star className="h-4 w-4 fill-current" style={{ color: RATING_COLOR }} />
                        <span className="text-sm font-medium">{row.label}</span>
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-white/80">
                        <div
                          className="h-2 rounded-full bg-[#000c26]"
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[26px] bg-[#f3f3f3] px-7 py-8 shadow-[0_20px_55px_rgba(15,23,42,0.10)] md:px-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                    <Image
                      src="https://i.pravatar.cc/96?u=cheattech-review-1"
                      alt="Sarah Amalia"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#000c26]">
                      Sarah Amalia
                    </p>
                    <div className="mt-1 flex items-center" style={{ color: RATING_COLOR }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={`review-star-${index}`} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500">15 Desember 2025</p>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-600 md:text-base">
                Baru lulus kemarin bingung mau apply di banyak portofolio sama HRD.
                Untung ada template ini. Tampilannya pro banget, HRD langsung
                interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-6 md:pb-28">
        <div className="container">
          <h2 className="text-center text-4xl font-semibold tracking-tight text-[#000c26] md:text-5xl">
            Kamu Mungkin Juga{' '}
            <span className="font-serif italic text-[#000c26]">Suka</span> Ini
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {relatedProducts.length > 0
              ? relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))
              : Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`related-skeleton-${index}`}
                    className="rounded-[28px] bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.10)]"
                  >
                    <div className="aspect-[4/3] w-full rounded-[22px] bg-slate-100" />
                    <div className="mt-6 space-y-3">
                      <div className="h-5 w-4/5 rounded bg-slate-100" />
                      <div className="h-4 w-full rounded bg-slate-100" />
                      <div className="h-4 w-11/12 rounded bg-slate-100" />
                      <div className="mt-4 flex items-end justify-between">
                        <div className="h-9 w-28 rounded-full bg-slate-100" />
                        <div className="h-5 w-24 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
