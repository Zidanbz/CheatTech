import InfoPageShell from "@/components/layout/info-page-shell";

const privacyPoints = [
  "CheatTech dapat menerima data yang kamu kirimkan saat konsultasi atau pembelian, seperti nama, email, dan informasi proyek.",
  "Data digunakan untuk proses komunikasi, layanan pelanggan, pengelolaan pesanan, dan peningkatan kualitas layanan.",
  "Kami tidak menjual data pribadi pengguna kepada pihak lain.",
  "Jika layanan pembayaran pihak ketiga digunakan, pemrosesan pembayaran juga mengikuti kebijakan penyedia pembayaran terkait.",
  "Kamu dapat menghubungi CheatTech jika ingin memperbarui atau menanyakan penggunaan data yang kamu kirimkan.",
];

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="LEGAL"
      title="Kebijakan Privasi"
      description="Ringkasan ini menjelaskan bagaimana data yang kamu bagikan ke CheatTech dipakai untuk mendukung layanan."
    >
      <div className="space-y-4">
        {privacyPoints.map((point) => (
          <div
            key={point}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-600"
          >
            {point}
          </div>
        ))}
      </div>
    </InfoPageShell>
  );
}
