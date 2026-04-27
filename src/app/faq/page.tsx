import InfoPageShell from "@/components/layout/info-page-shell";
import { ADMIN_WA_NUMBER_DISPLAY, buildWhatsAppLink } from "@/lib/whatsapp";

const faqItems = [
  {
    question: "Apa yang saya dapat setelah membeli template?",
    answer:
      "Kamu akan mendapatkan file template website, panduan dasar penggunaan, dan akses untuk melihat demo template yang kamu pilih.",
  },
  {
    question: "Apakah saya harus bisa coding?",
    answer:
      "Tidak wajib. Template CheatTech dirancang supaya kamu bisa mengganti konten utama dengan cepat. Kalau butuh bantuan lebih lanjut, kamu juga bisa pakai layanan setup.",
  },
  {
    question: "Berapa lama website bisa online?",
    answer:
      "Untuk template yang sudah siap, prosesnya bisa sangat cepat. Jika konten dan asetmu sudah siap, website bisa online dalam hitungan menit.",
  },
  {
    question: "Apakah tersedia bantuan custom website?",
    answer:
      "Ya. Kami menyediakan layanan website custom untuk personal brand, UMKM, startup, company profile, dan kebutuhan digital lainnya.",
  },
];

export default function FaqPage() {
  const contactHref = buildWhatsAppLink({
    message: "Halo CheatTech, saya ingin tanya lebih lanjut seputar template dan layanan Anda.",
  });

  return (
    <InfoPageShell
      eyebrow="SUPPORT"
      title="Pertanyaan yang Sering Ditanyakan"
      description="Halaman ini merangkum pertanyaan paling umum supaya kamu bisa lebih cepat memilih template dan layanan yang sesuai."
    >
      <div className="space-y-6">
        {faqItems.map((item) => (
          <section
            key={item.question}
            className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="text-xl font-semibold text-[#001b3c]">
              {item.question}
            </h2>
            <p className="mt-2 leading-relaxed text-slate-600">{item.answer}</p>
          </section>
        ))}

        <section className="rounded-[24px] border border-[#000c26]/10 bg-[#eef8ff] p-5">
          <h2 className="text-xl font-semibold text-[#001b3c]">
            Masih ada pertanyaan?
          </h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            Tim CheatTech siap membantu lewat WhatsApp di {ADMIN_WA_NUMBER_DISPLAY}.
          </p>
          <a
            href={contactHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#001b3c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b315f]"
          >
            Hubungi CheatTech
          </a>
        </section>
      </div>
    </InfoPageShell>
  );
}
