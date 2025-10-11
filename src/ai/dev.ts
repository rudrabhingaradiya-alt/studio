
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/puzzle-recommendation-system.ts';
import '@/ai/flows/personalized-puzzle-difficulty.ts';
import '@/ai/flows/bot-avatar-generator.ts';
import '@/ai/flows/create-bot-flow.ts';
import '@/ai/flows/game-analysis-flow.ts';
import '@/ai/flows/puzzle-sequence-generator.ts';
import '@/ai/flows/puzzle-rush-flow.ts';
