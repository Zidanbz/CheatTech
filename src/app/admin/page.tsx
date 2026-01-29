import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProduct, getOrders } from "@/lib/firestore";
import ProductForm from './product-form';
import HeadlineGenerator from './headline-generator';
import OrdersList from './orders-list';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 0; // Disable caching for admin page

export default async function AdminPage() {
  // Fetch data in parallel
  const [product, orders] = await Promise.all([
    getProduct('main-template'),
    getOrders()
  ]);

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
