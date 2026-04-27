"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { scrollToSection } from "@/lib/scroll-to-section";

type SectionLinkProps = {
  sectionId: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
};

export default function SectionLink({
  sectionId,
  className,
  children,
  onNavigate,
}: SectionLinkProps) {
  const pathname = usePathname();
  const href = `/#${sectionId}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") {
      onNavigate?.();
      return;
    }

    event.preventDefault();
    const hasScrolled = scrollToSection(sectionId);

    if (hasScrolled) {
      window.history.replaceState(null, "", href);
    }

    onNavigate?.();
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
