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

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-accent overflow-hidden">
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
                    <Link href="/checkout">Beli Sekarang</Link>
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
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            {isLoadingContent ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3 mx-auto" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6 mx-auto" />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  {content?.problemHeadline}
                </h2>
                <div className="text-muted-foreground text-lg">
                  {content?.problemText}
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* Features Section */}
        <section
          id="keuntungan"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
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
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {isLoadingProducts
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
                : products?.map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Card>
                        <CardContent className="p-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="rounded-t-lg w-full aspect-[4/3] object-cover"
                            data-ai-hint="portfolio website"
                          />
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg">
                                {product.name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 mb-4 h-10 line-clamp-2">
                              {product.subheadline}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="font-bold">
                                Rp {product.price.toLocaleString('id-ID')}
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/produk">Detail</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section
          id="cara-kerja"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
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

        {/* Pricing Section */}
        <section id="harga" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="max-w-sm mx-auto shadow-xl rounded-lg overflow-hidden">
                <CardContent className="p-0 text-center">
                  <div className="bg-primary text-primary-foreground p-6">
                    <h3 className="font-semibold">Single Template</h3>
                    <p className="text-4xl font-bold mt-2">Rp 49rb</p>
                    <p className="text-sm opacity-80">
                      Harga per template, sekali bayar.
                    </p>
                  </div>
                  <div className="p-6">
                    <ul className="grid gap-3 text-left text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Akses File 1 Template Pilihan
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Update Gratis Seumur Hidup
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Dokumentasi & Panduan Install
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Akses Source Code (React+Next.js)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Siap Deploy (Mobile Friendly)
                      </li>
                    </ul>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/checkout">Pilih Template</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Pilih template lainnya di atas untuk membeli.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
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
      </main>
    </div>
  );
}
