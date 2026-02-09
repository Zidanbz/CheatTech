import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#060a16] text-slate-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_10%,rgba(56,189,248,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_85%_20%,rgba(34,197,94,0.16),transparent_65%)]" />
        <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative z-10 container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              CheatTech
            </h3>
            <p className="text-sm text-slate-300/90">
              Platform penyedia template website portofolio berkualitas untuk talenta digital Indonesia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-slate-100">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produk" className="text-slate-300 hover:text-cyan-300 transition-colors">Semua Template</Link></li>
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Paket Bundle</Link></li>
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Jasa Setup</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-slate-100">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Panduan Instalasi</Link></li>
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-slate-100">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Ketentuan Layanan</Link></li>
              <li><Link href="#" className="text-slate-300 hover:text-cyan-300 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>(c) {new Date().getFullYear()} CheatTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
