
'use client';

import type { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, User, Wallet, PlusCircle, Trash2, Printer } from 'lucide-react';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import Receipt from './Receipt';
import { Separator } from '../ui/separator';
import { FeeDialog } from './FeeDialog';
import { PaymentDialog } from './PaymentDialog';
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
import { DialogClose, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

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
  onClose,
}: CurrentOrderProps) {
  const { currency, subtotal, tax, totalFees, fees, total, addFeeToOrder, taxRate, addOrderToHistory, saveAsOpenBill, editingBillId } = useApp();
  const isOrderEmpty = items.length === 0;

  const handlePaymentSuccess = (paymentMethod: 'cash' | 'card') => {
    addOrderToHistory(paymentMethod);
  }

  const handleSaveOpenBill = () => {
    saveAsOpenBill();
    onClose();
  }

  if (orderStatus === 'paid') {
     return (
       <>
         <div className="flex-1 min-h-0">
           <ScrollArea className="h-full">
            <div className='p-6'>
              <Receipt orderItems={items} subtotal={subtotal} tax={tax} fees={fees} total={total} showPrintButton={false} />
            </div>
           </ScrollArea>
         </div>
         <footer className="p-6 pt-4 border-t flex-shrink-0 flex items-center gap-2">
            <Button size="lg" variant="outline" className="w-full" onClick={() => {
                const printWindow = window.open('', '', 'height=600,width=800');
                // A very basic styling for printing
                printWindow?.document.write(`
                    <style>
                        body { font-family: monospace; font-size: 14px; }
                        .receipt-container { width: 300px; margin: auto; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
                    </style>
                `);
                const receiptNode = document.getElementById('receipt-to-print');
                if (receiptNode) {
                    printWindow?.document.write(receiptNode.innerHTML);
                }
                printWindow?.document.close();
                printWindow?.focus();
                printWindow?.print();
                printWindow?.close();
            }}>
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
           <Button size="lg" className="w-full" onClick={onNewOrder}>
               Start New Order
           </Button>
         </footer>
       </>
     )
  }

  return (
    <>
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <div className="p-6 pt-2">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Customer Name" 
                            value={customerName}
                            onChange={(e) => onCustomerNameChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="py-4">
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
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>

        <div className="bg-background p-6 pt-4 border-t flex-shrink-0">
            <div className="space-y-2 text-sm">
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
            <div className='w-full space-y-2 mt-4'>
                <PaymentDialog 
                    totalAmount={total}
                    onPaymentSuccess={handlePaymentSuccess}
                    disabled={isOrderEmpty}
                >
                    <Button size="lg" className="w-full" disabled={isOrderEmpty}>
                    <Wallet className="mr-2 h-4 w-4" /> Proceed to Payment
                    </Button>
                </PaymentDialog>
                {editingBillId ? (
                    <div className='grid grid-cols-2 gap-2'>
                        <Button variant="secondary" className="w-full" onClick={handleSaveOpenBill}>Done</Button>
                        <DialogClose asChild>
                        <Button variant="outline" className="w-full">Cancel</Button>
                        </DialogClose>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                )}
            </div>
        </div>
    </>
  );
}
