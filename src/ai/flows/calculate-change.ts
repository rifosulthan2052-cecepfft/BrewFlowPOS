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
    .record(z.string(), z.number())
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
  prompt: `You are a helpful cashier assistant for a coffee shop in Indonesia. Calculate the optimal change for a customer using Indonesian Rupiah (IDR).

Available Denominations:
Bills: 100000, 50000, 20000, 10000, 5000, 2000
Coins: 1000, 500, 200, 100

Transaction:
Total: {{{totalAmount}}}
Paid: {{{amountPaid}}}

Your task:
1.  Calculate the exact change due (Paid - Total).
2.  Determine the combination of bills and coins that gives this change using the fewest possible items.
3.  Provide a short, one-sentence rationale for the calculation.
4.  Return the result as a valid JSON object matching the output schema.
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
