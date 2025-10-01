'use server';

/**
 * @fileOverview A puzzle recommendation AI agent.
 *
 * - puzzleRecommendation - A function that suggests puzzles based on user puzzle history.
 * - PuzzleRecommendationInput - The input type for the puzzleRecommendation function.
 * - PuzzleRecommendationOutput - The return type for the puzzleRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PuzzleRecommendationInputSchema = z.object({
  puzzleHistory: z
    .array(z.object({
      puzzleId: z.string(),
      attempts: z.number().int().nonnegative(),
      solved: z.boolean(),
    }))
    .describe('A list of puzzles the user has attempted, including the puzzle ID, number of attempts, and whether they solved it.'),
  numberOfPuzzles: z.number().int().positive().default(3).describe('The number of puzzles to recommend.'),
});
export type PuzzleRecommendationInput = z.infer<typeof PuzzleRecommendationInputSchema>;

const PuzzleRecommendationOutputSchema = z.object({
  puzzleRecommendations: z.array(z.string()).describe('A list of puzzle IDs recommended for the user to practice.'),
});
export type PuzzleRecommendationOutput = z.infer<typeof PuzzleRecommendationOutputSchema>;

export async function puzzleRecommendation(input: PuzzleRecommendationInput): Promise<PuzzleRecommendationOutput> {
  return puzzleRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'puzzleRecommendationPrompt',
  input: {schema: PuzzleRecommendationInputSchema},
  output: {schema: PuzzleRecommendationOutputSchema},
  prompt: `You are an AI assistant that recommends chess puzzles to users based on their past performance.

You will receive a list of puzzles the user has attempted, including the number of attempts and whether they solved it.

Based on this information, you will recommend {{numberOfPuzzles}} puzzles that the user should practice to improve their skills.

Only return the puzzle IDs in a JSON array.

Here is the user's puzzle history:

{{#each puzzleHistory}}
  Puzzle ID: {{puzzleId}}, Attempts: {{attempts}}, Solved: {{solved}}
{{/each}}`,
});

const puzzleRecommendationFlow = ai.defineFlow(
  {
    name: 'puzzleRecommendationFlow',
    inputSchema: PuzzleRecommendationInputSchema,
    outputSchema: PuzzleRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
