'use server';

import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order } from "./types";
import { revalidatePath } from "next/cache";

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

const defaultProduct: Omit<Product, 'id'> = {
    name: "Template Portfolio Instan",
    headline: "Buat Kesan Pertama yang Tak Terlupakan",
    subheadline: "Tingkatkan personal branding Anda dengan template portfolio yang modern, profesional, dan mudah disesuaikan. Dapatkan pekerjaan impian Anda sekarang!",
    description: "Buat portfolio profesional dalam hitungan menit dengan template siap pakai kami. Dirancang untuk mahasiswa dan fresh graduate untuk memamerkan proyek dan keterampilan mereka secara efektif.",
    features: ["Desain Modern & Responsif", "Mudah Disesuaikan", "SEO-Friendly", "Dukungan Penuh"],
    price: 149000,
    imageUrl: "https://picsum.photos/seed/cheatsheet/1200/800",
};

export async function getProduct(id: string): Promise<Product> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
        // Doc doesn't exist, so we create it with default data
        await setDoc(docRef, defaultProduct);
        console.log(`Default product created with ID: ${id}`);
        return { id, ...defaultProduct };
    }
}

export async function updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, data);
    
    // Revalidate paths to show updated data
    revalidatePath('/');
    revalidatePath('/produk');
    revalidatePath('/admin');
    console.log(`Product ${id} updated.`);
}

export async function addOrder(orderData: Omit<Order, 'id' | 'timestamp'>) {
    const newOrder = {
        ...orderData,
        timestamp: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), newOrder);
    revalidatePath('/admin');
    return docRef.id;
}

export async function getOrders(): Promise<Order[]> {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
}
