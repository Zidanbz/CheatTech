import InfoPageShell from "@/components/layout/info-page-shell";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const setupServices = [
  "Bantuan penggantian konten utama seperti nama, headline, deskripsi, dan kontak.",
  "Penyesuaian foto, proyek, dan link penting agar website siap dibagikan.",
  "Pemeriksaan tampilan dasar di desktop dan mobile sebelum website dipublikasikan.",
];

export default function SetupServicePage() {
  const setupHref = buildWhatsAppLink({
    message: "Halo CheatTech, saya ingin dibantu jasa setup untuk template website saya.",
  });

  return (
    <InfoPageShell
      eyebrow="LAYANAN"
      title="Jasa Setup Template"
      description="Kalau kamu ingin proses lebih cepat, CheatTech bisa membantu setup dasar supaya template siap dipakai tanpa ribet."
    >
      <div className="space-y-4">
        {setupServices.map((service) => (
          <div
            key={service}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-600"
          >
            {service}
          </div>
        ))}

        <section className="rounded-[24px] border border-[#000c26]/10 bg-[#eef8ff] p-5">
          <h2 className="text-xl font-semibold text-[#001b3c]">
            Siap dibantu setup?
          </h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            Kirim detail template dan kebutuhanmu, nanti tim CheatTech bantu arahkan prosesnya.
          </p>
          <a
            href={setupHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#001b3c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b315f]"
          >
            Minta Bantuan Setup
          </a>
        </section>
      </div>
    </InfoPageShell>
  );
}
