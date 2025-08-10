
'use client'

import React, { useState, useRef, useMemo } from 'react';
import type { CompletedOrder } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Wallet, List, Grid, AlertCircle, Printer, PlayCircle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';
import Receipt from '@/components/cashier/Receipt';
import { Skeleton } from '@/components/ui/skeleton';

function SummaryCard({ title, value, icon, className, isCompact = false }: { title: string, value: string | number, icon: React.ReactNode, className?: string, isCompact?: boolean }) {
    return (
        <Card className={className}>
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", isCompact ? "p-3" : "pb-2")}>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent className={isCompact ? "p-3 pt-0" : ""}>
                <div className={cn("font-bold", isCompact ? "text-lg" : "text-2xl")}>{value}</div>
            </CardContent>
        </Card>
    )
}

function OrderHistoryCompactCard({ order, onSelect }: { order: CompletedOrder, onSelect: (order: CompletedOrder) => void }) {
    const { currency } = useApp();
    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
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

type SalesDetails = {
    items: { [key: string]: number }; // itemName: quantity
    totalFees: number;
    totalTax: number;
    totalSales: number;
};

type SalesByPaymentMethod = {
    cash: SalesDetails;
    card: SalesDetails;
};

const DailySummarySkeleton = () => {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                    </CardContent>
                </Card>
                <Card className="hidden md:block">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                    </CardContent>
                </Card>
                <Card className="hidden md:block">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                    </CardContent>
                </Card>
                <Card className="hidden md:block">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                    </CardContent>
                </Card>
            </div>
             <Separator className="my-4" />
             <div className="space-y-4">
                 <Skeleton className="h-6 w-40" />
                 <Skeleton className="h-16 w-full" />
                 <Skeleton className="h-16 w-full" />
                 <Skeleton className="h-16 w-full" />
             </div>
        </>
    )
}


