
'use server';

/**
 * @fileOverview Analyzes a chess game and provides move-by-move feedback.
 *
 * - analyzeGame - A function that analyzes game moves.
 * - GameAnalysisInput - The input type for the analyzeGame function.
 * - GameAnalysisOutput - The return type for the analyzeGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoveAnalysisSchema = z.object({
  move: z.string().describe('The move in Standard Algebraic Notation (e.g., e4, Nf3).'),
  classification: z.enum([
    'brilliant',
    'great',
    'best',
    'excellent',
    'good',
    'book',
    'inaccuracy',
    'mistake',
    'miss',
    'blunder',
  ]).describe('The classification of the move.'),
  comment: z.string().optional().describe('A short comment explaining the classification.'),
});

const GameAnalysisInputSchema = z.object({
  moveHistory: z.array(z.string()).describe("A list of all moves made in the game in SAN format."),
});
export type GameAnalysisInput = z.infer<typeof GameAnalysisInputSchema>;

const GameAnalysisOutputSchema = z.object({
  moveAnalysis: z.array(MoveAnalysisSchema).describe('An analysis for each move in the game.'),
  opening: z.object({
    accuracy: z.number().min(0).max(100).describe('Player accuracy during the opening (e.g., 95.5).'),
    summary: z.string().describe('A brief summary of the opening performance.'),
  }),
  middlegame: z.object({
    accuracy: z.number().min(0).max(100).describe('Player accuracy during the middlegame.'),
    summary: z.string().describe('A brief summary of the middlegame performance.'),
  }),
  endgame: z.object({
    accuracy: z.number().min(0).max(100).describe('Player accuracy during the endgame.'),
    summary: z.string().describe('A brief summary of the endgame performance.'),
  }),
  keyMoments: z.array(z.object({
    move: z.string(),
    description: z.string()
  })).describe("Identify 2-3 key moments in the game, like turning points or critical blunders.")
});
export type GameAnalysisOutput = z.infer<typeof GameAnalysisOutputSchema>;


export async function analyzeGame(input: GameAnalysisInput): Promise<GameAnalysisOutput> {
  return gameAnalysisFlow(input);
}


const prompt = ai.definePrompt({
  name: 'gameAnalysisPrompt',
  input: {schema: GameAnalysisInputSchema},
  output: {schema: GameAnalysisOutputSchema},
  prompt: `You are a world-class chess grandmaster and coach. Your task is to analyze a chess game and provide a detailed review.

Game Moves:
{{#each moveHistory}}
  {{this}}
{{/each}}

Please provide the following analysis:
1.  **Move-by-move Analysis**: For each move, classify it as 'brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'miss', or 'blunder'. Provide a concise comment for significant moves (brilliant, blunder, mistake).
2.  **Phase Accuracy**: Calculate a percentage accuracy score for the user's moves in the opening, middlegame, and endgame.
3.  **Phase Summaries**: Write a one-sentence summary for each phase, highlighting strengths or weaknesses.
4.  **Key Moments**: Identify 2-3 key moments, such as turning points or critical mistakes.

Focus on providing constructive feedback to help the player learn. Your analysis should be returned in the specified JSON format.`,
});

const gameAnalysisFlow = ai.defineFlow(
  {
    name: 'gameAnalysisFlow',
    inputSchema: GameAnalysisInputSchema,
    outputSchema: GameAnalysisOutputSchema,
  },
  async input => {
    // In a real app, you might use a chess engine for more accurate analysis.
    // Here we are relying on the LLM's chess knowledge.
    const {output} = await prompt(input);
    return output!;
  }
);
