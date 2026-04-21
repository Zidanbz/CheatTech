'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Image from "next/image";
import successAsset from "../../../assets/success.png";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') === 'assisted' ? 'assisted' : 'self';
  const orderId = searchParams?.get('orderId') ?? undefined;

  const [checkoutInfo, setCheckoutInfo] = useState<{
    name?: string;
    email?: string;
    productName?: string;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    try {
      const scoped = sessionStorage.getItem(`cheattech:checkout:order:${orderId}`);
      const fallback = sessionStorage.getItem('cheattech:checkout:last');
      const raw = scoped ?? fallback;
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; email?: string; productName?: string } | null;
      if (!parsed || typeof parsed !== 'object') return;
      setCheckoutInfo({
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        email: typeof parsed.email === 'string' ? parsed.email : undefined,
        productName: typeof parsed.productName === 'string' ? parsed.productName : undefined,
      });
    } catch {
      // ignore
    }
  }, [orderId]);

  const waMessage = useMemo(() => {
    const lines = [
      `Halo admin, saya sudah selesai order.`,
      `Order ID: ${orderId ?? '-'}`,
      `Mode: ${mode === 'assisted' ? 'setup dibantu' : 'setup'}`,
      checkoutInfo?.productName ? `Produk: ${checkoutInfo.productName}` : null,
      checkoutInfo?.name ? `Nama: ${checkoutInfo.name}` : 'Nama: -',
      checkoutInfo?.email ? `Email: ${checkoutInfo.email}` : 'Email: -',
      `Mohon dibantu proses setup/penanganannya ya.`,
    ].filter(Boolean) as string[];

    return lines.join('\n');
  }, [checkoutInfo?.email, checkoutInfo?.name, checkoutInfo?.productName, mode, orderId]);

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
              ? 'Pembayaran sukses. Silakan hubungi admin agar setup segera diproses.'
              : 'Pembayaran sukses. Silakan hubungi admin untuk konfirmasi pesanan dan proses setup.'}
          </p>

          <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3">
            <Button
              asChild
              className="h-12 rounded-full border border-white/30 bg-[linear-gradient(90deg,#26c6ff_0%,#4f8bff_50%,#7c4dff_100%)] text-lg font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.32)] hover:brightness-110"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Chat WhatsApp (Auto Pesan)
              </a>
            </Button>
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
