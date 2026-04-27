import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  features: string[];
  requirements?: string[];
  price: number;
  originalPrice?: number;
  imageUrl: string;
  demoUrl?: string;
  active: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  orderDate: Timestamp;
  userId: string;
  status: 'Completed' | 'Pending' | 'Processed';
  fulfillmentMode?: 'self' | 'assisted';
  deliveryStatus?: 'AwaitingPayment' | 'AwaitingSetup' | 'InProgress' | 'ReadyToDeliver' | 'Delivered';
  customerNotes?: string;
  invoiceNumber?: string;
  paymentProvider?: 'midtrans';
  paymentUrl?: string;
  midtransToken?: string;
  midtransTransactionId?: string;
  midtransTransactionStatus?: string;
  midtransPaymentType?: string;
  midtransFraudStatus?: string;
  voucherId?: string;
  voucherCode?: string;
  voucherDiscountType?: 'percentage' | 'fixed';
  voucherDiscountValue?: number;
  processedAt?: Timestamp;
  midtransNotificationRaw?: any;
};

export type Feature = {
  title: string;
  description: string;
};

export type Step = {
  title: string;
  description: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export type LandingPageShowcaseCategory = {
  categorySlug: string;
  label: string;
  imageHint: string;
  productId: string;
};

export type LandingPage = {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  problemHeadline: string;
  problemText: string;
  featuresSectionBadge: string;
  featuresSectionHeadline: string;
  featuresSectionSubheadline: string;
  features: Feature[];
  stepsSectionHeadline: string;
  stepsSectionSubheadline: string;
  steps: Step[];
  testimonialsSectionHeadline: string;
  testimonials: Testimonial[];
  showcaseCategories: LandingPageShowcaseCategory[];
};

export type Voucher = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Timestamp;
  expiryDate: Timestamp;
  isActive: boolean;
  usageCount: number;
  usageLimit: number;
  minPurchase?: number;
};

export type Referral = {
  id: string;
  referrerName: string;
  referrerId: string;
  referredEmail: string;
  referralDate: Timestamp;
  status: 'Pending' | 'Completed' | 'Canceled';
  commission: number;
};
