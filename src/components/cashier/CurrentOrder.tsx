
'use client';

import { useState } from 'react';
import type { OrderItem, Fee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, X, PlusCircle, Wallet, User } from 'lucide-react';
import { FeeDialog } from './FeeDialog';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import PaymentPanel from './PaymentPanel';
import { Badge } from '../ui/badge';
import Receipt from './Receipt';

type CurrentOrderProps = {
  items: OrderItem[];
  fees: Fee[];
  customerName: string;
  subtotal: number;
  tax: number;
  total: number;
  totalFees: number;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onAddFee: (fee: Fee) => void;
  onCustomerNameChange: (name: string) => void;
  onPaymentSuccess: () => void;
  onSaveOpenBill: () => void;
  onNewOrder: () => void;
};

export default function CurrentOrder({
  items,
  fees,
  customerName,
  subtotal,
  tax,
  total,
  totalFees,
  orderStatus,
  onUpdateQuantity,
  onRemoveItem,
  onAddFee,
  onCustomerNameChange,
  onPaymentSuccess,
  onSaveOpenBill,
  onNewOrder
}: CurrentOrderProps) {
  const { currency, taxRate } = useApp();
  const isOrderEmpty = items.length === 0;
  const [showPayment, setShowPayment] = useState(false);

  const handleProceedToPayment = () => {
    setShowPayment(true);
  }

  const handleNewOrder = () => {
    setShowPayment(false);
    onNewOrder();
  }

  if (orderStatus === 'paid') {
     return (
       <div className="h-full flex flex-col p-6">
        <header className="pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Order Paid</h2>
            <Badge variant="default" className="capitalize bg-green-600 text-white">
              Paid
            </Badge>
          </div>
        </header>
        <div className="flex-1 flex flex-col">
            <Receipt orderItems={items} subtotal={subtotal} tax={tax} feesAmount={totalFees} total={total} />
        </div>
        <footer className="pt-4 border-t mt-auto">
          <Button size="lg" className="w-full" onClick={handleNewOrder}>
              Start New Order
          </Button>
        </footer>
      </div>
     )
  }

  return (
    <div className="h-full flex flex-col">
      <header className="p-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Current Order</h2>
             {orderStatus !== 'pending' && (
                <Badge variant={orderStatus === 'paid' ? "default" : "secondary"} className="capitalize">
                {orderStatus.replace('_', ' ')}
                </Badge>
            )}
        </div>
      </header>
      <ScrollArea className="flex-1">
        <div className="px-6 pb-6 space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Customer Name" 
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    className="pl-9"
                    disabled={orderStatus !== 'pending'}
                />
            </div>
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
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)} disabled={orderStatus !== 'pending'}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="h-8 w-12 text-center"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.menuItemId, parseInt(e.target.value) || 0)}
                        aria-label={`${item.name} quantity`}
                        disabled={orderStatus !== 'pending'}
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)} disabled={orderStatus !== 'pending'}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="w-24 text-right font-medium">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.menuItemId)} disabled={orderStatus !== 'pending'}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
             {fees.length > 0 && (
              <>
                <Separator className='my-4'/>
                <div className="text-sm space-y-1">
                    <h4 className="font-semibold mb-2">Additional Fees</h4>
                    {fees.map((fee, index) => (
                        <div key={index} className="flex justify-between text-muted-foreground">
                            <span>{fee.name} {fee.notes && <span className="text-xs">({fee.notes})</span>}</span>
                            <span>{formatCurrency(fee.amount, currency)}</span>
                        </div>
                    ))}
                </div>
              </>
            )}
        </div>
      </ScrollArea>
      <footer className="flex-shrink-0 flex-col items-stretch gap-2 border-t p-6 bg-secondary/30 z-10 sticky bottom-0">
          <ScrollArea className='max-h-96'>
            <div className="p-1 space-y-4">
              {/* Order Summary - Always Visible */}
              <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees</span>
                      <span>{formatCurrency(totalFees, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
                      <span>{formatCurrency(tax, currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-2xl text-primary pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(total, currency)}</span>
                  </div>
              </div>
              
              {/* Conditional Rendering for Payment Panel or Buttons */}
              {showPayment ? (
                  <PaymentPanel
                      totalAmount={total}
                      onPaymentSuccess={onPaymentSuccess}
                      disabled={isOrderEmpty || orderStatus !== 'pending'}
                  />
              ) : (
                  <div className='w-full space-y-2'>
                      <FeeDialog onAddFee={onAddFee} disabled={isOrderEmpty || orderStatus !== 'pending'}>
                          <Button variant="outline" className="w-full" disabled={isOrderEmpty || orderStatus !== 'pending'}>
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Fee
                          </Button>
                      </FeeDialog>
                      <Button size="lg" className="w-full" onClick={handleProceedToPayment} disabled={isOrderEmpty || orderStatus !== 'pending'}>
                        <Wallet className="mr-2 h-4 w-4" /> Proceed to Payment
                      </Button>
                      <Button size="lg" variant="secondary" className="w-full" onClick={onSaveOpenBill} disabled={isOrderEmpty || orderStatus !== 'pending'}>
                          Save as Open Bill
                      </Button>
                  </div>
              )}
            </div>
          </ScrollArea>
        </footer>
    </div>
  );
}
