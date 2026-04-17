'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/products/product-card";
import { useMemo, useState } from 'react';

const CATEGORY_ORDER = ['Karir', 'Portfolio', 'Industri', 'Belanja'] as const;
type ProductCategory = (typeof CATEGORY_ORDER)[number];

function detectProductCategories(product: Product): ProductCategory[] {
  const haystack = `${product.name} ${product.headline} ${product.subheadline}`.toLowerCase();
  const categories: ProductCategory[] = [];

  if (/karir|career|cv|resume|job|personal/i.test(haystack)) categories.push('Karir');
  if (/portfolio|portofolio|agency|creative|freelance|designer/i.test(haystack))
    categories.push('Portfolio');
  if (/industri|corporate|company|saas|startup|business|b2b/i.test(haystack))
    categories.push('Industri');
  if (/belanja|shop|store|ecommerce|e-commerce|produk|catalog/i.test(haystack))
    categories.push('Belanja');

  if (categories.length === 0) categories.push('Portfolio');
  return categories;
}

export default function AllProductsPage() {
  const firestore = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'products'), where('active', '==', true))
        : null,
    [firestore]
  );
  const { data: products, isLoading: isLoadingProducts } =
    useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      const categoryMatch =
        selectedCategory === 'Semua' ||
        detectProductCategories(product).includes(selectedCategory);
      const searchMatch =
        normalizedSearch.length === 0 ||
        `${product.name} ${product.headline} ${product.subheadline}`
          .toLowerCase()
          .includes(normalizedSearch);

      return categoryMatch && searchMatch;
    });
  }, [products, searchTerm, selectedCategory]);

  const productsByCategory = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filteredProducts.filter((product) =>
        detectProductCategories(product).includes(category)
      ),
    })).filter((group) => group.items.length > 0);
  }, [filteredProducts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="relative overflow-hidden bg-[#000C26]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: "#000C26",
          backgroundImage:
            "radial-gradient(52% 70% at 112% 34%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.14) 30%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0) 68%)",
        }}
      />
      <div className="relative z-10 container mx-auto px-4 pb-12 pt-24 md:px-6 md:pb-16 md:pt-28">
          <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">Semua Template</h1>
              <p className="mt-4 max-w-2xl text-blue-100/90 md:text-xl/relaxed">
                  Jelajahi semua template portofolio profesional kami yang siap pakai.
              </p>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-white">
                  Telusur berdasarkan kategori
                </p>

                <div className="mt-3 max-w-md">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/70" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Cari template..."
                      className="h-10 w-full rounded-full border border-white/20 bg-white/10 pl-10 pr-4 text-sm text-white outline-none placeholder:text-blue-100/70 focus:border-white/45"
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(['Semua', ...CATEGORY_ORDER] as const).map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`inline-flex h-9 items-center rounded-full border px-5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-white/45 bg-white/20 text-white'
                            : 'border-white/20 bg-white/10 text-blue-100 hover:bg-white/15'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
          </div>

          {isLoadingProducts ? (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          ) : (
            <div className="space-y-12">
              {productsByCategory.map((group) => (
                <section key={group.category}>
                  <h2 className="mb-5 text-3xl font-bold tracking-tight text-[#7ed0ff]">
                    {group.category}
                  </h2>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {group.items.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              ))}
            </div>
          )}
           { !isLoadingProducts && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                  <h2 className="text-2xl font-semibold text-white">Template tidak ditemukan</h2>
                  <p className="mt-2 text-blue-100/80">Coba ubah kata pencarian atau pilih kategori lain.</p>
              </div>
           )}
      </div>

    </div>
  );
}
