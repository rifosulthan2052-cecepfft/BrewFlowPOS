
'use client';

import { useApp } from '@/components/layout/AppProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { FeeDialog } from '@/components/cashier/FeeDialog';
import { PlusCircle, Wallet, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaymentDialog } from '@/components/cashier/PaymentDialog';

export default function CheckoutPage() {
  const {
    orderItems,
    fees,
    addFeeToOrder,
    subtotal,
    tax,
    total,
    totalFees,
    currency,
    taxRate,
    setOrderStatus,
    resetOrder
  } = useApp();
  const router = useRouter();

  const handlePaymentSuccess = () => {
    setOrderStatus('paid');
  }

  const handleSaveOpenBill = () => {
    setOrderStatus('open_bill');
    // In a real app, this would save the order to a database
    setTimeout(() => {
        resetOrder();
        router.push('/');
    }, 1000)
  }

  if (orderItems.length === 0) {
    return (
      <AppLayout>
        <AppLayout.Header>
          <Header />
        </AppLayout.Header>
        <AppLayout.Content>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="p-8">
                    <CardTitle>Empty Order</CardTitle>
                    <CardDescription className="mt-2">There are no items in the current order.</CardDescription>
                    <Button asChild className="mt-4">
                        <Link href="/">Back to Cashier</Link>
                    </Button>
                </Card>
            </div>
        </AppLayout.Content>
      </AppLayout>
    )
  }


  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/"><ArrowLeft/></Link>
                    </Button>
                    <div>
                        <CardTitle>Checkout</CardTitle>
                        <CardDescription>Review your order and proceed to payment.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Order Summary</h3>
                     <ul className="space-y-2 text-sm">
                        {orderItems.map((item) => (
                        <li key={item.menuItemId} className="flex justify-between items-center">
                            <div>
                                <span className="font-semibold">{item.name}</span>
                                <span className="text-muted-foreground"> x {item.quantity}</span>
                            </div>
                            <span className="font-mono">{formatCurrency(item.price * item.quantity, currency)}</span>
                        </li>
                        ))}
                    </ul>
                </div>
              <Separator className="my-4"/>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Additional Fees</h4>
                {fees.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {fees.map((fee, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{fee.name} {fee.notes && <span className="text-xs">({fee.notes})</span>}</span>
                                <span className='font-mono'>{formatCurrency(fee.amount, currency)}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-muted-foreground">No additional fees.</p> }
              </div>
              <Separator className="my-6" />
               <div className="space-y-2 text-lg">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className='font-mono'>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Fees</span>
                        <span className='font-mono'>{formatCurrency(totalFees, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
                        <span className='font-mono'>{formatCurrency(tax, currency)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-2xl text-primary pt-2">
                        <span>Total</span>
                        <span className='font-mono'>{formatCurrency(total, currency)}</span>
                    </div>
                </div>
                <Separator className="my-6"/>

                <div className='w-full space-y-2'>
                    <FeeDialog onAddFee={addFeeToOrder}>
                        <Button variant="outline" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Fee
                        </Button>
                    </FeeDialog>
                    <PaymentDialog 
                    totalAmount={total}
                    onPaymentSuccess={handlePaymentSuccess}
                    >
                        <Button size="lg" className="w-full">
                        <Wallet className="mr-2 h-4 w-4" /> Proceed to Payment
                        </Button>
                    </PaymentDialog>

                    <Button size="lg" variant="secondary" className="w-full" onClick={handleSaveOpenBill}>
                        Save as Open Bill
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout.Content>
    </AppLayout>
  );
}
