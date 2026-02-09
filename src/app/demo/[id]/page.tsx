'use client';

import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Product } from '@/lib/types';

export default function DemoPage() {
  const firestore = useFirestore();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];

  const productRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'products', id) : null),
    [firestore, id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

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

      <div className="relative z-10 container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Demo: {product.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Preview langsung tampilan template sebelum membeli.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/produk/${product.id}`}>Kembali ke Detail</Link>
            </Button>
            {demoUrl && (
              <Button asChild>
                <a href={demoUrl} target="_blank" rel="noreferrer">Buka Demo</a>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {demoUrl ? (
            <>
              <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-background/60 shadow-lg">
                <iframe
                  src={demoUrl}
                  title={`Demo ${product.name}`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="fullscreen"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Jika demo tidak tampil karena pembatasan browser, gunakan tombol "Buka Demo".
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center bg-background/60">
              <h2 className="text-xl font-semibold">Demo belum tersedia</h2>
              <p className="text-muted-foreground mt-2">
                Silakan kembali ke detail template untuk informasi lebih lanjut.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/produk/${product.id}`}>Kembali ke Detail</Link>
              </Button>
            </div>
          )}
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
  );
}
