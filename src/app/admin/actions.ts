"use server";

import { generateHeadlineSuggestions } from "@/ai/flows/generate-headline-suggestions";

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
