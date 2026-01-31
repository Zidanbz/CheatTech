'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Archive,
  FileEdit,
  Filter,
  Package,
  PlusCircle,
  Search,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import StatCard from '@/components/admin/stat-card';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  const handleStatusChange = async (productId: string, newStatus: boolean) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', productId);
    try {
      // Using a non-blocking update for better UI experience
      updateDocumentNonBlocking(productRef, { active: newStatus });
      toast({
        title: "Status Diperbarui",
        description: `Produk telah ditandai sebagai ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui status produk.",
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    const total = products?.length || 0;
    const active = products?.filter((p) => p.active).length || 0;
    const inactive = total - active;
    return { total, active, inactive };
  }, [products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Produk</h1>
          <p className="text-muted-foreground">
            Kelola katalog template portofolio digital Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Produk"
          value={stats.total.toString()}
          icon={<Package className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Produk Aktif"
          value={stats.active.toString()}
          icon={<Package className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Draf / Nonaktif"
          value={stats.inactive.toString()}
          icon={<Archive className="h-6 w-6 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama produk..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Thumbnail</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <div className="flex justify-center items-center">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.imageUrl || 'https://placehold.co/64x64'}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover aspect-square"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {product.subheadline}
                      </div>
                    </TableCell>
                    <TableCell>
                      Rp {product.price.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                        <Switch
                          id={`status-${product.id}`}
                          checked={product.active}
                          onCheckedChange={(newStatus) =>
                            handleStatusChange(product.id, newStatus)
                          }
                          aria-label={`Status for ${product.name}`}
                        />
                         <span className="text-sm">{product.active ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <FileEdit className="h-4 w-4" />
                            <span className="sr-only">Edit Produk</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus Produk</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    Tidak ada produk ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Menampilkan {paginatedProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0}-
              {Math.min(currentPage * productsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={currentPage === p ? 'default' : 'outline'}
                  size="sm"
                  className="w-9"
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
