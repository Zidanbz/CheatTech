import InfoPageShell from "@/components/layout/info-page-shell";

const terms = [
  "Template dan materi digital CheatTech disediakan untuk penggunaan yang sah dan tidak melanggar hukum.",
  "Pembeli bertanggung jawab memastikan isi website yang dipublikasikan merupakan milik sendiri atau telah memiliki izin penggunaan.",
  "CheatTech dapat memperbarui isi, struktur, atau kualitas layanan agar pengalaman pengguna tetap terjaga.",
  "Layanan setup atau custom dikerjakan berdasarkan ruang lingkup yang disepakati bersama saat konsultasi.",
  "Jika ada kebutuhan di luar ruang lingkup awal, detail pekerjaan tambahan dapat dibahas secara terpisah.",
];

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="LEGAL"
      title="Ketentuan Layanan"
      description="Ketentuan ini membantu menjelaskan penggunaan produk dan layanan CheatTech secara ringkas dan jelas."
    >
      <div className="space-y-4">
        {terms.map((term) => (
          <div
            key={term}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-600"
          >
            {term}
          </div>
        ))}
      </div>
    </InfoPageShell>
  );
}
