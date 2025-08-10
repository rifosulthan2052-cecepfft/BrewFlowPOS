
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OpenBill, BillProps } from '@/types';
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
import { MoreVertical, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


function BillCardSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Separator className="my-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Separator className="my-2" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
            <CardFooter className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
            </CardFooter>
        </Card>
    );
}

export default function OpenBillsPage() {
    const { 
        openBills, loadOrderFromBill, orderItems, customerName, orderStatus, 
        updateItemQuantity, removeItemFromOrder, setCustomerName, resetOrder, 
        removeOpenBill, setEditingBillId, activeOrderExists, unsavedOrder, isLoading
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
             const unsavedBill: BillProps = {
                customerName: unsavedOrder.customerName,
                items: unsavedOrder.items,
                fees: unsavedOrder.fees,
                subtotal: 0, tax: 0, total: 0, totalFees: 0, date: '',
                member_id: unsavedOrder.memberId
             }
             loadOrderFromBill(unsavedBill);
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
        const unsavedBill: BillProps = {
            customerName: unsavedOrder.customerName,
            items: unsavedOrder.items,
            fees: unsavedOrder.fees,
            subtotal: 0, tax: 0, total: 0, totalFees: 0, date: '',
            member_id: unsavedOrder.memberId
        };
        loadOrderFromBill(unsavedBill);
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
                            {isLoading ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 3 }).map((_, index) => <BillCardSkeleton key={index} />)}
                                </div>
                            ) : openBills.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <BookOpen className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-semibold">No Open Bills</h3>
                                    <p className="mt-2 text-sm">Saved bills will appear here.</p>
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
