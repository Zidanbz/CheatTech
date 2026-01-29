import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Pesanan Berhasil!</CardTitle>
          <CardDescription>
            Terima kasih telah melakukan pemesanan. Kami akan segera memproses pesanan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80">
            Detail pesanan dan instruksi selanjutnya telah dikirimkan ke alamat email Anda. Mohon periksa folder inbox dan spam Anda.
          </p>
          <Button asChild>
            <Link href="/">Kembali ke Halaman Utama</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
