'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Image from "next/image";
import successAsset from "../../../assets/success.png";

export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { mode?: string; orderId?: string };
}) {
  const mode = searchParams?.mode === 'assisted' ? 'assisted' : 'self';
  const orderId = searchParams?.orderId;

  const waMessage = `Halo admin, saya sudah bayar untuk order ${orderId ?? '-'} dan memilih setup dibantu. Mohon dibantu proses setup-nya ya.`;
  const waLink = buildWhatsAppLink({ message: waMessage });

  const isAssisted = mode === 'assisted';

  return (
    <div className="relative overflow-hidden bg-[#000C26]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(64% 90% at 100% 30%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 36%, rgba(255,255,255,0) 68%)",
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-14">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto w-full max-w-[300px]">
            <Image
              src={successAsset}
              alt="Success icon"
              className="h-auto w-full"
              priority
            />
          </div>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#8ad7ff] sm:text-5xl">
            Pesanan Berhasil!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            {isAssisted
              ? 'Pembayaran sukses. Silakan hubungi admin agar setup segera dieksekusi.'
              : 'Detail pesanan dan instruksi selanjutnya telah dikirimkan ke alamat email Anda. Mohon periksa folder inbox dan spam Anda.'}
          </p>

          <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3">
            {isAssisted && (
              <Button
                asChild
                className="h-12 rounded-full border border-white/40 bg-white/18 text-lg font-semibold text-white hover:bg-white/26"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> Chat Admin untuk Setup
                </a>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border border-white/30 bg-white/18 text-lg font-semibold text-white hover:bg-white/26 hover:text-white"
            >
              <Link href="/">Kembali ke Halaman Utama</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
