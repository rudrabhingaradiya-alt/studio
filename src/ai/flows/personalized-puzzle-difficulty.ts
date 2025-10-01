'use server';

/**
 * @fileOverview Personalized puzzle difficulty selection based on user game history.
 *
 * - selectPuzzle - A function that selects a puzzle based on user's game history.
 * - PuzzleSelectionInput - The input type for the selectPuzzle function.
 * - PuzzleSelectionOutput - The return type for the selectPuzzle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PuzzleSelectionInputSchema = z.object({
  gameHistory: z.array(
    z.object({
      puzzleId: z.string(),
      solved: z.boolean().describe('Whether the puzzle was solved correctly'),
      attempts: z.number().describe('Number of attempts to solve the puzzle'),
    })
  ).describe('The user game history including puzzle IDs, solve status and number of attempts.'),
  availablePuzzles: z.array(z.string()).describe('List of available puzzle IDs'),
});
export type PuzzleSelectionInput = z.infer<typeof PuzzleSelectionInputSchema>;

const PuzzleSelectionOutputSchema = z.object({
  selectedPuzzleId: z.string().describe('The ID of the selected puzzle.'),
  reason: z.string().describe('Reasoning behind the puzzle selection')
});
export type PuzzleSelectionOutput = z.infer<typeof PuzzleSelectionOutputSchema>;

export async function selectPuzzle(input: PuzzleSelectionInput): Promise<PuzzleSelectionOutput> {
  return selectPuzzleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'selectPuzzlePrompt',
  input: {schema: PuzzleSelectionInputSchema},
  output: {schema: PuzzleSelectionOutputSchema},
  prompt: `You are an expert chess tutor. Given a user's game history and a list of available puzzles, select the most appropriate puzzle for them to solve next.

Consider the user's past performance. If they have solved most puzzles easily, select a more difficult puzzle. If they have struggled, select an easier puzzle. Balance difficulty with engagement. Avoid selecting puzzles that are either too easy or too hard, ensuring the user remains motivated and challenged.

Game History:
{{#each gameHistory}}
  Puzzle ID: {{puzzleId}}, Solved: {{solved}}, Attempts: {{attempts}}
{{/each}}

Available Puzzles:
{{#each availablePuzzles}}
  {{this}}
{{/each}}

Reason your decision in the 'reason' field and always select one puzzle from the available puzzles list.
Ensure the selected puzzle is from the available puzzles list and return its ID in the 'selectedPuzzleId' field.

Ensure that the selectedPuzzleId is one of the available puzzles`, 
});

const selectPuzzleFlow = ai.defineFlow(
  {
    name: 'selectPuzzleFlow',
    inputSchema: PuzzleSelectionInputSchema,
    outputSchema: PuzzleSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
