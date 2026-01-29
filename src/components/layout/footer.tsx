import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-2">CheatTech</h3>
            <p className="text-sm text-muted-foreground">Platform penyedia template website portofolio berkualitas untuk talenta digital Indonesia.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Semua Template</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Paket Bundle</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Jasa Setup</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Panduan Instalasi</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Hubungi Kami</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Ketentuan Layanan</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CheatTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
