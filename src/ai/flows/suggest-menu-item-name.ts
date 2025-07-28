'use server';

/**
 * @fileOverview AI-powered menu item name suggestion flow.
 *
 * This file defines a Genkit flow that suggests a menu item name based on the provided ingredients and description.
 *
 * @exports {
 *   suggestMenuItemName: (input: SuggestMenuItemNameInput) => Promise<string>;
 *   SuggestMenuItemNameInput: type;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMenuItemNameInputSchema = z.object({
  ingredients: z
    .string()
    .describe('The list of ingredients used in the menu item.'),
  description: z.string().describe('A description of the menu item.'),
});

export type SuggestMenuItemNameInput = z.infer<typeof SuggestMenuItemNameInputSchema>;

const SuggestMenuItemNameOutputSchema = z.string().describe('The suggested menu item name.');

/**
 * Suggests a menu item name based on the provided ingredients and description.
 * @param input The input containing ingredients and description.
 * @returns A promise that resolves to the suggested menu item name.
 */
export async function suggestMenuItemName(input: SuggestMenuItemNameInput): Promise<string> {
  return suggestMenuItemNameFlow(input);
}

const suggestMenuItemNamePrompt = ai.definePrompt({
  name: 'suggestMenuItemNamePrompt',
  input: {schema: SuggestMenuItemNameInputSchema},
  output: {schema: SuggestMenuItemNameOutputSchema},
  prompt: `You are a creative menu item name generator for a coffee shop.

  Based on the ingredients and description provided, suggest a concise and appealing name for the menu item.

  Ingredients: {{{ingredients}}}
  Description: {{{description}}}

  Name:`, // The prompt should end with 