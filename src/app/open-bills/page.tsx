
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function OpenBillsPage() {
    const { 
        openBills, loadOrderFromBill, orderItems, customerName, orderStatus, 
        updateItemQuantity, removeItemFromOrder, setCustomerName, resetOrder, 
        removeOpenBill, setEditingBillId, activeOrderExists, unsavedOrder 
    } = useApp();
    const router = useRouter();
    const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<OpenBill | null>(null);
    const [actionToConfirm, setActionToConfirm] = useState<'addToBill' | 'settleBill' | null>(null);

    const handleSettleClick = (bill: OpenBill) => {
        setSelectedBill(bill);
        loadOrderFromBill(bill);
        setEditingBillId(bill.id);
        if (activeOrderExists) {
            setActionToConfirm('settleBill');
            setIsWarningDialogOpen(true);
        } else {
            proceedToSettleBill();
        }
    };

    const handleAddToBillClick = (bill: OpenBill) => {
        setSelectedBill(bill);
        loadOrderFromBill(bill);
        setEditingBillId(bill.id); // Set editing bill context
        if (activeOrderExists) {
            setActionToConfirm('addToBill');
            setIsWarningDialogOpen(true);
        } else {
            proceedToAddToBill();
        }
    };
    
    const proceedToAddToBill = () => {
        // We just need to route, the state is already loaded
        router.push('/');
    };

    const proceedToSettleBill = () => {
        setIsSettleDialogOpen(true);
    };

    const handleSettleDialogOpen = (open: boolean) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsSettleDialogOpen(true);
        }
    }

    const handleCloseDialog = () => {
         if (orderStatus === 'paid') {
            handleNewOrder();
            return;
        }
        setIsSettleDialogOpen(false);
        setSelectedBill(null);
        if (activeOrderExists) {
             loadOrderFromBill({
                id: '',
                customerName: unsavedOrder.customerName,
                items: unsavedOrder.items,
                fees: unsavedOrder.fees,
                subtotal: 0, tax: 0, total: 0, totalFees: 0, date: '',
                memberId: unsavedOrder.memberId
             });
        } else {
            resetOrder();
        }
    }

    const handleNewOrder = () => {
        if (selectedBill) {
            removeOpenBill(selectedBill.id);
        }
        setIsSettleDialogOpen(false);
        setSelectedBill(null);
        resetOrder();
    }
    

    const handleConfirmWarning = () => {
        if (actionToConfirm === 'addToBill') {
            proceedToAddToBill();
        } else if (actionToConfirm === 'settleBill') {
            proceedToSettleBill();
        }
        setIsWarningDialogOpen(false);
        setActionToConfirm(null);
    };
    
    const handleCancelWarning = () => {
        // If the user cancels, we should revert the state to what it was before they clicked.
        // This means loading the unsaved order back into the main state.
        loadOrderFromBill({
            id: '',
            customerName: unsavedOrder.customerName,
            items: unsavedOrder.items,
            fees: unsavedOrder.fees,
            subtotal: 0, tax: 0, total: 0, totalFees: 0, date: '',
            memberId: unsavedOrder.memberId
        });
        setEditingBillId(null);
        setIsWarningDialogOpen(false);
        setActionToConfirm(null);
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
                                            <CardFooter className="flex items-center gap-2">
                                                <Button className="flex-1" onClick={() => handleAddToBillClick(bill)}>Add to Bill</Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleSettleClick(bill)}>
                                                            Settle Bill
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <Dialog open={isSettleDialogOpen} onOpenChange={handleSettleDialogOpen}>
                    <DialogContent className={cn("max-w-2xl p-0 gap-0 flex flex-col", orderStatus !== 'paid' && "h-[90vh]")}>
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
                            <AlertDialogCancel onClick={handleCancelWarning}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmWarning}>Discard and Proceed</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout.Content>
        </AppLayout>
    )
}
