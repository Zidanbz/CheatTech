"use server";

import { z } from "zod";
import { addOrder } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { redirect } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function submitOrder(values: z.infer<typeof formSchema>, product: Product) {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }
  
  try {
    const orderData = {
      name: parsed.data.name,
      email: parsed.data.email,
      productId: product.id,
      productName: product.name,
      price: product.price,
    };
    await addOrder(orderData);
  } catch (e) {
    console.error("Gagal membuat pesanan:", e);
    return { error: "Gagal menyimpan pesanan. Silakan coba lagi." };
  }

  redirect('/sukses');
}