const DailySummaryPrintout = React.forwardRef<HTMLDivElement, { summary: any, currency: string, salesByPaymentMethod: SalesByPaymentMethod }>(
    ({ summary, currency, salesByPaymentMethod }, ref) => {
    return (
        <div ref={ref} className="p-8 font-sans">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Daily Sales Summary</h1>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b py-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue, currency)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-xl font-bold">{summary.totalTransactions}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2 border-b pb-1">Cash Sales ({formatCurrency(salesByPaymentMethod.cash.totalSales, currency)})</h3>
                    {Object.keys(salesByPaymentMethod.cash.items).length > 0 ? (
                        <>
                            <table className="w-full text-left text-sm">
                                 <tbody>
                                    {Object.entries(salesByPaymentMethod.cash.items).map(([name, quantity]) => (
                                        <tr key={name}>
                                            <td className="p-1">{name}</td>
                                            <td className="p-1 text-right font-mono">{quantity}x</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             <Separator className="my-2" />
                            <table className="w-full text-left text-sm">
                                <tbody>
                                    <tr>
                                        <td className="p-1 text-muted-foreground">Fees</td>
                                        <td className="p-1 text-right font-mono">{formatCurrency(salesByPaymentMethod.cash.totalFees, currency)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-1 text-muted-foreground">Tax</td>
                                        <td className="p-1 text-right font-mono">{formatCurrency(salesByPaymentMethod.cash.totalTax, currency)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    ): <p className="text-sm text-muted-foreground">No cash sales.</p>}
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2 border-b pb-1">Card Sales ({formatCurrency(salesByPaymentMethod.card.totalSales, currency)})</h3>
                     {Object.keys(salesByPaymentMethod.card.items).length > 0 ? (
                        <>
                            <table className="w-full text-left text-sm">
                                <tbody>
                                    {Object.entries(salesByPaymentMethod.card.items).map(([name, quantity]) => (
                                        <tr key={name}>
                                            <td className="p-1">{name}</td>
                                            <td className="p-1 text-right font-mono">{quantity}x</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Separator className="my-2" />
                             <table className="w-full text-left text-sm">
                                <tbody>
                                    <tr>
                                        <td className="p-1 text-muted-foreground">Fees</td>
                                        <td className="p-1 text-right font-mono">{formatCurrency(salesByPaymentMethod.card.totalFees, currency)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-1 text-muted-foreground">Tax</td>
                                        <td className="p-1 text-right font-mono">{formatCurrency(salesByPaymentMethod.card.totalTax, currency)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    ): <p className="text-sm text-muted-foreground">No card sales.</p>}
                </div>
            </div>
        </div>
    );
});
DailySummaryPrintout.displayName = 'DailySummaryPrintout';


export default function DailySummaryPage() {
    const { completedOrders, currency, endDay, startNewDay, storeStatus, isLoading } = useApp();
    const { toast } = useToast();
    const componentToPrintRef = useRef<HTMLDivElement>(null);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);

    const summary = useMemo(() => completedOrders.reduce((acc, order) => {
        acc.totalRevenue += order.total;
        if (order.payment_method === 'cash') {
            acc.cashTotal += order.total;
        } else {
            acc.cardTotal += order.total;
        }
        acc.totalTransactions++;
        return acc;
    }, {
        totalRevenue: 0,
        cashTotal: 0,
        cardTotal: 0,
        totalTransactions: 0
    }), [completedOrders]);
    
    const salesByPaymentMethod = useMemo(() => {
        const sales: SalesByPaymentMethod = {
            cash: { items: {}, totalFees: 0, totalTax: 0, totalSales: 0 },
            card: { items: {}, totalFees: 0, totalTax: 0, totalSales: 0 },
        };

        completedOrders.forEach(order => {
            const target = sales[order.payment_method];
            order.items.forEach(item => {
                target.items[item.name] = (target.items[item.name] || 0) + item.quantity;
            });
            target.totalFees += order.total_fees;
            target.totalTax += order.tax;
            target.totalSales += order.total;
        });

        return sales;
    }, [completedOrders]);


    const handleEndDay = () => {
        endDay();
        toast({
            title: "Day Ended",
            description: "Daily sales have been finalized. You can review the summary until you start a new day.",
        });
    }
    
    const handleStartNewDay = () => {
        startNewDay();
        toast({
            title: "New Day Started",
            description: "Previous day's summary has been cleared. Ready for new sales.",
        });
    }

    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
    });
    
    const handleSelectOrder = (order: CompletedOrder) => {
        setSelectedOrder(order);
    };

    const handleCloseDialog = () => {
        setSelectedOrder(null);
    }

    const isTodaySummaryEmpty = completedOrders.length === 0;

    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Daily Summary</CardTitle>
                                <CardDescription>
                                    {storeStatus === 'OPEN' ? "Review of today's sales activity." : "Store is closed. Review the summary before starting a new day."}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)} disabled={isTodaySummaryEmpty}>
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </Button>
                                {storeStatus === 'OPEN' ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={isTodaySummaryEmpty}>
                                                <AlertCircle className="mr-2 h-4 w-4" /> End Day
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will close the store for the day. You will be able to review the summary, but no new transactions can be made until you start a new day.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleEndDay}>Yes, End Day</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button>
                                                <PlayCircle className="mr-2 h-4 w-4" /> Start New Day
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Start a new sales day?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will clear the current summary and prepare the system for new transactions. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleStartNewDay}>Yes, Start New Day</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <DailySummarySkeleton />
                             ) : (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                                        <SummaryCard title="Total Revenue" value={formatCurrency(summary.totalRevenue, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />}/>
                                        <SummaryCard title="Cash Sales" value={formatCurrency(summary.cashTotal, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} className="hidden md:block" />
                                        <SummaryCard title="Card Sales" value={formatCurrency(summary.cardTotal, currency)} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} className="hidden md:block" />
                                        <SummaryCard title="Transactions" value={summary.totalTransactions} icon={<List className="h-4 w-4 text-muted-foreground" />} className="hidden md:block" />
                                    </div>
                                    
                                    {/* Mobile only compact view */}
                                    <div className="grid grid-cols-3 gap-2 md:hidden mb-4">
                                    <SummaryCard title="Cash Sales" value={formatCurrency(summary.cashTotal, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} isCompact />
                                        <SummaryCard title="Card Sales" value={formatCurrency(summary.cardTotal, currency)} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} isCompact />
                                        <SummaryCard title="Transactions" value={summary.totalTransactions} icon={<List className="h-4 w-4 text-muted-foreground" />} isCompact />
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <h3 className="text-lg font-semibold mb-2">Completed Orders</h3>
                                    {completedOrders.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-16">
                                            <p>No completed orders for this period.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {completedOrders.map(order => 
                                                <OrderHistoryCompactCard key={order.id} order={order} onSelect={handleSelectOrder} />
                                            )}
                                        </div>
                                    )}
                                </>
                             )}
                        </CardContent>
                    </Card>
                </div>

                <div style={{ display: "none" }}>
                    <DailySummaryPrintout ref={componentToPrintRef} summary={summary} currency={currency} salesByPaymentMethod={salesByPaymentMethod} />
                </div>

                <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Daily Summary Printout</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto border rounded-md my-4">
                           <DailySummaryPrintout summary={summary} currency={currency} salesByPaymentMethod={salesByPaymentMethod}/>
                        </div>
                        <DialogFooter>
                            <Button onClick={handlePrint} className="w-full">
                                <Printer className="mr-2 h-4 w-4" /> Print Summary
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && handleCloseDialog()}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Receipt</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                             <Receipt 
                                orderItems={selectedOrder.items}
                                customerName={selectedOrder.customer_name}
                                subtotal={selectedOrder.subtotal}
                                tax={selectedOrder.tax}
                                fees={selectedOrder.fees}
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
