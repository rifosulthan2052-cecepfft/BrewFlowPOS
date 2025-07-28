'use server';

/**
 * @fileOverview Calculates the optimal change to give back to a customer.
 *
 * - calculateChange - A function that calculates the optimal change.
 * - CalculateChangeInput - The input type for the calculateChange function.
 * - CalculateChangeOutput - The return type for the calculateChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateChangeInputSchema = z.object({
  totalAmount: z.number().describe('The total amount due for the transaction.'),
  amountPaid: z.number().describe('The amount paid by the customer.'),
});
export type CalculateChangeInput = z.infer<typeof CalculateChangeInputSchema>;

const CalculateChangeOutputSchema = z.object({
  changeDue: z.number().describe('The total change amount due to the customer.'),
  optimalChange: z.record(z.number()).describe('The optimal denominations of change to return to the customer.'),
  calculationRationale: z.string().describe('Explanation of how change was calculated and why the suggested denominations are optimal.')
});
export type CalculateChangeOutput = z.infer<typeof CalculateChangeOutputSchema>;

export async function calculateChange(input: CalculateChangeInput): Promise<CalculateChangeOutput> {
  return calculateChangeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateChangePrompt',
  input: {schema: CalculateChangeInputSchema},
  output: {schema: CalculateChangeOutputSchema},
  prompt: `You are a helpful cashier assistant. Your goal is to calculate the optimal change to return to the customer, minimizing the number of bills and coins.

  Total Amount: {{{totalAmount}}}
  Amount Paid: {{{amountPaid}}}

  Calculate the change due and provide the optimal denominations of bills and coins to return. Provide a rationale for why this is the optimal configuration.
  Ensure the outputted JSON is valid and can be parsed by a machine.
  `,
});

const calculateChangeFlow = ai.defineFlow(
  {
    name: 'calculateChangeFlow',
    inputSchema: CalculateChangeInputSchema,
    outputSchema: CalculateChangeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
