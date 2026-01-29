'use client'; 

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from './product-form';
import HeadlineGenerator from './headline-generator';
import OrdersList from './orders-list';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Order, Product } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Loader2 } from "lucide-react";

const defaultProductData: Omit<Product, 'id'> = {
    name: "Template Portfolio Instan",
    headline: "Buat Kesan Pertama yang Tak Terlupakan",
    subheadline: "Tingkatkan personal branding Anda dengan template portfolio yang modern, profesional, dan mudah disesuaikan. Dapatkan pekerjaan impian Anda sekarang!",
    description: "Buat portfolio profesional dalam hitungan menit dengan template siap pakai kami. Dirancang untuk mahasiswa dan fresh graduate untuk memamerkan proyek dan keterampilan mereka secara efektif.",
    features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"],
    price: 149000,
    imageUrl: "https://picsum.photos/seed/cheatsheet/1200/800",
};

export default function AdminPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    async function fetchData() {
      if (!firestore || !user) return;

      setIsLoading(true);

      async function getProduct(id: string): Promise<Product> {
        const docRef = doc(firestore, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            await setDoc(docRef, defaultProductData);
            return { id, ...defaultProductData };
        }
      }

      async function getOrders(): Promise<Order[]> {
          const q = query(collection(firestore, 'orders'), orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const ordersData: Order[] = [];
          querySnapshot.forEach((doc) => {
              ordersData.push({ id: doc.id, ...doc.data() } as Order);
          });
          return ordersData;
      }
      
      try {
        const [productData, ordersData] = await Promise.all([
          getProduct('main-template'),
          getOrders()
        ]);
        setProduct(productData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();

  }, [firestore, user]);


  if (isUserLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product || !orders) {
    return (
      <div className="container mx-auto py-10 text-center">
         <h1 className="text-3xl font-bold mb-6 font-headline">Admin Dashboard</h1>
         <p className="text-destructive">Failed to load data. You may not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 font-headline">Admin Dashboard</h1>
      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="headline">AI Headlines</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Ubah detail produk yang ditampilkan di seluruh situs.
              </CardDescription>
            </CardHeader>
            <ProductForm product={product} />
          </Card>
        </TabsContent>
        <TabsContent value="headline">
          <Card>
             <CardHeader>
              <CardTitle>AI Headline Generator</CardTitle>
              <CardDescription>
                Gunakan AI untuk membuat headline yang menarik dan berkonversi tinggi.
              </CardDescription>
            </CardHeader>
            <HeadlineGenerator product={product} />
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
             <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>
                Lihat semua pesanan yang masuk.
              </CardDescription>
            </CardHeader>
            <OrdersList orders={orders} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
