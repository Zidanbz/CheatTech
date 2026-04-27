import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function Footer() {
  const contactHref = buildWhatsAppLink({
    message: "Halo CheatTech, saya ingin konsultasi tentang template dan layanan website.",
  });

  return (
    <footer className="relative overflow-x-hidden bg-[linear-gradient(90deg,#2f4c69_0%,#a1e0ff_55%,#edf8fe_100%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[#000c26]"
      />

      <div className="container pb-10 pt-8 md:pt-10">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-14">
          <div className="max-w-sm text-white">
            <h3 className="text-2xl font-semibold tracking-tight">CheatTech</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Platform penyedia template website portofolio berkualitas untuk
              talenta digital Indonesia.
            </p>

            <div className="mt-10">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur">
                © {new Date().getFullYear()} CheatTech. All rights reserved.
              </div>
            </div>
          </div>

          <div className="text-white md:text-[#001b3c]">
            <h4 className="text-sm font-semibold tracking-wide">Produk</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/produk"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Semua Template
                </Link>
              </li>
              <li>
                <Link
                  href="/paket-bundle"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Paket Bundle
                </Link>
              </li>
              <li>
                <Link
                  href="/jasa-setup"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Jasa Setup
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-white md:text-[#001b3c]">
            <h4 className="text-sm font-semibold tracking-wide">Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/panduan-instalasi"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Panduan Instalasi
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          <div className="text-white md:text-[#001b3c]">
            <h4 className="text-sm font-semibold tracking-wide">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/ketentuan-layanan"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="text-white/75 transition-colors hover:text-white md:text-[#001b3c]/80 md:hover:text-[#001b3c]"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
