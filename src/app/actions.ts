'use server';

import {
  puzzleRecommendation,
  type PuzzleRecommendationInput,
} from '@/ai/flows/puzzle-recommendation-system';
import {
  selectPuzzle,
  type PuzzleSelectionInput,
} from '@/ai/flows/personalized-puzzle-difficulty';

export async function getPuzzleRecommendations(
  input: PuzzleRecommendationInput
) {
  try {
    const result = await puzzleRecommendation(input);
    return { recommendations: result.puzzleRecommendations, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Puzzle recommendation failed:', error);
    return { recommendations: [], error };
  }
}

export async function getNextPuzzle(input: PuzzleSelectionInput) {
  try {
    const result = await selectPuzzle(input);
    return { data: result, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Personalized puzzle selection failed:', error);
    return { data: null, error };
  }
}
