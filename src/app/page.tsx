'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const testimonials = [
  {
    name: 'Sarah Amalia',
    role: 'Mahasiswa DKV, Bandung',
    quote: 'Baru lulus kemarin bingung mau apply di banyak portofolio sama HRD. Untung ada simple web, jadi pake template ini. Tampilannya pro banget, HRD langsung interest.',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    name: 'Andi Pratama',
    role: 'Fresh Graduate IT, Jakarta',
    quote: '"Investasi terbaik 49rb seumur hidup. Template-nya ciamik, loading wush wush, SEO nya juga oke, nama saya muncul di Google."',
    avatar: 'https://i.pravatar.cc/150?u=andi'
  },
   {
    name: 'Jessica Tan',
    role: 'Content Writer, Surabaya',
    quote: '"Awalnya ragu, tapi setelah coba, ternyata gampang banget pakenya. Gak perlu pusing ngoding, tinggal ganti teks dan gambar. Thanks Portofoloku!"',
    avatar: 'https://i.pravatar.cc/150?u=jessica'
  }
];

const templates = [
  {
    name: "Minimalist Furia",
    description: "Cocok untuk content writer, jurnalis, dan akademisi.",
    price: "49.000",
    image: "https://picsum.photos/seed/template1/400/300",
    tags: ["Best Seller"],
    imageHint: "minimalist portfolio",
  },
  {
    name: "Creative Dev",
    description: "Pilihan tepat untuk developer, desainer UI/UX, dan ilustrator.",
    price: "49.000",
    image: "https://picsum.photos/seed/template2/400/300",
    tags: [],
    imageHint: "developer portfolio"
  },
  {
    name: "Business Pro",
    description: "Template handal untuk konsultan, akuntan, dan manajemen.",
    price: "59.000",
    image: "https://picsum.photos/seed/template3/400/300",
    tags: ["New"],
    imageHint: "business portfolio"
  }
]

