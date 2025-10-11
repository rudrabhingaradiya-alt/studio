
'use server';

/**
 * @fileOverview Generates a sequence of chess puzzles.
 *
 * - generatePuzzleSequence - A function that creates a curated list of puzzles.
 * - PuzzleSequenceInput - The input type for the generatePuzzleSequence function.
 * - PuzzleSequenceOutput - The return type for the generatePuzzleSequence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { puzzles, Puzzle } from '@/lib/puzzles';

const PuzzleSequenceInputSchema = z.object({
  theme: z.string().optional().describe('A specific chess theme for the puzzles (e.g., "fork", "pin", "mate in 2").'),
  numberOfPuzzles: z.number().int().positive().max(10).default(5).describe('The number of puzzles to include in the sequence.'),
});
export type PuzzleSequenceInput = z.infer<typeof PuzzleSequenceInputSchema>;

const PuzzleSequenceOutputSchema = z.object({
  puzzleIds: z.array(z.string()).describe('An ordered list of puzzle IDs that form a logical sequence.'),
});
export type PuzzleSequenceOutput = z.infer<typeof PuzzleSequenceOutputSchema>;

export async function generatePuzzleSequence(input: PuzzleSequenceInput): Promise<PuzzleSequenceOutput> {
  return generatePuzzleSequenceFlow(input);
}

// Convert full puzzle objects to a simplified string format for the prompt
const availablePuzzlesString = puzzles.map(p => `ID: ${p.id}, Rating: ${p.rating}, Theme: ${p.theme}, Difficulty: ${p.difficulty}`).join('\n');

const prompt = ai.definePrompt({
  name: 'generatePuzzleSequencePrompt',
  input: {schema: PuzzleSequenceInputSchema},
  output: {schema: PuzzleSequenceOutputSchema},
  prompt: `You are an expert chess coach. Your task is to create a logical sequence of chess puzzles for a student.

You will be given the desired number of puzzles and an optional theme.
You must select puzzles from the provided list to create a sequence that starts with 'easy' puzzles, progresses to 'medium', and finishes with 'hard' puzzles.
The puzzles within each difficulty should also be ordered by increasing rating where possible.

Your response MUST be an array of puzzle IDs in the correct order.

Number of Puzzles: {{numberOfPuzzles}}
{{#if theme}}
Theme: {{theme}}
{{/if}}

Available Puzzles:
${availablePuzzlesString}

Select exactly {{numberOfPuzzles}} puzzle IDs from the available list and return them as an ordered array, progressing from easy to medium to hard.
`,
});

const generatePuzzleSequenceFlow = ai.defineFlow(
  {
    name: 'generatePuzzleSequenceFlow',
    inputSchema: PuzzleSequenceInputSchema,
    outputSchema: PuzzleSequenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output?.puzzleIds || output.puzzleIds.length === 0) {
        throw new Error("The AI failed to generate a puzzle sequence.");
    }
    
    return output;
  }
);
