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
};

export type Order = {
  id: string;
  name: string;
  email: string;
  productId: string;
  productName: string;
  price: number;
  timestamp: Timestamp;
  userId: string;
};
