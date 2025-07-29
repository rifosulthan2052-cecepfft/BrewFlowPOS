
'use client'

import { useState } from 'react';
import type { OpenBill, MenuItem, OrderItem } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from "@/components/layout/AppProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import MenuList from '@/components/cashier/MenuList';
import { PlusCircle } from 'lucide-react';


const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 35000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "espresso coffee" },
  { id: '2', name: 'Latte', price: 45000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "latte coffee" },
  { id: '3', name: 'Cappuccino', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYXBwdWNpbm98ZW58MHx8fHwxNzUzNzQwNDYwfDA&ixlib=rb-4.1.0&q=80&w=1080', "data-ai-hint": "cappuccino coffee" },
  { id: '4', name: 'Americano', price: 38000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "americano coffee" },
  { id: '5', name: 'Mocha', price: 50000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "mocha coffee" },
  { id: '6', name: 'Macchiato', price: 40000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "macchiato coffee" },
  { id: '7', name: 'Drip Coffee', price: 32000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "drip coffee" },
  { id: '8', name: 'Croissant', price: 25000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "croissant pastry" },
  { id: '9', name: 'Muffin', price: 22000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "muffin pastry" },
  { id: '10', name: 'Scone', price: 28000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "scone pastry" },
];


export default function OpenBillsPage() {
    const { openBills, loadOrderFromBill, orderItems, customerName, orderStatus, updateItemQuantity, removeItemFromOrder, setCustomerName, resetOrder, removeOpenBill, addItemToOrder } = useApp();
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
