'use server';

/**
 * @fileOverview Generates stylized avatars for chess bots.
 *
 * - generateBotAvatar - A function that creates an avatar based on a bot's personality.
 * - BotAvatarInput - The input type for the generateBotAvatar function.
 * - BotAvatarOutput - The return type for the generateBotAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BotAvatarInputSchema = z.object({
  name: z.string().describe('The name of the chess bot.'),
  rating: z.number().describe("The bot's chess rating (e.g., 800, 1500, 2200)."),
  personality: z.string().describe("A brief description of the bot's playing style and personality."),
});
export type BotAvatarInput = z.infer<typeof BotAvatarInputSchema>;

const BotAvatarOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated avatar image as a data URI. Should be in 'data:image/png;base64,<encoded_data>' format."),
});
export type BotAvatarOutput = z.infer<typeof BotAvatarOutputSchema>;

export async function generateBotAvatar(input: BotAvatarInput): Promise<BotAvatarOutput> {
  return generateBotAvatarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBotAvatarPrompt',
  input: {schema: BotAvatarInputSchema},
  output: {schema: BotAvatarOutputSchema},
  prompt: `Generate a stylized, cartoon-like avatar for a chess bot. The avatar should be a headshot of a character that visually represents the bot's name, rating, and personality.

Bot Name: {{name}}
Rating: {{rating}}
Personality: {{personality}}

Style Guidelines:
- Use a vibrant, modern, and slightly cartoonish art style.
- The character should be expressive and memorable.
- The background should be a simple, abstract gradient that complements the character.
- The image should be square and suitable for use as a profile picture.
- Do NOT include any text, letters, or numbers in the image.
- The final output must be a data URI string.`,
  config: {
    model: 'googleai/gemini-2.5-flash-image-preview',
    responseModalities: ['TEXT', 'IMAGE'],
  }
});

const generateBotAvatarFlow = ai.defineFlow(
  {
    name: 'generateBotAvatarFlow',
    inputSchema: BotAvatarInputSchema,
    outputSchema: BotAvatarOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            {text: `Generate a stylized, cartoon-like avatar for a chess bot. The avatar should be a headshot of a character that visually represents the bot's name, rating, and personality.

Bot Name: ${input.name}
Rating: ${input.rating}
Personality: ${input.personality}

Style Guidelines:
- Use a vibrant, modern, and slightly cartoonish art style.
- The character should be expressive and memorable.
- The background should be a simple, abstract gradient that complements the character.
- The image should be square and suitable for use as a profile picture.
- Do NOT include any text, letters, or numbers in the image.`}
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media.url) {
      throw new Error('Image generation failed to produce an avatar.');
    }
    
    return {
      imageDataUri: media.url
    };
  }
);
