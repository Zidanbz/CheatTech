import InfoPageShell from "@/components/layout/info-page-shell";

const installationSteps = [
  {
    title: "1. Pilih template yang paling relevan",
    description:
      "Buka daftar template, cek preview, lalu pilih desain yang paling sesuai dengan jurusan, brand, atau target kariermu.",
  },
  {
    title: "2. Siapkan konten utama",
    description:
      "Kumpulkan foto profil, deskripsi singkat, daftar project, kontak, dan link penting seperti LinkedIn atau GitHub.",
  },
  {
    title: "3. Edit isi template",
    description:
      "Ganti teks, gambar, dan link bawaan dengan data milikmu. Fokus dulu pada bagian hero, proyek, dan kontak agar cepat siap tayang.",
  },
  {
    title: "4. Uji di desktop dan mobile",
    description:
      "Sebelum dibagikan, cek lagi tampilan website di laptop dan HP untuk memastikan semua bagian tampil rapi.",
  },
  {
    title: "5. Publish dan bagikan link",
    description:
      "Setelah semuanya siap, upload ke hosting pilihanmu lalu gunakan link website itu di CV, LinkedIn, dan lamaran kerja.",
  },
];

export default function InstallationGuidePage() {
  return (
    <InfoPageShell
      eyebrow="PANDUAN"
      title="Panduan Instalasi dan Setup"
      description="Alur singkat ini membantu kamu dari pilih template sampai website siap dibagikan ke recruiter atau calon klien."
    >
      <div className="grid gap-4">
        {installationSteps.map((step) => (
          <section
            key={step.title}
            className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="text-xl font-semibold text-[#001b3c]">{step.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              {step.description}
            </p>
          </section>
        ))}
      </div>
    </InfoPageShell>
  );
}
