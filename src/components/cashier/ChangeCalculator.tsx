
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  const [changeDue, setChangeDue] = useState<number | null>(null);
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
    setChangeDue(null);
  }, [totalAmount, form]);
  
  const suggestedDenominations = useMemo(() => {
    if (totalAmount <= 0) return [];

    const denominations = currency === 'IDR' 
      ? [10000, 20000, 50000, 100000, 150000, 200000]
      : [10, 20, 50, 100];
    
    const suggestions = new Set<number>();
    
    if (denominations.includes(totalAmount)) {
      suggestions.add(totalAmount);
    }
    
    const nextDenom = denominations.find(d => d > totalAmount);
    if (nextDenom) {
      suggestions.add(nextDenom);
    }

    if (currency === 'IDR') {
        if (totalAmount < 50000) suggestions.add(50000);
        if (totalAmount < 100000) suggestions.add(100000);
        
        const roundedUp50k = Math.ceil(totalAmount / 50000) * 50000;
        if (roundedUp50k > totalAmount) {
            suggestions.add(roundedUp50k);
        }
    } else {
        const roundedUp10 = Math.ceil(totalAmount / 10) * 10;
        if (roundedUp10 > totalAmount) suggestions.add(roundedUp10);

        const roundedUp20 = Math.ceil(totalAmount / 20) * 20;
        if (roundedUp20 > totalAmount) suggestions.add(roundedUp20);
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
    setChangeDue(null);

    // Simulate a short delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (values.amountPaid === totalAmount) {
      setIsLoading(false);
      onPaymentSuccess();
      return;
    }
    
    const calculatedChange = values.amountPaid - totalAmount;
    setChangeDue(calculatedChange);
    setIsLoading(false);

    setTimeout(() => {
        onPaymentSuccess();
    }, 3000); // Wait 3 seconds before closing the dialog
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
        
        {changeDue !== null && (
          <div className="mt-4 space-y-4 p-4 bg-background rounded-lg animate-in fade-in">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Change Due</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(changeDue, currency)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
