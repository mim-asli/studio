
'use server';

/**
 * @fileOverview Generates a map image for a given location.
 *
 * - generateMapImage - Generates a fantasy-style map image.
 * - GenerateMapImageInput - Input for the generation.
 * - GenerateMapImageOutput - Output containing the image URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateMapImageInputSchema = z.object({
  locationName: z.string().describe('The name of the location to generate a map for.'),
});
export type GenerateMapImageInput = z.infer<typeof GenerateMapImageInputSchema>;

const GenerateMapImageOutputSchema = z.object({
  mapImageUrl: z.string().describe("A data URI of the generated map image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateMapImageOutput = z.infer<typeof GenerateMapImageOutputSchema>;

export async function generateMapImage(input: GenerateMapImageInput): Promise<GenerateMapImageOutput> {
  return generateMapImageFlow(input);
}


const generateMapImageFlow = ai.defineFlow(
  {
    name: 'generateMapImageFlow',
    inputSchema: GenerateMapImageInputSchema,
    outputSchema: GenerateMapImageOutputSchema,
  },
  async ({ locationName }) => {
    const prompt = `A fantasy map of "${locationName}" on old, worn parchment. Include artistic details like a compass rose, sea monsters if applicable, and calligraphic labels. The style should be hand-drawn and ancient.`;

    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: prompt,
    });

    if (!media.url) {
        throw new Error('Failed to generate map image.');
    }
    
    return { mapImageUrl: media.url };
  }
);
