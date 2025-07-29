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
  optimalChange: z
    .record(z.number())
    .describe(
      'The optimal denominations of change to return to the customer. The key should be the denomination (as a string) and the value should be the count.'
    ),
  calculationRationale: z
    .string()
    .describe(
      'Explanation of how change was calculated and why the suggested denominations are optimal.'
    ),
});
export type CalculateChangeOutput = z.infer<typeof CalculateChangeOutputSchema>;

export async function calculateChange(input: CalculateChangeInput): Promise<CalculateChangeOutput> {
  return calculateChangeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateChangePrompt',
  input: {schema: CalculateChangeInputSchema},
  output: {schema: CalculateChangeOutputSchema},
  prompt: `You are a helpful cashier assistant for a coffee shop in Indonesia. Your goal is to calculate the optimal change to return to the customer using Indonesian Rupiah (IDR) denominations, minimizing the number of bills and coins.

Available IDR Denominations:
Coins: 100, 200, 500, 1000
Bills: 2000, 5000, 10000, 20000, 50000, 100000

Transaction Details:
Total Amount: {{{totalAmount}}}
Amount Paid: {{{amountPaid}}}

Instructions:
1. Calculate the total change due.
2. Determine the optimal combination of IDR bills and coins to give as change.
3. Provide a brief rationale for why your suggested combination is optimal (e.g., "uses the fewest bills/coins").
4. Format the output as a valid JSON object matching the provided schema. Keys in optimalChange should be strings representing the denomination (e.g., "100000").
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
