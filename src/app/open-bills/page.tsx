
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OpenBill } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from "@/components/layout/AppProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { PlusCircle } from 'lucide-react';


export default function OpenBillsPage() {
    const { openBills, loadOrderFromBill, orderItems, customerName, orderStatus, updateItemQuantity, removeItemFromOrder, setCustomerName, resetOrder, removeOpenBill, setEditingBillId, activeOrderExists } = useApp();
    const router = useRouter();
    const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<OpenBill | null>(null);

    const handleSettleClick = (bill: OpenBill) => {
        setSelectedBill(bill);
        setIsSettleDialogOpen(true);
        // We don't load the order here anymore, we do it when the user decides to proceed.
    };
    
    const handleSettleDialogOpen = (open: boolean) => {
        if(open && selectedBill) {
            loadOrderFromBill(selectedBill);
            setEditingBillId(selectedBill.id);
        } else {
            handleCloseDialog();
        }
        setIsSettleDialogOpen(open);
    }
    
    const handleCloseDialog = () => {
        setIsSettleDialogOpen(false);
        setSelectedBill(null);
        setEditingBillId(null);
        resetOrder();
    }

    const handleNewOrder = () => {
        if (selectedBill) {
            removeOpenBill(selectedBill.id);
        }
        handleCloseDialog();
    }
    
    const handleAddToBill = () => {
        if (activeOrderExists) {
            setIsWarningDialogOpen(true);
        } else {
            proceedToAddToBill();
        }
    };

    const proceedToAddToBill = () => {
        if (selectedBill) {
            // The bill is already loaded in the AppProvider state
            // so we just need to navigate.
            router.push('/');
        }
    };


    const handleConfirmWarning = () => {
        // Discarding the current unsaved order happens by simply proceeding,
        // as the AppProvider state is already reflecting the selected bill's data.
        proceedToAddToBill();
        setIsWarningDialogOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleCloseDialog();
        }
        setIsSettleDialogOpen(open);
    }

    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Open Bills</CardTitle>
                            <CardDescription>View and manage open bills.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {openBills.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>No open bills.</p>
                                    <p className="text-sm">Saved bills will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {openBills.map(bill => (
                                        <Card key={bill.id} className="flex flex-col">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                      <CardTitle className="text-xl">{bill.customerName}</CardTitle>
                                                      <CardDescription>
                                                        {new Date(bill.date).toLocaleString()}
                                                      </CardDescription>
                                                    </div>
                                                    <Badge variant="secondary">Open</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="text-sm space-y-1">
                                                    {bill.items.map(item => (
                                                        <li key={item.menuItemId} className="flex justify-between">
                                                            <span>{item.quantity}x {item.name}</span>
                                                            <span className="font-mono">{formatCurrency(item.price * item.quantity, useApp().currency)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Separator className="my-2" />
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Subtotal</span>
                                                        <span className="font-mono">{formatCurrency(bill.subtotal, useApp().currency)}</span>
                                                    </div>
                                                     {bill.fees.length > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Fees</span>
                                                            <span className="font-mono">{formatCurrency(bill.totalFees, useApp().currency)}</span>
                                                        </div>
                                                     )}
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Tax</span>
                                                        <span className="font-mono">{formatCurrency(bill.tax, useApp().currency)}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between font-bold">
                                                        <span className="text-lg">Total</span>
                                                        <span className="font-mono text-lg">{formatCurrency(bill.total, useApp().currency)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full" onClick={() => handleSettleClick(bill)}>Settle Bill</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <Dialog open={isSettleDialogOpen} onOpenChange={handleSettleDialogOpen}>
                    <DialogContent className="max-w-2xl p-0 gap-0 h-[90vh] flex flex-col">
                        <DialogHeader className='p-6 pb-2 flex-shrink-0'>
                            <DialogTitle className='text-2xl font-semibold leading-none tracking-tight'>Settle Bill</DialogTitle>
                        </DialogHeader>
                        <CurrentOrder
                            items={orderItems}
                            customerName={customerName}
                            orderStatus={orderStatus}
                            onUpdateQuantity={updateItemQuantity}
                            onRemoveItem={removeItemFromOrder}
                            onCustomerNameChange={setCustomerName}
                            onNewOrder={handleNewOrder}
                            onClearOrder={handleCloseDialog}
                            onClose={handleCloseDialog}
                            onAddToBill={handleAddToBill}
                        />
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved Order Warning</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have an unsaved order in progress. Adding items to this bill will discard your current order. Do you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmWarning}>Discard and Proceed</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout.Content>
        </AppLayout>
    )
}
