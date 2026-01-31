'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AllProductsPage() {
  const firestore = useFirestore();

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
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Semua Template</h1>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl/relaxed">
                Jelajahi semua template portofolio profesional kami yang siap pakai.
            </p>
        </div>

        {isLoadingProducts ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {products?.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card className="overflow-hidden transform transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <CardContent className="p-0">
                      <Link href={`/produk/${product.id}`}>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full aspect-[4/3] object-cover"
                          data-ai-hint="portfolio website"
                        />
                      </Link>
                      <div className="p-4">
                        <h3 className="font-bold text-lg truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4 h-10 line-clamp-2">
                          {product.subheadline}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-xl">
                            Rp {product.price.toLocaleString('id-ID')}
                          </p>
                          <Button asChild>
                            <Link href={`/checkout?productId=${product.id}`}>Beli Sekarang</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
        )}
         { !isLoadingProducts && products?.length === 0 && (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">Belum Ada Produk</h2>
                <p className="text-muted-foreground mt-2">Silakan cek kembali nanti.</p>
            </div>
         )}
    </div>
  );
}
