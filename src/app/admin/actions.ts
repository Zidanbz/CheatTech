"use server";

import { z } from "zod";
import { updateProduct } from "@/lib/firestore";
import { generateHeadlineSuggestions } from "@/ai/flows/generate-headline-suggestions";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  headline: z.string().min(1, "Headline tidak boleh kosong"),
  subheadline: z.string().min(1, "Subheadline tidak boleh kosong"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  price: z.coerce.number().min(0, "Harga harus positif"),
  features: z.string().transform(val => val.split(',').map(s => s.trim())),
});

export async function updateProductAction(id: string, formData: FormData) {
  const rawFormData = {
    name: formData.get('name'),
    headline: formData.get('headline'),
    subheadline: formData.get('subheadline'),
    description: formData.get('description'),
    price: formData.get('price'),
    features: formData.get('features'),
  }

  const parsed = productSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return { error: "Data tidak valid: " + parsed.error.flatten().fieldErrors };
  }

  try {
    await updateProduct(id, parsed.data);
    revalidatePath('/admin');
    return { success: "Produk berhasil diperbarui." };
  } catch (e) {
    console.error("Gagal memperbarui produk:", e);
    return { error: "Gagal memperbarui produk di database." };
  }
}

export async function generateHeadlinesAction(productDescription: string, currentHeadline: string) {
    try {
        const result = await generateHeadlineSuggestions({
            productDescription,
            currentHeadline
        });
        return { suggestions: result.suggestedHeadlines };
    } catch(e) {
        console.error("Gagal menghasilkan headline:", e);
        return { error: "Gagal menghubungi layanan AI. Silakan coba lagi." };
    }
}
