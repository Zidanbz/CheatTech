'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { Loader2, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";
import { generateHeadlinesAction, updateProductAction } from "./actions";

export default function HeadlineGenerator({ product }: { product: Product }) {
    const [isGenerating, startGenerating] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [description, setDescription] = useState(product.description);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { toast } = useToast();

    const handleGenerate = () => {
        startGenerating(async () => {
            const result = await generateHeadlinesAction(description, product.headline);
            if (result.error) {
                toast({
                    title: "Gagal Menghasilkan Headline",
                    description: result.error,
                    variant: "destructive"
                });
                setSuggestions([]);
            } else {
                setSuggestions(result.suggestions || []);
                toast({
                    title: "Headline Dihasilkan!",
                    description: "Pilih salah satu headline yang Anda suka."
                });
            }
        });
    };

    const handleApplyHeadline = (headline: string) => {
        startSaving(async () => {
            const formData = new FormData();
            formData.append('headline', headline);
            // We need to pass all fields to satisfy the schema, even if not changing them
            formData.append('name', product.name);
            formData.append('subheadline', product.subheadline);
            formData.append('description', product.description);
            formData.append('price', String(product.price));
            formData.append('features', product.features.join(', '));
            
            const result = await updateProductAction(product.id, formData);
            if(result.error) {
                 toast({
                    title: "Gagal Menyimpan",
                    description: `Gagal menyimpan headline: ${JSON.stringify(result.error)}`,
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Sukses!",
                    description: "Headline produk berhasil diperbarui."
                });
            }
        });
    }

    return (
        <CardContent className="space-y-6">
            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Deskripsi Produk (untuk konteks AI)</label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
                <p className="text-xs text-muted-foreground mt-1">AI akan menggunakan deskripsi ini untuk membuat headline.</p>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Hasilkan Sugesti
            </Button>

            {isGenerating && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI sedang berpikir...</span>
                </div>
            )}

            {suggestions.length > 0 && (
                 <div className="space-y-4 pt-4">
                    <h3 className="font-semibold">Sugesti Headline:</h3>
                    <div className="grid gap-4">
                        {suggestions.map((s, i) => (
                            <Card key={i} className="bg-secondary/50">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <p className="font-mono text-sm">{s}</p>
                                    <Button size="sm" onClick={() => handleApplyHeadline(s)} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Gunakan
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    )
}
