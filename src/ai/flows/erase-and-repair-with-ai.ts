'use server';
/**
 * @fileOverview AI-powered eraser and repair tool for drawings.
 *
 * - eraseAndRepairWithAI - A function that erases a selected part of a drawing and repairs the surrounding area using AI.
 * - EraseAndRepairWithAIInput - The input type for the eraseAndRepairWithAI function.
 * - EraseAndRepairWithAIOutput - The return type for the eraseAndRepairWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EraseAndRepairWithAIInputSchema = z.object({
  drawingDataUri: z
    .string()
    .describe(
      "The complete drawing as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  selectionDataUri: z
    .string()
    .describe(
      "The selected part of the drawing to be erased and repaired, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EraseAndRepairWithAIInput = z.infer<typeof EraseAndRepairWithAIInputSchema>;

const EraseAndRepairWithAIOutputSchema = z.object({
  repairedDrawingDataUri: z
    .string()
    .describe(
      'The data URI of the drawing with the selected part erased and the surrounding area repaired by AI.'
    ),
});
export type EraseAndRepairWithAIOutput = z.infer<typeof EraseAndRepairWithAIOutputSchema>;

export async function eraseAndRepairWithAI(input: EraseAndRepairWithAIInput): Promise<EraseAndRepairWithAIOutput> {
  return eraseAndRepairWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eraseAndRepairWithAIPrompt',
  input: {schema: EraseAndRepairWithAIInputSchema},
  output: {schema: EraseAndRepairWithAIOutputSchema},
  prompt: `You are an AI that seamlessly removes a selected portion of an image and repairs the surrounding area. The goal is to make the erased and repaired area indistinguishable from the rest of the image.

Erase and repair the selected area from the main drawing.

Main Drawing: {{media url=drawingDataUri}}
Selected Area: {{media url=selectionDataUri}}`,
});

const eraseAndRepairWithAIFlow = ai.defineFlow(
  {
    name: 'eraseAndRepairWithAIFlow',
    inputSchema: EraseAndRepairWithAIInputSchema,
    outputSchema: EraseAndRepairWithAIOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.drawingDataUri}},
        {text: `erase the portion in the selection and repair the surrounding area: {{media url=selectionDataUri}}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {repairedDrawingDataUri: media!.url!};
  }
);
