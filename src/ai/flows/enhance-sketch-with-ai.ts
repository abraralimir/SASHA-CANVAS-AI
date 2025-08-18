// Enhance Sketch with AI
'use server';
/**
 * @fileOverview This file defines a Genkit flow to enhance a user's rough sketch into a detailed and artistic image using AI.
 *
 * - enhanceSketchWithAI - A function that takes a sketch (as a data URI) and enhances it using AI.
 * - EnhanceSketchWithAIInput - The input type for the enhanceSketchWithAI function.
 * - EnhanceSketchWithAIOutput - The return type for the enhanceSketchWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSketchWithAIInputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      "A sketch, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .optional()
    .describe("Optional prompt to further guide the AI's enhancement."),
});
export type EnhanceSketchWithAIInput = z.infer<typeof EnhanceSketchWithAIInputSchema>;

const EnhanceSketchWithAIOutputSchema = z.object({
  enhancedImageDataUri: z
    .string()
    .describe("The enhanced image, as a data URI."),
});
export type EnhanceSketchWithAIOutput = z.infer<typeof EnhanceSketchWithAIOutputSchema>;

export async function enhanceSketchWithAI(input: EnhanceSketchWithAIInput): Promise<EnhanceSketchWithAIOutput> {
  return enhanceSketchWithAIFlow(input);
}

const enhanceSketchWithAIPrompt = ai.definePrompt({
  name: 'enhanceSketchWithAIPrompt',
  input: {schema: EnhanceSketchWithAIInputSchema},
  output: {schema: EnhanceSketchWithAIOutputSchema},
  prompt: `You are an AI that enhances user sketches into detailed and artistic images.

  The user will provide a sketch as a data URI. Enhance this sketch, and return the enhanced image as a data URI.

  Sketch: {{media url=sketchDataUri}}

  {{#if prompt}}
  Additionally, the user has provided the following prompt for guidance:
  {{prompt}}
  {{/if}}
  `,
});

const enhanceSketchWithAIFlow = ai.defineFlow(
  {
    name: 'enhanceSketchWithAIFlow',
    inputSchema: EnhanceSketchWithAIInputSchema,
    outputSchema: EnhanceSketchWithAIOutputSchema,
  },
  async input => {
    const {output} = await enhanceSketchWithAIPrompt(input);
    return output!;
  }
);
