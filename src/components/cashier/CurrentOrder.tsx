
'use client';

import React from 'react';
import type { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, User, Wallet, PlusCircle, Trash2, FileText, CreditCard, ChevronUp, Save, ScanLine, QrCode, X, UserX } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

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
  const { 
    currency, subtotal, tax, totalFees, fees, total, 
    addFeeToOrder, taxRate, addOrderToHistory, saveAsOpenBill, 
    editingBillId, lastCompletedOrder,
    memberId, setMemberId, getMemberById,
    getMemberByLookup,
  } = useApp();
  const { toast } = useToast();
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [lookupValue, setLookupValue] = React.useState('');
  const isOrderEmpty = items.length === 0;

  const handlePaymentSuccess = (paymentMethod: 'cash' | 'card') => {
    addOrderToHistory(paymentMethod);
  }

  const handleSaveOpenBill = () => {
    saveAsOpenBill();
    onClose();
  }

  const handleLookupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLookupValue(value);
  }
  
  const handleLookupBlur = () => {
    if (lookupValue && !memberId) { // Only lookup if no member is set yet
        const member = getMemberByLookup(lookupValue);
        if (member) {
            setMemberId(member.id);
            if (member.name) {
                onCustomerNameChange(member.name);
            }
            toast({
                title: 'Member Found',
                description: `${member.name} (${member.id}) has been associated with this order.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Member not found',
                description: 'No member found with the provided ID, Email, or Phone.',
            });
            setMemberId(undefined); // Clear if not found
        }
    }
  }

  React.useEffect(() => {
    if (memberId) {
        const member = getMemberById(memberId);
        if (member) {
            setLookupValue(member.name || `Member ${member.id}`);
        }
    } else {
        setLookupValue('');
    }
  }, [memberId, getMemberById]);
  
  const handleScanClick = async () => {
    toast({ title: 'QR Scanner Not Implemented', description: 'This would open the camera to scan a QR code.' });
  }

  const handleClearMember = () => {
    setMemberId(undefined);
    onCustomerNameChange('');
    setLookupValue('');
    toast({
        title: 'Member cleared',
        description: 'The member has been removed from the order.',
    });
  }

  if (orderStatus === 'paid' && lastCompletedOrder) {
     return (
       <div className="flex flex-col h-full">
         <DialogHeader className='p-6 pb-4 flex-shrink-0'>
            <DialogTitle>Payment Successful</DialogTitle>
         </DialogHeader>
         <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center p-6 gap-4">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(lastCompletedOrder.total, currency)}</p>
                <Badge variant={lastCompletedOrder.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize flex gap-2 mt-2">
                    {lastCompletedOrder.paymentMethod === 'card' ? <CreditCard/> : <Wallet/>}
                    Paid by {lastCompletedOrder.paymentMethod}
                </Badge>
            </div>
             <Button variant="outline" size="lg" onClick={() => setIsReceiptOpen(true)} className="animate-in fade-in zoom-in-95">
                 <FileText className="mr-2" />
                 View Receipt
             </Button>
         </div>
         <DialogClose asChild>
          <Button size="lg" className="w-full sm:w-auto" onClick={onNewOrder}>
             Start New Order
          </Button>
         </DialogClose>
         <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Receipt</DialogTitle>
                </DialogHeader>
                {lastCompletedOrder && (
                  <Receipt 
                      orderItems={lastCompletedOrder.items}
                      subtotal={lastCompletedOrder.subtotal}
                      tax={lastCompletedOrder.tax}
                      fees={lastCompletedOrder.fees}
                      total={lastCompletedOrder.total}
                      memberId={lastCompletedOrder.memberId}
                  />
                )}
            </DialogContent>
         </Dialog>
       </div>
     )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
         <DialogHeader className='p-6 pb-2 flex-shrink-0 flex-row justify-between items-center'>
            <DialogTitle className='text-2xl font-semibold leading-none tracking-tight'>
                { editingBillId ? 'Editing Bill' : 'Current Order' }
            </DialogTitle>
            <div className="flex items-center gap-1">
                {!editingBillId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isOrderEmpty} onClick={handleSaveOpenBill}>
                                <Save className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Save to open bills</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                 <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                    </Button>
                </DialogClose>
            </div>
        </DialogHeader>
        <div className="p-6 pt-2 space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => onCustomerNameChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={isOrderEmpty}>
                            <Trash2 className="h-4 w-4" />
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
             <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Member ID, Email, or Phone"
                        value={lookupValue}
                        onChange={handleLookupChange}
                        onBlur={handleLookupBlur}
                        className="pl-9"
                        disabled={!!memberId}
                    />
                </div>
                {memberId ? (
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleClearMember}>
                                <UserX className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clear Member</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleScanClick}>
                                <ScanLine className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Scan Member QR Code</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
      
        <div className="flex-1 px-6 pt-0 min-h-0">
            <div className="h-full border-t border-b">
                <ScrollArea className="h-full">
                    {items.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <p>No items in order.</p>
                        <p className="text-sm">Click on menu items to add them.</p>
                    </div>
                    ) : (
                    <ul className="space-y-4 pr-4 py-4">
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
                </ScrollArea>
            </div>
        </div>
      
      <div className="bg-background p-6 pt-4 flex-shrink-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                 <div className="flex justify-between font-bold text-lg text-primary">
                    <AccordionTrigger className="flex-1 py-0">
                        <div className="flex justify-between w-full items-center">
                             <span>Total</span>
                             <div className="flex items-center gap-2">
                                <span className='font-mono'>{formatCurrency(total, currency)}</span>
                                <ChevronUp className="h-4 w-4 shrink-0 transition-transform duration-200" />
                             </div>
                        </div>
                    </AccordionTrigger>
                 </div>
                 <AccordionContent>
                    <div className="space-y-2 text-sm pt-2">
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
                    </div>
                 </AccordionContent>
              </AccordionItem>
            </Accordion>

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
                        <Button variant="outline" className="w-full" onClick={onClose}>Cancel</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        <FeeDialog onAddFee={addFeeToOrder} disabled={isOrderEmpty}>
                            <Button variant="outline" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Fee
                            </Button>
                        </FeeDialog>
                    </div>
                )}
            </div>
        </div>
    </div>
    </TooltipProvider>
  );
}
