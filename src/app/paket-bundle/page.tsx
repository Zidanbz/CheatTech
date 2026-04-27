import InfoPageShell from "@/components/layout/info-page-shell";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const bundleBenefits = [
  "Lebih hemat untuk kebutuhan beberapa landing page atau beberapa peran sekaligus.",
  "Cocok untuk mahasiswa, freelancer, atau tim kecil yang ingin punya beberapa tampilan portofolio.",
  "Bisa dikombinasikan dengan bantuan setup jika kamu ingin proses yang lebih praktis.",
];

export default function BundlePage() {
  const consultationHref = buildWhatsAppLink({
    message: "Halo CheatTech, saya ingin konsultasi paket bundle template.",
  });

  return (
    <InfoPageShell
      eyebrow="PRODUK"
      title="Paket Bundle Template"
      description="Paket bundle cocok kalau kamu ingin lebih dari satu template untuk kebutuhan presentasi karya, personal brand, atau variasi target audiens."
    >
      <div className="space-y-4">
        {bundleBenefits.map((benefit) => (
          <div
            key={benefit}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-600"
          >
            {benefit}
          </div>
        ))}

        <section className="rounded-[24px] border border-[#000c26]/10 bg-[#eef8ff] p-5">
          <h2 className="text-xl font-semibold text-[#001b3c]">
            Butuh penawaran bundle?
          </h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            Hubungi tim CheatTech untuk konsultasi kombinasi template yang paling pas.
          </p>
          <a
            href={consultationHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#001b3c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b315f]"
          >
            Konsultasi Paket Bundle
          </a>
        </section>
      </div>
    </InfoPageShell>
  );
}
