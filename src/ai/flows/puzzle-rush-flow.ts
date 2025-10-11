
'use server';

/**
 * @fileOverview Generates a sequence of chess puzzles for Puzzle Rush mode.
 *
 * - generatePuzzleRush - A function that creates a list of puzzles for the game mode.
 * - PuzzleRushInput - The input type for the generatePuzzleRush function.
 * - PuzzleRushOutput - The return type for the generatePuzzleRush function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { puzzles, Puzzle } from '@/lib/puzzles';

const PuzzleRushInputSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The desired difficulty of the puzzles.'),
  numberOfPuzzles: z.number().int().positive().max(50).default(30).describe('The number of puzzles to generate for the rush.'),
  playerRating: z.number().optional().describe("The player's current rating to help tailor puzzle difficulty."),
});
export type PuzzleRushInput = z.infer<typeof PuzzleRushInputSchema>;

const PuzzleRushOutputSchema = z.object({
  puzzles: z.array(z.string()).describe('An ordered list of puzzle IDs for the puzzle rush session.'),
});
export type PuzzleRushOutput = z.infer<typeof PuzzleRushOutputSchema>;


export async function generatePuzzleRush(input: PuzzleRushInput): Promise<PuzzleRushOutput> {
  return generatePuzzleRushFlow(input);
}

const availablePuzzlesString = puzzles.map(p => `ID: ${p.id}, Rating: ${p.rating}, Difficulty: ${p.difficulty}`).join('\n');

const prompt = ai.definePrompt({
  name: 'generatePuzzleRushPrompt',
  input: {schema: PuzzleRushInputSchema},
  output: {schema: PuzzleRushOutputSchema},
  prompt: `You are an expert chess coach creating a "Puzzle Rush" challenge.
Your task is to select a sequence of {{numberOfPuzzles}} puzzles for a player.

The player has requested puzzles of '{{difficulty}}' difficulty.
{{#if playerRating}}The player's rating is {{playerRating}}. Try to select puzzles with a rating close to this, but stay within the '{{difficulty}}' category.{{/if}}

The puzzles should be selected from the list below and ordered by increasing rating to create a smooth difficulty curve.

Available Puzzles:
${availablePuzzlesString}

Select exactly {{numberOfPuzzles}} puzzle IDs and return them as an ordered array.
`,
});

const generatePuzzleRushFlow = ai.defineFlow(
  {
    name: 'generatePuzzleRushFlow',
    inputSchema: PuzzleRushInputSchema,
    outputSchema: PuzzleRushOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.puzzles || output.puzzles.length === 0) {
      throw new Error("The AI failed to generate a puzzle rush sequence.");
    }
    return output;
  }
);
