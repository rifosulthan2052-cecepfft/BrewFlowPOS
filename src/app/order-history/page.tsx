
'use client'

import { useState } from 'react';
import type { CompletedOrder } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Receipt from '@/components/cashier/Receipt';
import { CreditCard, Wallet, List, Grid } from 'lucide-react';

function OrderHistoryCard({ order, onSelect }: { order: CompletedOrder, onSelect: (order: CompletedOrder) => void }) {
    const { currency } = useApp();
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{order.customerName}</CardTitle>
                        <CardDescription>
                            {new Date(order.date).toLocaleString()}
                        </CardDescription>
                    </div>
                     <Badge variant={order.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize flex gap-2">
                        {order.paymentMethod === 'card' ? <CreditCard/> : <Wallet/>}
                        {order.paymentMethod}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                 <ul className="text-sm space-y-1">
                    {order.items.map(item => (
                        <li key={item.menuItemId} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-mono">{formatCurrency(item.price * item.quantity, currency)}</span>
                        </li>
                    ))}
                </ul>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-mono">{formatCurrency(order.subtotal, currency)}</span>
                    </div>
                        {order.fees.length > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fees</span>
                            <span className="font-mono">{formatCurrency(order.totalFees, currency)}</span>
                        </div>
                        )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-mono">{formatCurrency(order.tax, currency)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                        <span className="text-lg">Total</span>
                        <span className="font-mono text-lg">{formatCurrency(order.total, currency)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onSelect(order)}>View Receipt</Button>
            </CardFooter>
        </Card>
    )
}

function OrderHistoryCompactCard({ order, onSelect }: { order: CompletedOrder, onSelect: (order: CompletedOrder) => void }) {
    const { currency } = useApp();
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant={order.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize flex gap-2 w-24 justify-center">
                        {order.paymentMethod === 'card' ? <CreditCard/> : <Wallet/>}
                        {order.paymentMethod}
                    </Badge>
                    <p className="w-32 text-right font-mono font-bold text-primary">{formatCurrency(order.total, currency)}</p>
                    <Button variant="outline" size="sm" onClick={() => onSelect(order)}>View Receipt</Button>
                </div>
            </CardContent>
        </Card>
    )
}


export default function OrderHistoryPage() {
    const { completedOrders } = useApp();
    const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

    const handleSelectOrder = (order: CompletedOrder) => {
        setSelectedOrder(order);
    };

    const handleCloseDialog = () => {
        setSelectedOrder(null);
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
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>Review past transactions.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}>
                                        <Grid className="h-4 w-4" />
                                     </Button>
                                     <Button variant={viewMode === 'compact' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('compact')}>
                                        <List className="h-4 w-4" />
                                     </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {completedOrders.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>No completed orders yet.</p>
                                    <p className="text-sm">Paid orders will appear here.</p>
                                </div>
                            ) : (
                                 <div className={`grid gap-4 ${viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {completedOrders.map(order => 
                                        viewMode === 'card' ? (
                                            <OrderHistoryCard key={order.id} order={order} onSelect={handleSelectOrder}/>
                                        ) : (
                                            <OrderHistoryCompactCard key={order.id} order={order} onSelect={handleSelectOrder}/>
                                        )
                                    )}
                                 </div>
                           )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && handleCloseDialog()}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Receipt</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                             <Receipt 
                                orderItems={selectedOrder.items}
                                subtotal={selectedOrder.subtotal}
                                tax={selectedOrder.tax}
                                fees={selectedOrder.fees}
                                total={selectedOrder.total}
                             />
                        )}
                    </DialogContent>
                </Dialog>

            </AppLayout.Content>
        </AppLayout>
    )
}
