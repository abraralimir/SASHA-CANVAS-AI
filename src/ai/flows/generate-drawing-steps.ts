'use server';
/**
 * @fileOverview This file defines a Genkit flow that generates a sequence of drawing steps from a text prompt.
 *
 * - generateDrawingSteps - A function that takes a text prompt and returns a series of drawing instructions.
 * - GenerateDrawingStepsInput - The input type for the generateDrawingSteps function.
 * - GenerateDrawingStepsOutput - The return type for the generateDrawingSteps function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const DrawingStepSchema = z.object({
  tool: z
    .enum(['pen', 'line', 'rectangle', 'circle'])
    .describe('The drawing tool to use for this step.'),
  color: z.string().describe('The hex color code for the stroke (e.g., "#FF0000").'),
  strokeWidth: z.number().describe('The width of the stroke.'),
  points: z
    .array(PointSchema)
    .describe('An array of points to define the shape. "pen" and "line" use a series of points. "rectangle" and "circle" use two points (start and end).'),
  thought: z.string().optional().describe("The AI's thought process for this drawing step."),
});

const GenerateDrawingStepsInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for what to draw.'),
  canvasWidth: z.number().describe('The width of the canvas.'),
  canvasHeight: z.number().describe('The height of the canvas.'),
});
export type GenerateDrawingStepsInput = z.infer<typeof GenerateDrawingStepsInputSchema>;

const GenerateDrawingStepsOutputSchema = z.object({
  steps: z.array(DrawingStepSchema),
});
export type GenerateDrawingStepsOutput = z.infer<typeof GenerateDrawingStepsOutputSchema>;


export async function generateDrawingSteps(input: GenerateDrawingStepsInput): Promise<GenerateDrawingStepsOutput> {
  return generateDrawingStepsFlow(input);
}

const drawingPrompt = ai.definePrompt({
  name: 'drawingAgentPrompt',
  input: { schema: GenerateDrawingStepsInputSchema },
  output: { schema: GenerateDrawingStepsOutputSchema },
  prompt: `You are an expert AI artist. Your task is to interpret a user's prompt and convert it into a series of drawing steps to create the artwork on a digital canvas.

The user wants you to draw: "{{prompt}}"

The canvas size is {{canvasWidth}}px wide and {{canvasHeight}}px tall.

Break down the drawing process into logical steps. For each step, you must decide:
1.  The "thought": Briefly explain what you are about to draw.
2.  The "tool": Choose from 'pen', 'line', 'rectangle', or 'circle'. Use 'pen' for freeform shapes and details.
3.  The "color": Select an appropriate hex color code.
4.  The "strokeWidth": Choose a suitable stroke width.
5.  The "points": Provide the coordinates for the tool.
    - For 'pen' and 'line', provide a sequence of points.
    - For 'rectangle', provide the top-left and bottom-right corner points.
    - For 'circle', provide the center point and a point on the circumference.

Generate a JSON object that contains a "steps" array, following the defined output schema. Ensure all coordinates are within the canvas dimensions (0-{{canvasWidth}}, 0-{{canvasHeight}}). Be creative and detailed.
`,
});

const generateDrawingStepsFlow = ai.defineFlow(
  {
    name: 'generateDrawingStepsFlow',
    inputSchema: GenerateDrawingStepsInputSchema,
    outputSchema: GenerateDrawingStepsOutputSchema,
  },
  async (input) => {
    const { output } = await drawingPrompt(input);
    return output!;
  }
);
