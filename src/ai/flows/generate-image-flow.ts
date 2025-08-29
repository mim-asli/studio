
'use server';

/**
 * @fileOverview Generates an image from a text prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';


export async function generateImage(prompt: string): Promise<string> {
    return generateImageFlow(prompt);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const {media} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt,
    });
    return media.url;
  }
);
