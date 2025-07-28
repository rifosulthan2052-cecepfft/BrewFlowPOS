'use server';

import { calculateChange, CalculateChangeInput, CalculateChangeOutput } from '@/ai/flows/calculate-change';

export async function getChangeCalculation(input: CalculateChangeInput): Promise<{ success: true; data: CalculateChangeOutput } | { success: false; error: string }> {
  try {
    const result = await calculateChange(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getChangeCalculation:', error);
    return { success: false, error: 'Failed to calculate change. Please try again.' };
  }
}
