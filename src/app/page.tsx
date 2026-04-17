'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Quote, Search, Star, Zap } from 'lucide-react';
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
import { ADMIN_WA_NUMBER, buildWhatsAppLink } from '@/lib/whatsapp';
import bgLeftPattern from '../../assets/assets home page/bg_leftz.png';
import bgRightPattern from '../../assets/assets home page/bg_rightz.png';
import laptopMockup from '../../assets/assets home page/laptop.png';
import ProductCard from '@/components/products/product-card';

const featureIconComponents = [CheckCircle, Zap, Search] as const;
const ACTIVE_PRODUCTS_CACHE_KEY = 'cheattech-home-active-products';

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
  const {
    data: products,
    error: productsError,
  } =
    useCollection<Product>(productsQuery);
  const [cachedProducts, setCachedProducts] = useState<Product[] | null>(null);
  const [hasLoadedProductCache, setHasLoadedProductCache] = useState(false);

  useEffect(() => {
    try {
      const rawCachedProducts = window.localStorage.getItem(
        ACTIVE_PRODUCTS_CACHE_KEY
      );

      if (!rawCachedProducts) {
        setCachedProducts(null);
        return;
      }

      const parsedProducts = JSON.parse(rawCachedProducts);
      setCachedProducts(Array.isArray(parsedProducts) ? parsedProducts : null);
    } catch {
      setCachedProducts(null);
    } finally {
      setHasLoadedProductCache(true);
    }
  }, []);

  useEffect(() => {
    if (products === null) {
      return;
    }

    try {
      if (products.length > 0) {
        window.localStorage.setItem(
          ACTIVE_PRODUCTS_CACHE_KEY,
          JSON.stringify(products)
        );
      } else {
        window.localStorage.removeItem(ACTIVE_PRODUCTS_CACHE_KEY);
      }
    } catch {
      // Ignore storage sync failures so the page can keep rendering live data.
    }

    setCachedProducts(products);
  }, [products]);

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

  const whatsappMessage = 'Halo CheatTech, saya ingin konsultasi website custom.';
  const whatsappLink = buildWhatsAppLink({ message: whatsappMessage });

  const heroHeadlineHtml =
    content?.heroHeadline?.trim() ||
    'Website <em>Portofolio Mahasiswa,</em><br /><em>Siap Online</em> dalam 10 Menit';
  const heroSubheadline =
    content?.heroSubheadline?.trim() ||
    'Tingkatkan personal branding kamu dan pikat HRD dengan website profesional tanpa perlu belajar coding yang rumit.';

  const problemText =
    content?.problemText?.trim() ||
    'Ratusan lamaran kerja terkirim, namun tak ada panggilan? Mungkin bukan skill kamu yang kurang, tapi cara kamu menampilkannya. Di era digital, CV statis saja sering belum cukup untuk bikin recruiter yakin.';

  const featureSectionBadge =
    content?.featuresSectionBadge?.trim() || 'KENAPA HARUS TEMPLATE INI?';
  const featureSectionSubheadline =
    content?.featuresSectionSubheadline?.trim() ||
    'Desain premium dengan harga mahasiswa. Dibuat khusus untuk kebutuhan kariermu.';
  const features =
    content?.features?.length
      ? content.features
      : [
          {
            title: 'Desain Profesional',
            description: 'Tampilan bersih, modern, dan enak dilihat di semua perangkat.',
          },
          {
            title: 'Cepat Disetup',
            description: 'Tinggal ganti foto, teks, dan link. Siap online dalam hitungan menit.',
          },
          {
            title: 'SEO Friendly',
            description: 'Struktur halaman rapi agar lebih mudah ditemukan di Google.',
          },
        ];

  const stepsSubheadline =
    content?.stepsSectionSubheadline?.trim() ||
    'Siapapun bisa melakukannya, bahkan jika kamu baru pertama kali membuat website.';
  const steps =
    content?.steps?.length
      ? content.steps
      : [
          {
            title: 'Pilih Template',
            description: 'Pilih desain yang paling cocok untuk jurusan & karier kamu.',
          },
          {
            title: 'Edit Konten',
            description: 'Ganti foto, deskripsi, dan proyek agar sesuai pengalaman kamu.',
          },
          {
            title: 'Publish',
            description: 'Upload dan bagikan link portofolio kamu ke rekruter.',
          },
        ];

  const testimonials =
    content?.testimonials?.length
      ? content.testimonials
      : [
          {
            name: 'Rizky',
            role: 'Mahasiswa Informatika',
            quote:
              'Setup-nya gampang banget. Portofolio saya jadi lebih rapi dan keliatan profesional.',
            avatar: 'https://i.pravatar.cc/80?u=ct-1',
          },
          {
            name: 'Nadia',
            role: 'UI/UX Designer',
            quote:
              'Template-nya modern dan clean. Tinggal edit sedikit langsung siap dipakai.',
            avatar: 'https://i.pravatar.cc/80?u=ct-2',
          },
          {
            name: 'Bagas',
            role: 'Fresh Graduate',
            quote:
              'Saya suka karena responsif dan cepat. Link portofolio jadi pede buat dilampirin.',
            avatar: 'https://i.pravatar.cc/80?u=ct-3',
          },
        ];

  const activeProducts = products ?? cachedProducts ?? [];
  const hasResolvedProducts = products !== null;
  const shouldShowProductSkeletons =
    activeProducts.length === 0 && !hasResolvedProducts && !productsError;
  const shouldShowEmptyProductsState =
    activeProducts.length === 0 && hasResolvedProducts;
  const isUsingCachedProducts =
    products === null && cachedProducts !== null && hasLoadedProductCache;
  const highlightedTestimonials = testimonials.slice(0, 2);
  const showcaseCategories = [
    { label: 'Karir', imageHint: 'career website' },
    { label: 'Portofolio', imageHint: 'portfolio website' },
    { label: 'Industri', imageHint: 'industrial website' },
    { label: 'Belanja', imageHint: 'ecommerce website' },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="ct-home-bg" aria-hidden="true">
        <div className="ct-home-gradient" />
        <div className="ct-home-grid-glow" />
        <div className="ct-home-hex" />
        <div className="ct-home-topology" />
        <div className="ct-home-stars" />
        <div className="ct-home-vignette" />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex max-w-4xl flex-col items-center text-center"
            >
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-6 py-1.5 text-sm font-semibold tracking-wide text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur">
                TERBARU V2.4
              </div>

              {isLoadingContent ? (
                <div className="mt-6 space-y-2">
                  <Skeleton className="mx-auto h-12 w-[22rem]" />
                  <Skeleton className="mx-auto h-12 w-[18rem]" />
                </div>
              ) : (
                <h1 className="mt-6 max-w-[14ch] text-4xl font-medium tracking-tight text-[#9ed9ff] sm:text-5xl md:text-7xl">
                  <span
                    className="ct-hero-title"
                    dangerouslySetInnerHTML={{ __html: heroHeadlineHtml }}
                  />
                </h1>
              )}

              {isLoadingContent ? (
                <div className="mt-6 space-y-2">
                  <Skeleton className="mx-auto h-6 w-[28rem]" />
                  <Skeleton className="mx-auto h-6 w-[22rem]" />
                </div>
              ) : (
                <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-xl">
                  {heroSubheadline}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-2xl border border-slate-300 bg-white px-9 text-base font-semibold text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.28)] hover:bg-white/90"
                >
                  <Link href="/produk">Beli Sekarang</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-2xl border border-slate-300 bg-white px-9 text-base font-semibold text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)] hover:bg-white/90 hover:text-slate-900"
                >
                  <Link href="/#template">Lihat Demo</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="relative mx-auto mt-14 max-w-5xl px-2 md:px-10"
            >
              <div className="relative mx-auto w-full max-w-4xl">
                {isLoadingContent ? (
                  <Skeleton className="mx-auto aspect-[711/392] w-full max-w-3xl rounded-[28px]" />
                ) : (
                  <div className="relative mx-auto aspect-[711/392] w-full max-w-3xl drop-shadow-[0_35px_90px_rgba(0,0,0,0.42)]">
                    <div className="absolute left-[15%] top-[5.5%] h-[71.5%] w-[70.3%] overflow-hidden rounded-[12px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%),linear-gradient(180deg,#8fd3ff_0%,#7ec8f6_48%,#7bbdf0_100%)]">
                      <Image
                        src={
                          content?.heroImageUrl ||
                          'https://picsum.photos/seed/hero-image/1200/675'
                        }
                        alt="Preview template"
                        fill
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        className="object-cover object-top opacity-35 mix-blend-multiply"
                        data-ai-hint="browser mockup"
                        priority
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.28),transparent_35%)]" />
                    </div>
                    <Image
                      src={laptopMockup}
                      alt="Laptop mockup"
                      fill
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                )}
              </div>

              {highlightedTestimonials[0] && (
                <div className="pointer-events-none absolute left-0 top-20 hidden w-[290px] rounded-[22px] border border-white/20 bg-[#a6dbff1f] p-4 text-white/85 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur md:block">
                  <div className="rounded-2xl bg-white px-4 py-3 text-left shadow-[0_14px_30px_rgba(15,23,42,0.24)]">
                    <div className="flex items-center gap-3">
                      <Image
                        src={highlightedTestimonials[0].avatar}
                        alt={highlightedTestimonials[0].name}
                        width={46}
                        height={46}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-700">
                          {highlightedTestimonials[0].name}
                        </p>
                        <div className="mt-1 flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={`hero-left-star-${index}`}
                              className="h-3.5 w-3.5 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-snug text-slate-600">
                      “{highlightedTestimonials[0].quote}”
                    </p>
                  </div>
                </div>
              )}

              {highlightedTestimonials[1] && (
                <div className="pointer-events-none absolute right-0 top-4 hidden w-[300px] rounded-[22px] border border-white/20 bg-[#a6dbff1f] p-4 text-white/85 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur md:block">
                  <div className="rounded-2xl bg-white px-4 py-3 text-left shadow-[0_14px_30px_rgba(15,23,42,0.24)]">
                    <div className="flex items-center gap-3">
                      <Image
                        src={highlightedTestimonials[1].avatar}
                        alt={highlightedTestimonials[1].name}
                        width={46}
                        height={46}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-700">
                          {highlightedTestimonials[1].name}
                        </p>
                        <div className="mt-1 flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={`hero-right-star-${index}`}
                              className="h-3.5 w-3.5 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-snug text-slate-600">
                      “{highlightedTestimonials[1].quote}”
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="relative bg-[#000C26]">
          <Image
            src={bgLeftPattern}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-3 top-[18%] z-0 hidden h-[44%] w-auto opacity-55 md:block lg:-left-4 lg:h-[52%]"
          />
          <Image
            src={bgRightPattern}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 top-[18%] z-0 hidden h-[44%] w-auto opacity-55 md:block lg:-right-4 lg:h-[52%]"
          />

          {/* Problem */}
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 -mt-20 w-full overflow-hidden pb-20 pt-40 md:-mt-28 md:pb-28 md:pt-48"
          >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(155,220,255,0.75)_50%,rgba(255,255,255,0)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-14 h-[320px] bg-[radial-gradient(58%_100%_at_50%_0%,rgba(129,207,255,0.5)_0%,rgba(77,163,230,0.24)_36%,rgba(0,12,38,0)_72%)] md:-top-10 md:h-[400px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(126,196,246,0.16),rgba(0,12,38,0))]"
          />

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            {isLoadingContent ? (
              <div className="grid gap-8 md:grid-cols-2 md:gap-16">
                <Skeleton className="h-14 w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/6" />
                </div>
              </div>
            ) : (
              <div className="grid items-start gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
                <h2 className="max-w-sm text-4xl font-medium tracking-tight text-white sm:text-6xl">
                  Kenapa
                  <br />
                  Sulit Dapat
                  <br />
                  <span className="font-serif italic text-[#d9ecff]">
                    Kerja?
                  </span>
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-2xl sm:leading-relaxed">
                  {problemText}
                </p>
              </div>
            )}
          </div>
          </motion.section>

          {/* Features */}
          <section
            id="keuntungan"
            className="relative z-10 w-full overflow-visible py-16 md:py-24"
          >
            <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-8 py-2 text-xs font-semibold tracking-[0.18em] text-white/80 backdrop-blur">
                {featureSectionBadge}
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Kenapa Harus{' '}
                <span className="font-serif italic text-[#d5ebff]">
                  Template Ini?
                </span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                {featureSectionSubheadline}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial={false}
              animate="visible"
              className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3"
            >
              {isLoadingContent
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="mt-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  ))
                : features.map((feature, index) => {
                    const Icon =
                      featureIconComponents[index] ?? featureIconComponents[0];
                    return (
                      <motion.div
                        key={`${feature.title}-${index}`}
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#64748b99] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_38%)]" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="relative mt-6 text-2xl font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="relative mt-3 text-lg leading-relaxed text-white/80">
                          {feature.description}
                        </p>
                      </motion.div>
                    );
                  })}
            </motion.div>
            </div>
          </section>

          {/* Categories */}
          <section className="relative z-10 w-full pt-24 pb-16 md:pt-36 md:pb-24">
            <div className="container mx-auto grid gap-12 px-4 md:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-medium tracking-tight text-white sm:text-6xl">
                Kategori
                <br />
                Template
                <br />
                <span className="font-serif italic text-[#d9ecff]">
                  Terbaik
                </span>
              </h2>
              <p className="mt-4 max-w-sm text-lg text-white/70">
                Mulai dari portofolio mahasiswa sampai personal brand—pilih yang
                sesuai kebutuhan kamu.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="grid gap-5 sm:grid-cols-2"
            >
              {shouldShowProductSkeletons
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-[1.38/1] w-full rounded-[28px]"
                    />
                  ))
                : showcaseCategories.map((category, index) => {
                    const product = activeProducts[index % activeProducts.length];
                    return (
                      <div
                        key={`${category.label}-${product?.id ?? index}`}
                        className="group relative aspect-[1.38/1] overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
                      >
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 28vw, 100vw"
                          className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.03]"
                          data-ai-hint={category.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-white/5" />
                        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
                          <div className="rounded-full border border-white/35 bg-white/18 px-7 py-2 text-xl font-semibold text-white backdrop-blur">
                            {category.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </motion.div>
            </div>
          </section>
        </div>

        {/* Templates */}
        <section
          id="template"
          className="relative w-full overflow-hidden bg-white pb-24 pt-28 text-slate-900 md:pb-32 md:pt-36"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden md:h-44"
          >
            <div className="absolute left-1/2 top-0 h-40 w-[205%] -translate-x-1/2 -translate-y-[62%] rounded-[50%] bg-[#000C26] md:h-56" />
            <div className="absolute left-1/2 top-1 h-40 w-[205%] -translate-x-1/2 -translate-y-[60%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,12,38,0.28)_0%,rgba(0,12,38,0.14)_34%,rgba(0,12,38,0)_68%)] md:h-56" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-36 overflow-hidden md:h-44"
          >
            <div className="absolute left-1/2 bottom-0 h-40 w-[205%] -translate-x-1/2 translate-y-[62%] rounded-[50%] bg-[#000C26] md:h-56" />
            <div className="absolute left-1/2 bottom-1 h-40 w-[205%] -translate-x-1/2 translate-y-[60%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,12,38,0.22)_0%,rgba(0,12,38,0.1)_34%,rgba(0,12,38,0)_68%)] md:h-56" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Pilihan Template Terbaru
                </h2>
                <p className="mt-2 text-slate-600">
                  Desain yang rapi, modern, dan siap kamu edit.
                </p>
              </div>
              <Link
                href="/produk"
                className="inline-flex items-center justify-center text-sm font-medium text-slate-900 hover:underline"
              >
                Lihat Semua →
              </Link>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {shouldShowProductSkeletons
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[28px] bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.10)]"
                    >
                      <Skeleton className="aspect-[4/3] w-full rounded-[22px]" />
                      <div className="mt-6">
                        <Skeleton className="h-6 w-4/5" />
                        <Skeleton className="mt-3 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-11/12" />
                        <div className="mt-5 flex items-end justify-between">
                          <Skeleton className="h-9 w-28 rounded-full" />
                          <div className="text-right">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="mt-2 h-5 w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : activeProducts.slice(0, 6).map((product) => {
                    const originalPrice =
                      typeof product.originalPrice === 'number'
                        ? product.originalPrice
                        : null;
                    const hasDiscount =
                      originalPrice !== null && originalPrice > product.price;

                    return (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        className="h-full"
                      >
                        <ProductCard
                          product={{
                            ...product,
                            originalPrice:
                              hasDiscount && originalPrice !== null
                                ? originalPrice
                                : undefined,
                          }}
                        />
                      </motion.div>
                    );
                  })}
            </motion.div>

            {isUsingCachedProducts && (
              <p className="mt-4 text-sm text-slate-500">
                Menampilkan template terakhir yang tersimpan sambil memuat data terbaru.
              </p>
            )}

            {shouldShowEmptyProductsState && (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600">
                Template terbaru belum tersedia saat ini.
              </div>
            )}
          </div>
        </section>

        {/* Steps */}
        <section id="cara-kerja" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              {isLoadingContent ? (
                <div className="space-y-3">
                  <Skeleton className="mx-auto h-10 w-2/3" />
                  <Skeleton className="mx-auto h-6 w-full" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Hanya 3 Langkah{' '}
                    <span className="font-serif italic text-[#d5ebff]">
                      Mudah
                    </span>
                  </h2>
                  <p className="mt-3 text-lg text-white/70">
                    {stepsSubheadline}
                  </p>
                </>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="visible"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3"
            >
              {isLoadingContent
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="mt-6 h-10 w-10 rounded-2xl" />
                      <Skeleton className="mt-5 h-6 w-2/3" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <Skeleton className="mt-2 h-4 w-5/6" />
                    </div>
                  ))
                : steps.map((step, index) => (
                    <motion.div
                      key={`${step.title}-${index}`}
                      variants={itemVariants}
                      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(91,100,122,0.94),rgba(77,85,105,0.94))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_36%)]" />
                      <div className="relative">
                        <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/60">
                          LANGKAH {index + 1}
                        </div>
                        <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/10 text-3xl font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                          {index + 1}
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold text-white">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-white/78">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>

        {/* Custom Website */}
        <section id="custom" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(111,141,180,0.86),rgba(94,104,130,0.86))] px-6 py-8 shadow-[0_35px_120px_rgba(0,0,0,0.28)] md:px-10 md:py-10"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.08] px-6 py-2 text-xs font-semibold tracking-[0.18em] text-white/75 backdrop-blur">
                    WEBSITE CUSTOM
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Butuh{' '}
                    <span className="font-serif italic text-[#dcecff]">
                      Website Custom
                    </span>
                    <br />
                    untuk Brand Kamu?
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-white/80">
                  Kami bantu dari riset, desain UI/UX, sampai development full.
                  Cocok untuk UMKM, startup, personal brand, hingga company
                  profile.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-4 rounded-[26px] border border-white/10 bg-slate-950/15 p-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
                <div className="min-w-0 flex-1 rounded-full bg-white px-2 py-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate pl-4 text-base font-medium text-slate-400">
                      Pesan kamu
                    </span>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 min-w-[108px] items-center justify-center rounded-full bg-[#071631] px-5 text-base font-semibold text-white transition-colors hover:bg-[#0c234e]"
                    >
                      Chat
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/75">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span className="text-sm md:text-base">
                    WhatsApp aktif di +{ADMIN_WA_NUMBER}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {isLoadingContent ? (
                <Skeleton className="mx-auto h-10 w-1/3" />
              ) : (
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Apa Kata <span className="text-[#8fd3ff]">Mereka?</span>
                </h2>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-10 grid gap-6 md:grid-cols-3"
            >
              {isLoadingContent
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="mt-3 h-5 w-full" />
                      <Skeleton className="mt-2 h-5 w-5/6" />
                      <div className="mt-6 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  ))
                : testimonials.slice(0, 3).map((testimonial, index) => (
                    <motion.div
                      key={`${testimonial.name}-${index}`}
                      variants={itemVariants}
                      className="rounded-[28px] border border-white/10 bg-[#64748b99] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur"
                    >
                      <Quote className="h-10 w-10 text-[#8acfff]" />
                      <div className="mt-5 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-300 fill-yellow-300"
                          />
                        ))}
                      </div>
                      <p className="mt-4 text-base leading-relaxed text-white/80">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="mt-7 flex items-center justify-between gap-3">
                        <div className="leading-tight">
                          <div className="text-lg font-semibold text-white">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-white/60">
                            {testimonial.role}
                          </div>
                        </div>
                        <Image
                          src={testimonial.avatar}
                          width={44}
                          height={44}
                          alt={testimonial.name}
                          className="rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .ct-home-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: #020817;
        }

        .ct-home-gradient {
          position: absolute;
          inset: -15%;
          background: radial-gradient(
              72% 55% at 50% 20%,
              rgba(137, 207, 255, 0.32),
              transparent 62%
            ),
            radial-gradient(
              55% 45% at 50% 48%,
              rgba(118, 198, 251, 0.58),
              transparent 70%
            ),
            radial-gradient(
              50% 38% at 50% 70%,
              rgba(87, 139, 198, 0.34),
              transparent 72%
            ),
            linear-gradient(180deg, #03112a 0%, #051633 30%, #05132f 58%, #02102b 100%);
          opacity: 1;
        }

        .ct-home-grid-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(5, 17, 42, 0) 0%,
            rgba(124, 208, 255, 0.14) 24%,
            rgba(124, 208, 255, 0.18) 42%,
            rgba(5, 17, 42, 0) 62%
          );
          opacity: 0.9;
        }

        .ct-home-hex {
          position: absolute;
          inset: 0;
          opacity: 0.36;
          mix-blend-mode: screen;
        }

        .ct-home-hex::before,
        .ct-home-hex::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 20%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='104' viewBox='0 0 120 104'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.22)' stroke-width='1'%3E%3Cpath d='M30 2L60 20l0 34-30 18L0 54V20L30 2z'/%3E%3Cpath d='M90 2l30 18v34L90 72 60 54V20L90 2z'/%3E%3Cpath d='M60 54l30 18v30L60 120 30 102V72l30-18z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 156px 138px;
          background-position: 36px -12px;
          background-repeat: repeat;
          opacity: 1;
          mask-image: radial-gradient(
              90% 55% at 50% 18%,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.7) 52%,
              rgba(0, 0, 0, 0) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.9) 55%,
              rgba(0, 0, 0, 0) 100%
            );
          mask-repeat: no-repeat;
          mask-size: 100% 100%;
        }

        .ct-home-hex::before {
          left: 0;
          mask-image: radial-gradient(
              90% 55% at 50% 6%,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.7) 56%,
              rgba(0, 0, 0, 0) 100%
            ),
            linear-gradient(
              to right,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.95) 42%,
              rgba(0, 0, 0, 0.35) 58%,
              rgba(0, 0, 0, 0) 74%
            );
        }

        .ct-home-hex::after {
          right: 0;
          background-position: 16px -12px;
          mask-image: radial-gradient(
              90% 55% at 50% 18%,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.7) 56%,
              rgba(0, 0, 0, 0) 100%
            ),
            linear-gradient(
              to left,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.95) 42%,
              rgba(0, 0, 0, 0.35) 58%,
              rgba(0, 0, 0, 0) 74%
            );
        }

        .ct-home-topology {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='120' viewBox='0 0 360 120'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='1.4'%3E%3Cpath d='M0 24h55l18-16 25 16h44l22-12 26 12h55l22-10 28 10h65'/%3E%3Cpath d='M18 86l30-18 22 18h40l16-14 24 14h48l20-16 24 16h46l24-18 30 18'/%3E%3C/g%3E%3Cg fill='rgba(255,255,255,0.18)'%3E%3Ccircle cx='55' cy='24' r='3'/%3E%3Ccircle cx='98' cy='24' r='3'/%3E%3Ccircle cx='164' cy='24' r='3'/%3E%3Ccircle cx='216' cy='24' r='3'/%3E%3Ccircle cx='293' cy='24' r='3'/%3E%3Ccircle cx='48' cy='68' r='3'/%3E%3Ccircle cx='70' cy='86' r='3'/%3E%3Ccircle cx='126' cy='72' r='3'/%3E%3Ccircle cx='174' cy='86' r='3'/%3E%3Ccircle cx='242' cy='70' r='3'/%3E%3Ccircle cx='288' cy='86' r='3'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 420px 140px;
          background-repeat: repeat-x;
          background-position: top center;
          opacity: 0.55;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        }

        .ct-home-stars {
          position: absolute;
          inset: -10%;
          background-image: radial-gradient(
              rgba(255, 255, 255, 0.55) 1px,
              transparent 1px
            ),
            radial-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px),
            radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 140px 140px, 220px 220px, 320px 320px;
          background-position: 0 0, 40px 70px, -60px -30px;
          opacity: 0.05;
        }

        .ct-home-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            90% 70% at 50% 14%,
            rgba(4, 11, 26, 0) 28%,
            rgba(2, 6, 23, 0.9) 100%
          );
          opacity: 0.95;
        }

        .ct-hero-title {
          line-height: 1.06;
          letter-spacing: -0.03em;
        }

        .ct-hero-title em {
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          font-weight: 500;
          color: #dbeeff;
        }

        @media (max-width: 767px) {
          .ct-home-topology {
            opacity: 0.28;
            background-size: 320px 120px;
          }

          .ct-home-hex::before,
          .ct-home-hex::after {
            width: 44%;
            opacity: 0.72;
          }
        }
      `}</style>
    </div>
  );
}
