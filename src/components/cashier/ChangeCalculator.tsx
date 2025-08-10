
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getChangeCalculation } from '@/lib/actions';
import type { CalculateChangeOutput } from '@/ai/flows/calculate-change';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { CurrencyInput } from '../ui/currency-input';

const formSchema = z.object({
  amountPaid: z.coerce.number().min(0, 'Amount must be positive.'),
});

type ChangeCalculatorProps = {
  totalAmount: number;
  onPaymentSuccess: () => void;
  disabled?: boolean;
};

export function ChangeCalculator({ totalAmount, onPaymentSuccess, disabled = false }: ChangeCalculatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CalculateChangeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currency } = useApp();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountPaid: totalAmount > 0 ? totalAmount : 0,
    },
  });
  
  const amountPaid = form.watch('amountPaid');

  useEffect(() => {
    form.setValue('amountPaid', totalAmount > 0 ? totalAmount : 0)
    setResult(null);
  }, [totalAmount, form]);
  
  const suggestedDenominations = useMemo(() => {
    if (currency !== 'IDR' || totalAmount <= 0) return [];
    
    const denominations = [10000, 20000, 50000, 100000, 150000, 200000];
    const suggestions = new Set<number>();
    
    if (denominations.includes(totalAmount)) {
      suggestions.add(totalAmount);
    }
    
    const nextDenom = denominations.find(d => d > totalAmount);
    if (nextDenom) {
      suggestions.add(nextDenom);
    }
    
    if (totalAmount < 50000) {
      suggestions.add(50000);
    } 
    if (totalAmount < 100000) {
      suggestions.add(100000);
    }

    if (totalAmount > 100000) {
        const nextHundred = Math.ceil(totalAmount / 100000) * 100000;
        if(nextHundred > totalAmount) suggestions.add(nextHundred);
        if(nextHundred + 50000 > totalAmount) suggestions.add(nextHundred + 50000);
    }

    const roundedUp50k = Math.ceil(totalAmount / 50000) * 50000;
    if (roundedUp50k > totalAmount) {
      suggestions.add(roundedUp50k);
    }

    const finalSuggestions = Array.from(suggestions)
      .filter(s => s > 0 && s >= totalAmount)
      .sort((a, b) => a - b)
      .slice(0, 4);

    return finalSuggestions;

  }, [totalAmount, currency]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.amountPaid < totalAmount) {
      form.setError('amountPaid', { type: 'manual', message: 'Amount paid is less than total.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    if (values.amountPaid === totalAmount) {
      setIsLoading(false);
      onPaymentSuccess();
      return;
    }

    // For non-IDR currencies, just do simple math.
    if (currency !== 'IDR') {
        const changeDue = values.amountPaid - totalAmount;
        setResult({
            changeDue,
            optimalChange: { 'Change': changeDue },
            calculationRationale: `Change calculated for ${currency}.`
        });
        setIsLoading(false);
        setTimeout(() => {
            onPaymentSuccess();
        }, 3000);
        return;
    }

    const response = await getChangeCalculation({
      totalAmount,
      amountPaid: values.amountPaid,
    });

    setIsLoading(false);
    if (response.success) {
      setResult(response.data);
      setTimeout(() => {
        onPaymentSuccess();
      }, 3000);
    } else {
      setError(response.error);
    }
  }

  const handleSuggestionClick = (amount: number) => {
    form.setValue('amountPaid', amount, { shouldValidate: true });
    // Trigger submission after setting value
    setTimeout(() => form.handleSubmit(onSubmit)(), 0);
  }

  const getButtonText = () => {
    if (amountPaid > totalAmount) return 'Calculate Change & Pay';
    return 'Pay with Exact Change';
  }

  return (
    <Card className="bg-secondary/50 border-dashed mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Pay with Cash</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'IDR' ? 'Rp' : '$'}</span>
                       <CurrencyInput value={field.value} onValueChange={field.onChange} className="pl-8 text-right" disabled={disabled}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {suggestedDenominations.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {suggestedDenominations.map(denom => (
                  <Button 
                    key={denom} 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleSuggestionClick(denom)}
                    className="text-xs"
                    disabled={disabled || isLoading}
                  >
                    {formatCurrency(denom, currency)}
                  </Button>
                ))}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || disabled}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </form>
        </Form>
        
        {error && <p className="text-destructive text-sm mt-4">{error}</p>}

        {result && (
          <div className="mt-4 space-y-4 p-4 bg-background rounded-lg animate-in fade-in">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Change Due</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(result.changeDue, currency)}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Optimal Change:</h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(result.optimalChange).map(([denom, count]) => (
                  <li key={denom} className="flex justify-between">
                    <span>{denom.startsWith('Rp') || currency === 'USD' ? denom : `Rp ${denom}`}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground italic mt-2">{result.calculationRationale}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    