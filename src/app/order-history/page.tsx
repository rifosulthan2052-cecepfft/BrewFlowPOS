
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Receipt from '@/components/cashier/Receipt';
import { CreditCard, Wallet, List, Grid, Printer, History } from 'lucide-react';

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
                        <span className="text-muted-foreground">Tax ({useApp().taxRate * 100}%)</span>
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
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                     <Badge variant={order.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize flex-none flex gap-2">
                        {order.paymentMethod === 'card' ? <CreditCard/> : <Wallet/>}
                        {order.paymentMethod}
                    </Badge>
                    <p className="flex-1 text-right font-mono font-bold text-primary">{formatCurrency(order.total, currency)}</p>
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
                                <div className="text-center py-16 text-muted-foreground">
                                    <History className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-semibold">No Completed Orders</h3>
                                    <p className="mt-2 text-sm">Paid orders will appear here after a transaction is completed.</p>
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
                                customerName={selectedOrder.customerName}
                                subtotal={selectedOrder.subtotal}
                                tax={selectedOrder.tax}
                                fees={selectedOrder.fees}
                                total={selectedOrder.total}
                                memberId={selectedOrder.memberId}
                             />
                        )}
                    </DialogContent>
                </Dialog>

            </AppLayout.Content>
        </AppLayout>
    )
}
