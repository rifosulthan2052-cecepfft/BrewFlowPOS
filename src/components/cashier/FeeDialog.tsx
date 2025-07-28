'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Fee } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApp } from '../layout/AppProvider';

const feeSchema = z.object({
  name: z.string().min(1, 'Fee name is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  notes: z.string().optional(),
});

type FeeDialogProps = {
  children: React.ReactNode;
  onAddFee: (fee: Fee) => void;
};

export function FeeDialog({ children, onAddFee }: FeeDialogProps) {
  const { currency } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof feeSchema>>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      name: 'Tip',
      amount: 0,
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof feeSchema>) => {
    onAddFee({ ...values, notes: values.notes || '' });
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Fee</DialogTitle>
          <DialogDescription>Add an additional fee like a tip or service charge to the order.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tip, Service Charge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                   <FormControl>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'IDR' ? 'Rp' : '$'}</span>
                       <Input type="number" step="0.01" {...field} className="pl-8"/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                   <FormControl>
                    <Textarea placeholder="Reason for the fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Fee</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
