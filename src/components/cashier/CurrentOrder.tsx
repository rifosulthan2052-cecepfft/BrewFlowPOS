'use client';

import type { OrderItem, Fee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, X, PlusCircle } from 'lucide-react';
import { FeeDialog } from './FeeDialog';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';

type CurrentOrderProps = {
  items: OrderItem[];
  fees: Fee[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onAddFee: (fee: Fee) => void;
};

export default function CurrentOrder({ items, fees, onUpdateQuantity, onRemoveItem, onAddFee }: CurrentOrderProps) {
  const { currency } = useApp();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Card className="h-full flex flex-col shadow-none border-0 rounded-none">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Current Order</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="px-6 pb-6">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p>No items in order.</p>
                <p className="text-sm">Click on menu items to add them.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.menuItemId} className="flex items-center gap-4 animate-in fade-in">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price, currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="h-8 w-12 text-center"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.menuItemId, parseInt(e.target.value) || 0)}
                        aria-label={`${item.name} quantity`}
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="w-24 text-right font-medium">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.menuItemId)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-shrink-0 flex-col items-stretch gap-2 border-t p-4 bg-background z-10">
        <div className="flex justify-between font-semibold text-lg">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <Separator />
        <FeeDialog onAddFee={onAddFee}>
            <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Fee
            </Button>
        </FeeDialog>
        {fees.length > 0 && (
            <div className="text-sm space-y-1 mt-2">
                {fees.map((fee, index) => (
                    <div key={index} className="flex justify-between text-muted-foreground">
                        <span>{fee.name} <span className="text-xs">({fee.notes})</span></span>
                        <span>{formatCurrency(fee.amount, currency)}</span>
                    </div>
                ))}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