export default function Home() {

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-accent">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium w-fit">TERBARU V2.4</div>
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Website Portofolio Mahasiswa, <span className="text-primary">Siap Online</span> dalam 10 Menit
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Tingkatkan personal branding kamu dan pikat HRD dengan website profesional tanpa perlu belajar coding yang rumit.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row items-center">
                  <Button asChild size="lg">
                    <Link href="/checkout">Beli Sekarang</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/produk">Lihat Demo</Link>
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                       <Image src="https://i.pravatar.cc/40?u=a" width={40} height={40} alt="user" className="rounded-full border-2 border-white"/>
                       <Image src="https://i.pravatar.cc/40?u=b" width={40} height={40} alt="user" className="rounded-full border-2 border-white"/>
                       <Image src="https://i.pravatar.cc/40?u=c" width={40} height={40} alt="user" className="rounded-full border-2 border-white"/>
                    </div>
                    <p className="text-sm text-muted-foreground">Digunakan oleh 500+ mahasiswa</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Image
                    src="https://picsum.photos/seed/hero-image/600/400"
                    width={550}
                    height={350}
                    alt="Product preview"
                    className="mx-auto overflow-hidden rounded-xl object-cover object-center shadow-2xl"
                    data-ai-hint="browser mockup"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Kenapa Sulit Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Kenapa Sulit Dapat Kerja?</h2>
            <p className="text-muted-foreground text-lg">
              Lamar kerja ratusan kali tapi tidak dipanggil? Mungkin CV kamu kurang menarik. Di era digital yang kompetitif ini, sekadar CV PDF tidak cukup. Kamu butuh portofolio online yang hidup untuk menvalidasi skill dan membedakan dirimu dari kandidat lain.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="keuntungan" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">KEUNTUNGAN</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Kenapa Harus Template Ini?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Desain premium dengan harga mahasiswa. Dibuat khusus untuk kebutuhan karirmu.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-4 text-center p-6 rounded-lg bg-white shadow-md">
                <div className="flex justify-center"><div className="bg-primary/10 rounded-full p-3 w-fit"><CheckCircle className="size-8 text-primary" /></div></div>
                <h3 className="text-xl font-bold">Tampil Profesional</h3>
                <p className="text-sm text-muted-foreground">
                  Desain bersih dan modern yang membuatmu terlihat lebih kredibel dan "mahal" di mata HRD atau klien potensial.
                </p>
              </div>
              <div className="grid gap-4 text-center p-6 rounded-lg bg-white shadow-md">
                <div className="flex justify-center"><div className="bg-primary/10 rounded-full p-3 w-fit"><Zap className="size-8 text-primary" /></div></div>
                <h3 className="text-xl font-bold">Setup Mudah & Cepat</h3>
                <p className="text-sm text-muted-foreground">
                  Integrasi mudah dengan Notion atau text file, tidak perlu pusing coding, cukup fokus pada isi konten portofoliomu.
                </p>
              </div>
              <div className="grid gap-4 text-center p-6 rounded-lg bg-white shadow-md">
                <div className="flex justify-center"><div className="bg-primary/10 rounded-full p-3 w-fit"><Search className="size-8 text-primary" /></div></div>
                <h3 className="text-xl font-bold">SEO Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Struktur kode yang optimal agar namamu mudah ditemukan di halaman pertama Google saat recruiter mencarimu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="template" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Pilihan Template Terbaik</h2>
                <p className="text-muted-foreground">Pilih desain yang paling cocok dengan kepribadian dan profesi impianmu.</p>
              </div>
              <Button variant="link" asChild><Link href="/produk">Lihat Semua →</Link></Button>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <Card key={template.name}>
                  <CardContent className="p-0">
                    <Image src={template.image} alt={template.name} width={400} height={300} className="rounded-t-lg w-full" data-ai-hint={template.imageHint} />
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        {template.tags.map(tag => (
                          <div key={tag} className={`text-xs font-semibold px-2 py-1 rounded-full ${tag === 'Best Seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{tag}</div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">{template.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="font-bold">Rp {template.price}</p>
                        <Button variant="outline" size="sm" asChild><Link href="/produk">Detail</Link></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section id="cara-kerja" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Hanya 3 Langkah Mudah</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-lg">Siapapun bisa melakukannya, bahkan jika kamu baru pertama kali membuat website.</p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">1</div>
                  <h3 className="font-bold text-xl mb-2">Pilih & Beli</h3>
                  <p className="text-muted-foreground text-sm">Pilih template yang kamu suka, lakukan pembayaran, dan dapatkan akses file selamanya.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">2</div>
                  <h3 className="font-bold text-xl mb-2">Deploy ke Vercel</h3>
                  <p className="text-muted-foreground text-sm">Hubungkan akun Github kamu ke Vercel, klik deploy, dan website live dalam hitungan detik.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">3</div>
                  <h3 className="font-bold text-xl mb-2">Edit & Online</h3>
                  <p className="text-muted-foreground text-sm">Ubah teks dan foto sesuai keinginanmu lewat file config yang simpel. Selesai!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container">
            <Card className="max-w-sm mx-auto shadow-xl rounded-lg overflow-hidden">
              <CardContent className="p-0 text-center">
                <div className="bg-primary text-primary-foreground p-6">
                  <h3 className="font-semibold">Single Template</h3>
                  <p className="text-4xl font-bold mt-2">Rp 49rb</p>
                  <p className="text-sm opacity-80">Harga per template, sekali bayar.</p>
                </div>
                <div className="p-6">
                  <ul className="grid gap-3 text-left text-sm mb-6">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Akses File 1 Template Pilihan</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Update Gratis Seumur Hidup</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Dokumentasi & Panduan Install</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Akses Source Code (React+Next.js)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Siap Deploy (Mobile Friendly)</li>
                  </ul>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/checkout">Pilih Template</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">Pilih template lainnya di atas untuk membeli.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">Kata Mereka</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Image src={testimonial.avatar} width={40} height={40} alt={testimonial.name} className="rounded-full" />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
