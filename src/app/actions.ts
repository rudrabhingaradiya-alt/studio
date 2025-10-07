'use server';

import {
  puzzleRecommendation,
  type PuzzleRecommendationInput,
} from '@/ai/flows/puzzle-recommendation-system';
import {
  selectPuzzle,
  type PuzzleSelectionInput,
} from '@/ai/flows/personalized-puzzle-difficulty';
import { generateBotAvatar, BotAvatarInput } from '@/ai/flows/bot-avatar-generator';
import { createBot, CreateBotInput } from '@/ai/flows/create-bot-flow';


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

export async function getBotAvatar(input: BotAvatarInput) {
    try {
        const result = await generateBotAvatar(input);
        return { avatar: result.imageDataUri, error: null };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('Bot avatar generation failed:', error);
        return { avatar: null, error };
    }
}

export async function getNewBot(input: CreateBotInput) {
    try {
        const result = await createBot(input);
        return { bot: result, error: null };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred.';
        console.error('New bot creation failed:', error);
        return { bot: null, error };
    }
}
