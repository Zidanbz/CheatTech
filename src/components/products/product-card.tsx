import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  href?: string;
  className?: string;
};

function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

function buildRequirementsText(requirements?: string[]) {
  if (!requirements?.length) return null;
  const firstTwo = requirements.slice(0, 2);
  const rest = requirements.length - firstTwo.length;
  const suffix = rest > 0 ? ` +${rest} lainnya` : '';
  return `Persyaratan: ${firstTwo.join(', ')}${suffix}`;
}

export default function ProductCard({ product, href, className }: ProductCardProps) {
  const detailHref = href ?? `/produk/${product.id}`;
  const requirementsText = buildRequirementsText(product.requirements);
  const originalPrice =
    typeof product.originalPrice === 'number' && product.originalPrice > product.price
      ? product.originalPrice
      : null;

  return (
    <div
      className={cn(
        'group flex h-full flex-col rounded-2xl border border-white/10 bg-[#03122f]/85 p-3 shadow-[0_16px_42px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      <Link href={detailHref} className="block">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-white shadow-[0_10px_26px_rgba(0,0,0,0.3)]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            data-ai-hint="portfolio website"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-blue-100/85">
          {product.subheadline}
        </p>

        {requirementsText && (
          <p className="mt-1 line-clamp-1 text-[11px] text-blue-200/75">
            {requirementsText}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#f3a84f]">
          <Star className="h-4 w-4 fill-current" aria-hidden="true" />
          <span className="font-medium">5.0</span>
          <span className="font-medium">[1.2k Reviews]</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <Link
            href={detailHref}
            className="inline-flex h-8 min-w-[92px] items-center justify-center rounded-full border border-white/30 bg-white/15 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/25"
          >
            Detail
          </Link>

          <div className="text-right leading-tight">
            {originalPrice !== null && (
              <div className="text-[11px] text-blue-100/60 line-through">
                {formatRupiah(originalPrice)}
              </div>
            )}
            <div className="text-base font-semibold text-white">
              {formatRupiah(product.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
