
'use client'

import { useState, useMemo } from 'react';
import type { CompletedOrder } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from "@/components/layout/AppProvider";
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Receipt from '@/components/cashier/Receipt';
import { CreditCard, Wallet, List, Grid, Printer, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, startOfYesterday, subDays } from 'date-fns';

function OrderHistoryCard({ order, onSelect }: { order: CompletedOrder, onSelect: (order: CompletedOrder) => void }) {
    const { currency, taxRate } = useApp();
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{order.customer_name}</CardTitle>
                        <CardDescription>
                            {new Date(order.date).toLocaleString()}
                        </CardDescription>
                    </div>
                     <Badge variant={order.payment_method === 'card' ? 'default' : 'secondary'} className="capitalize flex gap-2">
                        {order.payment_method === 'card' ? <CreditCard/> : <Wallet/>}
                        {order.payment_method}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                 <ul className="text-sm space-y-1">
                    {(order.items as any[]).map(item => (
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
                            <span className="font-mono">{formatCurrency(order.total_fees, currency)}</span>
                        </div>
                        )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
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
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                     <Badge variant={order.payment_method === 'card' ? 'default' : 'secondary'} className="capitalize flex-none flex gap-2">
                        {order.payment_method === 'card' ? <CreditCard/> : <Wallet/>}
                        {order.payment_method}
                    </Badge>
                    <p className="flex-1 text-right font-mono font-bold text-primary">{formatCurrency(order.total, currency)}</p>
                    <Button variant="outline" size="sm" onClick={() => onSelect(order)}>View Receipt</Button>
                </div>
            </CardContent>
        </Card>
    )
}

function HistoryCardSkeleton() {
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
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}

function HistoryCompactSkeleton() {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-4 w-1/2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </CardContent>
        </Card>
    )
}

type Period = 'today' | 'yesterday' | 'week' | 'month' | '90days';

export default function OrderHistoryPage() {
    const { allCompletedOrders, isLoading } = useApp();
    const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
    const [period, setPeriod] = useState<Period>('today');

    const filteredOrders = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'today':
                startDate = startOfToday();
                break;
            case 'yesterday':
                startDate = startOfYesterday();
                break;
            case 'week':
                startDate = subDays(startOfToday(), 7);
                break;
            case 'month':
                startDate = subDays(startOfToday(), 30);
                break;
            case '90days':
                startDate = subDays(startOfToday(), 90);
                break;
            default:
                startDate = new Date(0); // Should not happen
        }

        if (period === 'yesterday') {
            const yesterdayStart = startOfYesterday();
            const yesterdayEnd = startOfToday();
            return allCompletedOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= yesterdayStart && orderDate < yesterdayEnd;
            });
        }
        
        return allCompletedOrders.filter(order => new Date(order.date) >= startDate);
    }, [allCompletedOrders, period]);

    const handleSelectOrder = (order: CompletedOrder) => {
        setSelectedOrder(order);
    };

    const handleCloseDialog = () => {
        setSelectedOrder(null);
    }
    
    const periodLabels: { [key in Period]: string } = {
        today: 'today',
        yesterday: 'yesterday',
        week: 'in the last 7 days',
        month: 'in the last 30 days',
        '90days': 'in the last 90 days',
    };

    const renderSkeletons = () => {
        const skeletons = Array.from({ length: 4 }).map((_, index) =>
            viewMode === 'card' ? <HistoryCardSkeleton key={index} /> : <HistoryCompactSkeleton key={index} />
        );
        return (
            <div className={`grid gap-4 ${viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {skeletons}
            </div>
        )
    };
    
    const periodFilters: {label: string, value: Period}[] = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 Days', value: 'week' },
        { label: 'Last 30 Days', value: 'month' },
        { label: 'Last 90 Days', value: '90days' },
    ];

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
                                    <CardTitle>Transaction History</CardTitle>
                                    <CardDescription>Review all past transactions.</CardDescription>
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
                            <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-2">
                                {periodFilters.map(filter => (
                                    <Button key={filter.value} variant={period === filter.value ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(filter.value)} className="flex-shrink-0">
                                        {filter.label}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                           {isLoading ? (
                                renderSkeletons()
                           ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <History className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-semibold">No Completed Orders</h3>
                                    <p className="mt-2 text-sm">No transactions were found for {periodLabels[period]}.</p>
                                </div>
                            ) : (
                                 <div className={`grid gap-4 ${viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {filteredOrders.map(order => 
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
                                orderItems={selectedOrder.items as any[]}
                                customerName={selectedOrder.customer_name}
                                subtotal={selectedOrder.subtotal}
                                tax={selectedOrder.tax}
                                fees={selectedOrder.fees as any[]}
                                total={selectedOrder.total}
                                memberId={selectedOrder.member_id}
                                cashPaid={selectedOrder.cash_paid}
                                changeDue={selectedOrder.change_due}
                             />
                        )}
                    </DialogContent>
                </Dialog>

            </AppLayout.Content>
        </AppLayout>
    )
}
