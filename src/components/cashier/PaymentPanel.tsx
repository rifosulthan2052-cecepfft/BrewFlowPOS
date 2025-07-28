'use client';

import type { OrderItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChangeCalculator } from './ChangeCalculator';
import Receipt from './Receipt';
import { Badge } from '../ui/badge';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';

type PaymentPanelProps = {
  subtotal: number;
  feesAmount: number;
  tax: number;
  total: number;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  onPaymentSuccess: () => void;
  onSaveOpenBill: () => void;
  onNewOrder: () => void;
  orderItems: OrderItem[];
};

export default function PaymentPanel({
  subtotal,
  feesAmount,
  tax,
  total,
  orderStatus,
  onPaymentSuccess,
  onSaveOpenBill,
  onNewOrder,
  orderItems,
}: PaymentPanelProps) {

  const { currency } = useApp();
  const isOrderEmpty = orderItems.length === 0;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Total</CardTitle>
          {orderStatus !== 'pending' && (
            <Badge variant={orderStatus === 'paid' ? "default" : "secondary"} className="capitalize bg-green-600 text-white">
              {orderStatus.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>

      {orderStatus === 'paid' ? (
         <CardContent className="flex-1 flex flex-col">
            <Receipt orderItems={orderItems} subtotal={subtotal} tax={tax} feesAmount={feesAmount} total={total} />
         </CardContent>
      ) : (
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span>{formatCurrency(feesAmount, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (11%)</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-2xl text-primary pt-2">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
          <ChangeCalculator totalAmount={total} onPaymentSuccess={onPaymentSuccess} disabled={isOrderEmpty || orderStatus !== 'pending'} />
        </CardContent>
      )}

      <CardFooter className="flex flex-col gap-2 p-4 border-t">
        {orderStatus === 'paid' || orderStatus === 'open_bill' ? (
            <Button size="lg" className="w-full" onClick={onNewOrder}>
            Start New Order
            </Button>
        ) : (
            <div className='w-full space-y-2'>
                <Button size="lg" variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground" onClick={onPaymentSuccess} disabled={isOrderEmpty}>
                    Pay with Card
                </Button>
                <Button size="lg" variant="secondary" className="w-full" onClick={onSaveOpenBill} disabled={isOrderEmpty}>
                    Save as Open Bill
                </Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
