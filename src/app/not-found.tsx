import Link from "next/link";
import Image from "next/image";
import notFoundAsset from "../../assets/404.png";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-[#000C26]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(64% 90% at 100% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 34%, rgba(255,255,255,0) 68%)",
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-14">
        <div className="relative w-full max-w-4xl text-center">
          <Image
            src={notFoundAsset}
            alt="404 page artwork"
            className="mx-auto h-auto w-full max-w-[900px]"
            priority
          />

          <div className="absolute left-1/2 top-[60%] w-full max-w-md -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              className="mx-auto inline-flex h-12 min-w-[240px] items-center justify-center rounded-full border border-white/20 bg-white/12 px-8 text-2xl font-semibold text-white transition hover:bg-white/20"
            >
              Kembali →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
