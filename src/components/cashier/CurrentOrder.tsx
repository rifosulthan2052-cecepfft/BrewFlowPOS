

'use client';

import type { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, X, User, Wallet, PlusCircle, CreditCard, Trash2 } from 'lucide-react';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import Receipt from './Receipt';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { FeeDialog } from './FeeDialog';
import { PaymentDialog } from './PaymentDialog';
import { useRouter } from 'next/navigation';
import { set } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type CurrentOrderProps = {
  items: OrderItem[];
  customerName: string;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onCustomerNameChange: (name: string) => void;
  onNewOrder: () => void;
  onClearOrder: () => void;
  onClose: () => void;
};

export default function CurrentOrder({
  items,
  customerName,
  orderStatus,
  onUpdateQuantity,
  onRemoveItem,
  onCustomerNameChange,
  onNewOrder,
  onClearOrder,
  onClose
}: CurrentOrderProps) {
  const { currency, subtotal, tax, totalFees, fees, total, addFeeToOrder, taxRate, setOrderStatus, resetOrder } = useApp();
  const isOrderEmpty = items.length === 0;
  const router = useRouter();


  const handlePaymentSuccess = () => {
    setOrderStatus('paid');
  }

  const handleSaveOpenBill = () => {
    setOrderStatus('open_bill');
    // In a real app, this would save the order to a database
    setTimeout(() => {
        resetOrder();
        onClose();
    }, 1000)
  }

  if (orderStatus === 'paid') {
     return (
       <div className="h-full flex flex-col bg-background p-6">
         <div className='flex justify-between items-center mb-4'>
           <h2 className="text-2xl font-semibold leading-none tracking-tight">Order Paid</h2>
           <Badge variant="default" className="capitalize bg-green-600 text-white">
             Paid
           </Badge>
         </div>
         <div className="flex-1 flex flex-col">
           <Receipt orderItems={items} subtotal={subtotal} tax={tax} fees={fees} total={total} />
         </div>
         <footer className="pt-4 border-t mt-auto">
           <Button size="lg" className="w-full" onClick={onNewOrder}>
               Start New Order
           </Button>
         </footer>
       </div>
     )
  }

  return (
    <div className="h-full flex flex-col max-h-[80vh]">
       <div className="p-6 pb-2">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Current Order</h2>
             {orderStatus !== 'pending' && (
                <Badge variant={orderStatus === 'paid' ? "default" : "secondary"} className="capitalize">
                {orderStatus.replace('_', ' ')}
                </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="p-6 pt-2">
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
        </div>
        <div className="pb-6 space-y-4 px-6">
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
        </div>
        <div className="space-y-2 text-sm pt-4 border-t px-6 pb-6">
          <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className='font-mono'>{formatCurrency(subtotal, currency)}</span>
          </div>
            {fees.length > 0 && (
              <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees</span>
                  <span className='font-mono'>{formatCurrency(totalFees, currency)}</span>
              </div>
            )}
          <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
              <span className='font-mono'>{formatCurrency(tax, currency)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg text-primary">
              <span>Total</span>
              <span className='font-mono'>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </ScrollArea>
      <footer className="mt-auto flex-shrink-0 border-t bg-card p-6">
        <div className='w-full space-y-2'>
             <PaymentDialog 
                totalAmount={total}
                onPaymentSuccess={handlePaymentSuccess}
                disabled={isOrderEmpty}
              >
                  <Button size="lg" className="w-full">
                  <Wallet className="mr-2 h-4 w-4" /> Proceed to Payment
                  </Button>
              </PaymentDialog>
            <div className="grid grid-cols-3 gap-2">
                <FeeDialog onAddFee={addFeeToOrder} disabled={isOrderEmpty}>
                    <Button variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Fee
                    </Button>
                </FeeDialog>
                <Button variant="secondary" className="w-full" disabled={isOrderEmpty} onClick={handleSaveOpenBill}>
                    Save as Open Bill
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isOrderEmpty}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all items from the current order. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onClearOrder}>
                        Clear Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </footer>
    </div>
  );
}
