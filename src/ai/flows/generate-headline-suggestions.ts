'use server';

/**
 * @fileOverview AI-powered headline generator for site administrators.
 *
 * - generateHeadlineSuggestions - A function that generates alternative, conversion-focused headlines.
 * - GenerateHeadlineSuggestionsInput - The input type for the generateHeadlineSuggestions function.
 * - GenerateHeadlineSuggestionsOutput - The return type for the generateHeadlineSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeadlineSuggestionsInputSchema = z.object({
  productDescription: z
    .string()
    .describe('The description of the product or service.'),
  currentHeadline: z.string().optional().describe('The current headline.'),
});

export type GenerateHeadlineSuggestionsInput = z.infer<
  typeof GenerateHeadlineSuggestionsInputSchema
>;

const GenerateHeadlineSuggestionsOutputSchema = z.object({
  suggestedHeadlines: z
    .array(z.string())
    .describe('An array of suggested alternative headlines.'),
});

export type GenerateHeadlineSuggestionsOutput = z.infer<
  typeof GenerateHeadlineSuggestionsOutputSchema
>;

export async function generateHeadlineSuggestions(
  input: GenerateHeadlineSuggestionsInput
): Promise<GenerateHeadlineSuggestionsOutput> {
  return generateHeadlineSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHeadlineSuggestionsPrompt',
  input: {schema: GenerateHeadlineSuggestionsInputSchema},
  output: {schema: GenerateHeadlineSuggestionsOutputSchema},
  prompt: `You are a marketing expert specializing in writing concise, conversion-focused headlines.

  Your goal is to generate alternative headlines for a landing page, based on the product description provided.

  The headlines should be engaging and encourage visitors to take action (e.g., "Lihat Demo", "Beli Sekarang").

  Current Headline (if any): {{currentHeadline}}
  Product Description: {{productDescription}}

  Generate 3 alternative headlines.
  Format your response as a JSON object with a "suggestedHeadlines" key containing an array of strings.
  The current headline, if provided, should not be included in the suggested headlines.
  The headlines must be very short, with a maximum of 10 words.
  Make sure the headlines are unique and do not repeat themselves.
  Always use the original language of the product description.
  Make sure the generated headlines are professional and do not include any offensive or inappropriate content.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateHeadlineSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateHeadlineSuggestionsFlow',
    inputSchema: GenerateHeadlineSuggestionsInputSchema,
    outputSchema: GenerateHeadlineSuggestionsOutputSchema,
    rateLimit: {
      kind: 'fixed-window',
      limit: 5,
      window: '1m',
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
