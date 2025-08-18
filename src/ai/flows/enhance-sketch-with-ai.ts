'use server';
/**
 * @fileOverview This file defines a Genkit flow to enhance or edit an existing image based on a prompt.
 *
 * - enhanceSketchWithAI - A function that takes an image (as a data URI) and a prompt, and returns an edited image.
 * - EnhanceSketchWithAIInput - The input type for the enhanceSketchWithAI function.
 * - EnhanceSketchWithAIOutput - The return type for the enhanceSketchWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSketchWithAIInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      "The source image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .describe("A prompt describing the desired edits or enhancements."),
});
export type EnhanceSketchWithAIInput = z.infer<typeof EnhanceSketchWithAIInputSchema>;

const EnhanceSketchWithAIOutputSchema = z.object({
  enhancedImageDataUri: z
    .string()
    .describe("The enhanced or edited image, as a data URI."),
});
export type EnhanceSketchWithAIOutput = z.infer<typeof EnhanceSketchWithAIOutputSchema>;

export async function enhanceSketchWithAI(input: EnhanceSketchWithAIInput): Promise<EnhanceSketchWithAIOutput> {
  return enhanceSketchWithAIFlow(input);
}

const enhanceSketchWithAIFlow = ai.defineFlow(
  {
    name: 'enhanceSketchWithAIFlow',
    inputSchema: EnhanceSketchWithAIInputSchema,
    outputSchema: EnhanceSketchWithAIOutputSchema,
  },
  async input => {
     const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.sketchDataUri}},
        {text: `Edit the provided image based on the following instructions: ${input.prompt}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }
    
    return {enhancedImageDataUri: media.url};
  }
);
