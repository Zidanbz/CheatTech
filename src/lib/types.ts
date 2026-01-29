import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  features: string[];
  price: number;
  imageUrl: string;
  active: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  price: number;
  orderDate: Timestamp;
  userId: string;
  status: 'Completed' | 'Pending' | 'Processed';
};

export type LandingPage = {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
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
