"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function parseCssRgb(value: string) {
  const open = value.indexOf("(");
  const close = value.lastIndexOf(")");
  if (open === -1 || close === -1) return null;
  const raw = value.slice(open + 1, close).trim();

  const [channelsRaw, alphaRaw] = raw.split("/").map((part) => part.trim());
  const channels = channelsRaw
    .split(/[ ,]+/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => Number.parseFloat(part));

  if (channels.length !== 3 || channels.some((n) => Number.isNaN(n))) return null;
  const [r, g, b] = channels;

  let a = 1;
  if (alphaRaw) {
    const parsed = Number.parseFloat(alphaRaw);
    if (!Number.isNaN(parsed)) a = parsed;
  } else if (raw.includes(",")) {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length === 4) {
      const parsed = Number.parseFloat(parts[3]);
      if (!Number.isNaN(parsed)) a = parsed;
    }
  }

  return { r, g, b, a };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function extractGradientStops(backgroundImage: string) {
  const regex = /rgba?\([^)]+\)/g;
  const matches = backgroundImage.match(regex) ?? [];
  return matches
    .map((match) => parseCssRgb(match))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const headerRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBackgroundLight, setIsBackgroundLight] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;
    const updateHeaderOffset = () => {
      const rect = header.getBoundingClientRect();
      const offset = Math.max(0, Math.ceil(rect.height + 12));
      root.style.setProperty("--header-offset", `${offset}px`);
    };

    updateHeaderOffset();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateHeaderOffset());
      observer.observe(header);
    }

    window.addEventListener("resize", updateHeaderOffset, { passive: true });

    return () => {
      window.removeEventListener("resize", updateHeaderOffset);
      observer?.disconnect();
      root.style.setProperty("--header-offset", "0px");
    };
  }, []);

  const navLinks = [
    { href: "/#keuntungan", label: "Why CheatTech?" },
    { href: "/#cara-kerja", label: "Cara Kerja" },
    { href: "/#custom", label: "Website Custom" },
  ];

  const hubungiLink = buildWhatsAppLink({
    message: "Halo CheatTech, saya ingin konsultasi website custom.",
  });

  useEffect(() => {
    const update = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;

        const shouldTreatAsScrolled = !isHome || window.scrollY > 16;
        setIsScrolled(shouldTreatAsScrolled);

        const probeX = Math.max(24, Math.round(window.innerWidth / 2));
        const probeY = 140;
        const stack = document.elementsFromPoint(probeX, probeY);
        const behind = stack.find((element) => {
          if (!headerRef.current) return true;
          return !headerRef.current.contains(element);
        }) as HTMLElement | undefined;

        const tone = (() => {
          let current: HTMLElement | null = behind ?? document.body;
          while (current && current !== document.documentElement) {
            const style = window.getComputedStyle(current);
            const backgroundColor = style.backgroundColor;
            const parsed =
              backgroundColor && backgroundColor.startsWith("rgb")
                ? parseCssRgb(backgroundColor)
                : null;

            if (parsed && parsed.a > 0.05) {
              const lum = relativeLuminance(parsed);
              return lum > 0.6 ? "light" : "dark";
            }

            if (style.backgroundImage && style.backgroundImage !== "none") {
              const stops = extractGradientStops(style.backgroundImage);
              if (stops.length > 0) {
                const luminances = stops.map((stop) => relativeLuminance(stop));
                const avg =
                  luminances.reduce((sum, value) => sum + value, 0) /
                  luminances.length;
                return avg > 0.6 ? "light" : "dark";
              }
            }

            current = current.parentElement;
          }
          return "dark";
        })();

        setIsBackgroundLight(tone === "light");
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isHome]);

  const headerVariant = useMemo(() => {
    return isBackgroundLight ? "dark" : "light";
  }, [isBackgroundLight]);

  const chromeClass = useMemo(() => {
    return isScrolled
      ? "border border-white/10 bg-gradient-to-r from-[#000C26]/95 via-[#001a4d]/95 to-[#002a80]/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      : "border border-white/10 bg-gradient-to-r from-[#000C26]/90 via-[#001a4d]/90 to-[#002a80]/90 shadow-[0_28px_70px_rgba(0,0,0,0.4)]";
  }, [isScrolled]);

  const brandClass =
  "bg-gradient-to-r from-white via-blue-100/90 to-blue-200/70 bg-clip-text text-transparent";
  const navLinkClass =
    "text-sm font-medium text-white transition-colors hover:text-blue-100 hover:underline hover:underline-offset-4";

  const mobileButtonClass = "text-white hover:bg-white/10 hover:text-white";

  const ctaClass =
    "h-10 rounded-xl border border-white/40 bg-[#000C26] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,12,38,0.35)] hover:bg-[#00163f]";

  return (
    <header ref={headerRef} className="fixed top-0 z-[100] w-full">
      <div className="container pt-4 md:pt-6">
        <div
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 backdrop-blur transition-all duration-300 md:h-16 md:px-8 ${chromeClass}`}
        >
          <Link href="/" className="flex items-center">
            <span className={`text-xl font-semibold tracking-tight ${brandClass}`}>
              CheatTech
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={mobileButtonClass}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col p-4">
                    <Link href="/" className="mb-8 flex items-center space-x-2">
                      <span className="font-bold">CheatTech</span>
                    </Link>
                    <nav className="flex flex-col gap-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <Link
                        href="/produk"
                        className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                      >
                        Beli Template
                      </Link>
                      <a
                        href={hubungiLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium"
                      >
                        Hubungi Kami
                      </a>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Button asChild className={ctaClass}>
              <Link href="/produk">Beli Template</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
