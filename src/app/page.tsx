'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useCollection,
} from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { LandingPage, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const featureIcons = [
  <CheckCircle key="check" className="size-8 text-primary" />,
  <Zap key="zap" className="size-8 text-primary" />,
  <Search key="search" className="size-8 text-primary" />,
];

export default function Home() {
  const firestore = useFirestore();
  const landingPageRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'landingPage', 'main') : null),
    [firestore]
  );
  const { data: content, isLoading: isLoadingContent } =
    useDoc<LandingPage>(landingPageRef);

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'products'), where('active', '==', true))
        : null,
    [firestore]
  );
  const { data: products, isLoading: isLoadingProducts } =
    useCollection<Product>(productsQuery);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const whatsappNumber = '6281234567890';
  const whatsappMessage = 'Halo CheatTech, saya ingin konsultasi website custom.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 relative overflow-hidden">
        <div className="ct-site-bg" aria-hidden="true">
          <div className="ct-site-gradient" />
          <div className="ct-site-grid" />
          <div className="ct-site-orb ct-site-orb-1" />
          <div className="ct-site-orb ct-site-orb-2" />
          <div className="ct-site-prism ct-site-prism-1" />
          <div className="ct-site-prism ct-site-prism-2" />
          <div className="ct-site-ring ct-site-ring-1" />
        </div>
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="w-full pt-5 pb-20 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32 bg-accent/80">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col justify-center space-y-6"
                >
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium w-fit">
                    TERBARU V2.4
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {isLoadingContent ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-3/4" />
                      </div>
                    ) : (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: content?.heroHeadline || '',
                        }}
                      />
                    )}
                  </h1>
                  <div className="max-w-[600px] text-muted-foreground md:text-xl">
                    {isLoadingContent ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                      </div>
                    ) : (
                      content?.heroSubheadline
                    )}
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row items-center">
                    <Button asChild size="lg">
                      <Link href="/produk">Beli Sekarang</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/produk">Lihat Demo</Link>
                    </Button>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-2">
                        <Image
                          src="https://i.pravatar.cc/40?u=a"
                          width={40}
                          height={40}
                          alt="user"
                          className="rounded-full border-2 border-white"
                        />
                        <Image
                          src="https://i.pravatar.cc/40?u=b"
                          width={40}
                          height={40}
                          alt="user"
                          className="rounded-full border-2 border-white"
                        />
                        <Image
                          src="https://i.pravatar.cc/40?u=c"
                          width={40}
                          height={40}
                          alt="user"
                          className="rounded-full border-2 border-white"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Digunakan oleh 500+ mahasiswa
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {isLoadingContent ? (
                    <Skeleton className="h-[350px] w-[550px] rounded-xl" />
                  ) : (
                    <Image
                      src={
                        content?.heroImageUrl ||
                        'https://picsum.photos/seed/hero-image/600/400'
                      }
                      width={550}
                      height={350}
                      alt="Product preview"
                      className="mx-auto overflow-hidden rounded-xl object-cover object-center shadow-2xl"
                      data-ai-hint="browser mockup"
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </section>

        {/* Kenapa Sulit Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center order-2 md:order-1">
                <Image
                  src="https://picsum.photos/seed/job-search/500/500"
                  width={450}
                  height={450}
                  alt="Frustrated job seeker"
                  className="rounded-2xl shadow-lg transform transition-transform hover:scale-105"
                  data-ai-hint="frustrated developer"
                />
              </div>
              <div className="space-y-4 text-center md:text-left order-1 md:order-2">
                {isLoadingContent ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                      {content?.problemHeadline}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {content?.problemText}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section
          id="keuntungan"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary/80 backdrop-blur-sm"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              {isLoadingContent ? (
                <div className="space-y-4 w-full max-w-3xl">
                  <Skeleton className="h-8 w-32 mx-auto" />
                  <Skeleton className="h-12 w-2/3 mx-auto" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <>
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                    {content?.featuresSectionBadge}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    {content?.featuresSectionHeadline}
                  </h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    {content?.featuresSectionSubheadline}
                  </p>
                </>
              )}
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3"
            >
              {isLoadingContent
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="grid gap-4 text-center p-6 rounded-lg bg-background shadow-md"
                      >
                        <Skeleton className="h-14 w-14 rounded-full mx-auto" />
                        <Skeleton className="h-7 w-3/4 mx-auto" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6 mx-auto" />
                      </div>
                    ))
                : content?.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="grid gap-4 text-center p-6 rounded-lg bg-background shadow-md"
                    >
                      <div className="flex justify-center">
                        <div className="bg-primary/10 rounded-full p-3 w-fit">
                          {featureIcons[index]}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="template" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center mb-8"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Pilihan Template Terbaik
                </h2>
                <p className="text-muted-foreground">
                  Pilih desain yang paling cocok dengan kepribadian dan profesi
                  impianmu.
                </p>
              </div>
              <Button variant="link" asChild>
                <Link href="/produk">Lihat Semua →</Link>
              </Button>
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {(isLoadingProducts || products === null)
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-[300px] w-full rounded-t-lg" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-8 w-1/3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : products?.map((product) => {
                    const originalPrice =
                      typeof product.originalPrice === 'number'
                        ? product.originalPrice
                        : null;
                    const hasDiscount =
                      originalPrice !== null && originalPrice > product.price;
                    return (
                      <motion.div key={product.id} variants={itemVariants}>
                        <Card>
                          <CardContent className="p-0">
                          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="object-cover"
                              data-ai-hint="portfolio website"
                            />
                          </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">
                                  {product.name}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
                                {product.subheadline}
                              </p>
                              {product.requirements && product.requirements.length > 0 && (
                                <p className="text-xs text-yellow-500 mt-2 line-clamp-2">
                                  Persyaratan: {product.requirements.slice(0, 2).join(', ')}
                                  {product.requirements.length > 2 && ` +${product.requirements.length - 2} lainnya`}
                                </p>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 leading-tight">
                                  {hasDiscount && (
                                    <span className="text-xs text-blue-600 line-through">
                                      Rp {originalPrice.toLocaleString('id-ID')}
                                    </span>
                                  )}
                                  <span className="font-bold">
                                    Rp {product.price.toLocaleString('id-ID')}
                                  </span>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/produk/${product.id}`}>Detail</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
            </motion.div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section
          id="cara-kerja"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary/80 backdrop-blur-sm"
        >
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              {isLoadingContent ? (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <Skeleton className="h-10 w-2/3 mx-auto" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    {content?.stepsSectionHeadline}
                  </h2>
                  <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-lg">
                    {content?.stepsSectionSubheadline}
                  </p>
                </>
              )}
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto"
            >
              {isLoadingContent
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center text-center space-y-3"
                      >
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    ))
                : content?.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>

        {/* Custom Website Section */}
        <section
          id="custom"
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium w-fit">
                  WEBSITE CUSTOM
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Butuh Website Custom untuk Brand Kamu?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Kami bantu dari riset, desain UI/UX, sampai development full. 
                  Cocok untuk UMKM, startup, personal brand, hingga company profile.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-xl border bg-background/60 p-4">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Desain Sesuai Brand</p>
                      <p className="text-sm text-muted-foreground">
                        Visual unik yang konsisten dengan identitas bisnis.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl border bg-background/60 p-4">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Cepat & Responsif</p>
                      <p className="text-sm text-muted-foreground">
                        Performa optimal di semua perangkat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/70 p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Konsultasi WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Respon cepat untuk kebutuhan website custom.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-lg border bg-background/80 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor WhatsApp</p>
                    <p className="font-semibold">+{whatsappNumber}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={whatsappLink} target="_blank" rel="noreferrer">Chat</a>
                  </Button>
                </div>
                <Button asChild size="lg" className="mt-4 w-full">
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    Minta Website Custom
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Ganti nomor WhatsApp sesuai kontak bisnis kamu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              {isLoadingContent ? (
                <Skeleton className="h-10 w-1/3 mx-auto mb-12" />
              ) : (
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">
                  {content?.testimonialsSectionHeadline}
                </h2>
              )}
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-8 md:grid-cols-3"
            >
              {isLoadingContent
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6 space-y-4">
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-2/3" />
                          <div className="flex items-center gap-3 pt-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                : content?.testimonials?.map((testimonial, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground mb-4">
                            "{testimonial.quote}"
                          </p>
                          <div className="flex items-center gap-3">
                            <Image
                              src={testimonial.avatar}
                              width={40}
                              height={40}
                              alt={testimonial.name}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-semibold">
                                {testimonial.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {testimonial.role}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>
        </div>
        <style jsx>{`
          .ct-site-bg {
            position: absolute;
            inset: -120px;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            perspective: 1200px;
          }

          .ct-site-gradient {
            position: absolute;
            inset: 0;
            background: radial-gradient(60% 60% at 20% 20%, rgba(56, 189, 248, 0.2), transparent 70%),
              radial-gradient(50% 50% at 80% 30%, rgba(34, 197, 94, 0.14), transparent 70%),
              radial-gradient(60% 60% at 30% 80%, rgba(59, 130, 246, 0.18), transparent 70%);
            opacity: 0.9;
          }

          .ct-site-grid {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
            background-size: 48px 48px;
            mask-image: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.75), transparent 70%);
            opacity: 0.35;
          }

          .ct-site-orb {
            position: absolute;
            border-radius: 9999px;
            background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(59, 130, 246, 0.35) 45%, rgba(14, 165, 233, 0.12) 70%);
            box-shadow: 0 40px 120px rgba(14, 165, 233, 0.22);
            transform-style: preserve-3d;
            mix-blend-mode: screen;
            opacity: 0.7;
          }

          .ct-site-orb-1 {
            width: 360px;
            height: 360px;
            top: -160px;
            right: -120px;
            animation: ct-site-float 14s ease-in-out infinite;
          }

          .ct-site-orb-2 {
            width: 260px;
            height: 260px;
            bottom: -140px;
            left: -80px;
            animation: ct-site-float 16s ease-in-out infinite reverse;
          }

          .ct-site-prism {
            position: absolute;
            width: 240px;
            height: 240px;
            border-radius: 28px;
            background: linear-gradient(145deg, rgba(148, 163, 184, 0.35), rgba(59, 130, 246, 0.1));
            border: 1px solid rgba(148, 163, 184, 0.35);
            box-shadow: 0 45px 90px rgba(15, 23, 42, 0.2);
            transform-style: preserve-3d;
            backdrop-filter: blur(2px);
            opacity: 0.75;
          }

          .ct-site-prism::before {
            content: '';
            position: absolute;
            inset: 14px;
            border-radius: 22px;
            background: linear-gradient(160deg, rgba(255, 255, 255, 0.5), rgba(59, 130, 246, 0.08));
            transform: translateZ(-28px);
            opacity: 0.7;
          }

          .ct-site-prism-1 {
            top: 140px;
            left: 6%;
            animation: ct-site-tilt 18s ease-in-out infinite;
          }

          .ct-site-prism-2 {
            bottom: 120px;
            right: 8%;
            width: 220px;
            height: 220px;
            animation: ct-site-tilt 22s ease-in-out infinite reverse;
          }

          .ct-site-ring {
            position: absolute;
            width: 320px;
            height: 320px;
            border-radius: 9999px;
            border: 2px solid rgba(59, 130, 246, 0.25);
            box-shadow: inset 0 0 40px rgba(14, 165, 233, 0.2);
            transform: rotateX(68deg) rotateZ(25deg);
            opacity: 0.6;
            animation: ct-site-spin 26s linear infinite;
          }

          .ct-site-ring-1 {
            top: 42%;
            right: 28%;
          }

          @keyframes ct-site-float {
            0% {
              transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
            }
            50% {
              transform: translate3d(0, -24px, 10px) rotateX(12deg) rotateY(18deg);
            }
            100% {
              transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg);
            }
          }

          @keyframes ct-site-tilt {
            0% {
              transform: rotateX(12deg) rotateY(-18deg) translate3d(0, 0, 0);
            }
            50% {
              transform: rotateX(22deg) rotateY(8deg) translate3d(0, -18px, 12px);
            }
            100% {
              transform: rotateX(12deg) rotateY(-18deg) translate3d(0, 0, 0);
            }
          }

          @keyframes ct-site-spin {
            0% {
              transform: rotateX(68deg) rotateZ(0deg);
            }
            100% {
              transform: rotateX(68deg) rotateZ(360deg);
            }
          }

          @media (max-width: 768px) {
            .ct-site-orb-1 {
              width: 240px;
              height: 240px;
              top: -120px;
              right: -140px;
            }

            .ct-site-orb-2 {
              width: 200px;
              height: 200px;
              bottom: -120px;
              left: -120px;
            }

            .ct-site-prism {
              width: 200px;
              height: 200px;
            }

            .ct-site-ring {
              width: 220px;
              height: 220px;
              right: 12%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ct-site-orb,
            .ct-site-prism,
            .ct-site-ring {
              animation: none;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
