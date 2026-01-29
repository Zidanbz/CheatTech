import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle, Palette, LayoutTemplate, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const featureDetails = {
  "Desain Modern & Responsif": {
    icon: <Palette className="h-10 w-10 text-primary" />,
    description: "Tampil memukau di semua perangkat, dari desktop hingga ponsel. Desain kami mengikuti tren terkini untuk memastikan portofolio Anda terlihat profesional dan menarik."
  },
  "Mudah Disesuaikan": {
    icon: <LayoutTemplate className="h-10 w-10 text-primary" />,
    description: "Ubah warna, font, dan tata letak dengan mudah tanpa perlu pengetahuan koding. Sesuaikan template untuk mencerminkan kepribadian unik Anda."
  },
  "SEO-Friendly": {
    icon: <Zap className="h-10 w-10 text-primary" />,
    description: "Struktur kode yang dioptimalkan untuk mesin pencari membantu portofolio Anda lebih mudah ditemukan di Google, membuka lebih banyak peluang."
  },
  "Dukungan Penuh": {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    description: "Kami menyediakan panduan lengkap dan dukungan pelanggan untuk membantu Anda setiap saat. Anda tidak akan pernah sendirian dalam proses ini."
  }
};


export default async function ProductPage() {
  const product = await getProduct('main-template');
  const productImage = PlaceHolderImages.find(p => p.id === 'product-template-preview');
  
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold font-headline sm:text-4xl">{product.name}</h1>
          <p className="text-foreground/80 text-lg">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-primary">Rp{product.price.toLocaleString('id-ID')}</span>
            <span className="text-sm text-foreground/60">Pembayaran sekali seumur hidup</span>
          </div>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
            <Link href="/checkout">Beli Sekarang</Link>
          </Button>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl border">
          {productImage && (
             <Image
                src={productImage.imageUrl}
                alt="Product Demo"
                width={1200}
                height={800}
                className="object-cover w-full h-full"
                data-ai-hint={productImage.imageHint}
              />
          )}
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Fitur yang Mengubah Permainan</h2>
            <p className="max-w-2xl mx-auto mt-4 text-foreground/80 md:text-xl/relaxed">
                Jelajahi fungsionalitas canggih yang membuat template kami menjadi pilihan terbaik.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
            {product.features.map(feature => {
                const details = featureDetails[feature as keyof typeof featureDetails];
                return (
                    <div key={feature} className="flex gap-6">
                        <div className="flex-shrink-0 mt-1">{details?.icon || <CheckCircle className="h-10 w-10 text-primary"/>}</div>
                        <div>
                            <h3 className="text-xl font-bold">{feature}</h3>
                            <p className="text-foreground/70 mt-2">{details?.description || "Deskripsi detail fitur akan muncul di sini."}</p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  )
}
