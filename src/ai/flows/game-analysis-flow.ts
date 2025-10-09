
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


const gameAnalysisFlow = ai.defineFlow(
  {
    name: 'gameAnalysisFlow',
    inputSchema: GameAnalysisInputSchema,
    outputSchema: GameAnalysisOutputSchema,
  },
  async (input) => {
    const model = ai.model('googleai/gemini-2.5-flash');
    const moveHistoryStr = input.moveHistory.join(' ');

    const [moveAnalysis, phaseAnalysis, keyMoments] = await Promise.all([
      ai.generate({
        model,
        prompt: `Analyze the following chess moves: ${moveHistoryStr}. Classify each move as 'brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'miss', or 'blunder'. Provide a concise comment for significant moves.`,
        output: { schema: z.object({ moveAnalysis: z.array(MoveAnalysisSchema) }) },
      }),
      ai.generate({
        model,
        prompt: `Based on these moves: ${moveHistoryStr}, calculate percentage accuracy for opening, middlegame, and endgame. Provide a one-sentence summary for each phase.`,
        output: {
          schema: z.object({
            opening: z.object({ accuracy: z.number(), summary: z.string() }),
            middlegame: z.object({ accuracy: z.number(), summary: z.string() }),
            endgame: z.object({ accuracy: z.number(), summary: z.string() }),
          }),
        },
      }),
      ai.generate({
        model,
        prompt: `From this game: ${moveHistoryStr}, identify 2-3 key moments (turning points, critical blunders).`,
        output: {
          schema: z.object({
            keyMoments: z.array(z.object({ move: z.string(), description: z.string() })),
          }),
        },
      }),
    ]);

    return {
      moveAnalysis: moveAnalysis.output!.moveAnalysis,
      opening: phaseAnalysis.output!.opening,
      middlegame: phaseAnalysis.output!.middlegame,
      endgame: phaseAnalysis.output!.endgame,
      keyMoments: keyMoments.output!.keyMoments,
    };
  }
);
