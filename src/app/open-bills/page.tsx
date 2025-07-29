
'use client'

import { useState } from 'react';
import type { OpenBill } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from "@/components/layout/AppProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CurrentOrder from '@/components/cashier/CurrentOrder';


export default function OpenBillsPage() {
    const { openBills, loadOrderFromBill, orderItems, customerName, orderStatus, updateItemQuantity, removeItemFromOrder, setCustomerName, resetOrder, removeOpenBill } = useApp();
    const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<OpenBill | null>(null);

    const handleSettleClick = (bill: OpenBill) => {
        setSelectedBill(bill);
        loadOrderFromBill(bill);
        setIsSettleDialogOpen(true);
    };
    
    const handleCloseDialog = () => {
        setIsSettleDialogOpen(false);
        setSelectedBill(null);
        resetOrder();
    }

    const handleNewOrder = () => {
        if (selectedBill) {
            removeOpenBill(selectedBill.id);
        }
        handleCloseDialog();
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
                 <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
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
                        />
                    </DialogContent>
                </Dialog>
            </AppLayout.Content>
        </AppLayout>
    )
}
