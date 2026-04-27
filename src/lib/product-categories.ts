import type { Product } from "@/lib/types";

export const PRODUCT_CATEGORIES = [
  {
    slug: "karir",
    label: "Karir",
    imageHint: "career website",
    matcher: /karir|career|cv|resume|job|personal/i,
  },
  {
    slug: "portofolio",
    label: "Portofolio",
    imageHint: "portfolio website",
    matcher: /portfolio|portofolio|agency|creative|freelance|designer/i,
  },
  {
    slug: "industri",
    label: "Industri",
    imageHint: "industrial website",
    matcher: /industri|corporate|company|saas|startup|business|b2b/i,
  },
  {
    slug: "belanja",
    label: "Belanja",
    imageHint: "ecommerce website",
    matcher: /belanja|shop|store|ecommerce|e-commerce|produk|catalog/i,
  },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["label"];
export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["slug"];
export type ProductCategoryFilter = ProductCategory | "Semua";
export type LandingPageShowcaseCategoryConfig = {
  categorySlug: string;
  label: string;
  imageHint: string;
  productId: string;
};

export const DEFAULT_SHOWCASE_CATEGORIES: LandingPageShowcaseCategoryConfig[] =
  PRODUCT_CATEGORIES.map(({ slug, label, imageHint }) => ({
    categorySlug: slug,
    label,
    imageHint,
    productId: "",
  }));

export function detectProductCategories(product: Product): ProductCategory[] {
  const haystack =
    `${product.name} ${product.headline} ${product.subheadline}`.toLowerCase();
  const categories = PRODUCT_CATEGORIES.filter(({ matcher }) => matcher.test(haystack)).map(
    ({ label }) => label
  );

  if (categories.length === 0) {
    return ["Portofolio"];
  }

  return categories;
}

export function getProductCategoryByLabel(label: ProductCategory) {
  return PRODUCT_CATEGORIES.find((category) => category.label === label)!;
}

export function getProductCategoryBySlug(slug: ProductCategorySlug) {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug)!;
}

export function findProductCategoryBySlug(slug?: string | null) {
  if (!slug) {
    return undefined;
  }

  return PRODUCT_CATEGORIES.find((category) => category.slug === slug);
}

export function parseProductCategory(value?: string | null): ProductCategoryFilter {
  if (!value) {
    return "Semua";
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "semua") {
    return "Semua";
  }

  const matchedCategory = PRODUCT_CATEGORIES.find(
    ({ label, slug }) =>
      normalizedValue === label.toLowerCase() || normalizedValue === slug
  );

  return matchedCategory?.label ?? "Semua";
}

export function buildCategoryProductsHref(category: ProductCategory) {
  const { slug } = getProductCategoryByLabel(category);
  return `/produk?category=${slug}`;
}

export function buildCategoryProductsHrefBySlug(slug?: string | null) {
  if (!slug) {
    return "/produk";
  }

  const matchedCategory = PRODUCT_CATEGORIES.find((category) => category.slug === slug);
  return matchedCategory ? `/produk?category=${matchedCategory.slug}` : "/produk";
}

export function normalizeLandingPageShowcaseCategories(
  categories?: Array<Partial<LandingPageShowcaseCategoryConfig>> | null
) {
  return DEFAULT_SHOWCASE_CATEGORIES.map((defaultCategory, index) => {
    const incomingCategory = categories?.[index];
    const matchedPreset = findProductCategoryBySlug(incomingCategory?.categorySlug);

    return {
      categorySlug: matchedPreset?.slug ?? defaultCategory.categorySlug,
      label:
        incomingCategory?.label?.trim() ||
        matchedPreset?.label ||
        defaultCategory.label,
      imageHint:
        incomingCategory?.imageHint?.trim() ||
        matchedPreset?.imageHint ||
        defaultCategory.imageHint,
      productId: incomingCategory?.productId?.trim() || "",
    };
  });
}
