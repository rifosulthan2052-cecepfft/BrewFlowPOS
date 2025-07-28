'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getChangeCalculation } from '@/lib/actions';
import type { CalculateChangeOutput } from '@/ai/flows/calculate-change';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';

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
      amountPaid: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.amountPaid < totalAmount) {
      form.setError('amountPaid', { type: 'manual', message: 'Amount paid is less than total.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await getChangeCalculation({
      totalAmount,
      amountPaid: values.amountPaid,
    });

    setIsLoading(false);
    if (response.success) {
      setResult(response.data);
      onPaymentSuccess();
    } else {
      setError(response.error);
    }
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
                       <Input type="number" step="0.01" {...field} className="pl-8" disabled={disabled}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || disabled}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculate Change & Pay
            </Button>
          </form>
        </Form>
        
        {error && <p className="text-destructive text-sm mt-4">{error}</p>}

        {result && (
          <div className="mt-4 space-y-4 p-4 bg-background rounded-lg animate-in fade-in">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Change Due</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(result.changeDue, currency)}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Optimal Change:</h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(result.optimalChange).map(([denom, count]) => (
                  <li key={denom} className="flex justify-between">
                    <span>{denom}:</span>
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
