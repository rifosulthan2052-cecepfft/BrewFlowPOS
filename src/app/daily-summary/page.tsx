
'use client'

import { useState, useRef, forwardRef } from 'react';
import type { CompletedOrder } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Wallet, List, Grid, AlertCircle, Printer } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';

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

function OrderHistoryCompactCard({ order }: { order: CompletedOrder }) {
    const { currency } = useApp();
    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
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
                </div>
            </CardContent>
        </Card>
    )
}

const DailySummaryPrintout = forwardRef<HTMLDivElement, { summary: any, orders: CompletedOrder[], currency: string }>(({ summary, orders, currency }, ref) => {
    return (
        <div ref={ref} className="p-8 font-sans">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Daily Sales Summary</h1>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6 border-t border-b py-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue, currency)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Cash Sales</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.cashTotal, currency)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Card Sales</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.cardTotal, currency)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-xl font-bold">{summary.totalTransactions}</p>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="p-2 border-b">Customer</th>
                        <th className="p-2 border-b">Time</th>
                        <th className="p-2 border-b">Payment</th>
                        <th className="p-2 border-b text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="p-2 border-b">{order.customerName}</td>
                            <td className="p-2 border-b">{new Date(order.date).toLocaleTimeString()}</td>
                            <td className="p-2 border-b capitalize">{order.paymentMethod}</td>
                            <td className="p-2 border-b text-right font-mono">{formatCurrency(order.total, currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
DailySummaryPrintout.displayName = 'DailySummaryPrintout';

export default function DailySummaryPage() {
    const { completedOrders, currency, endDay } = useApp();
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    const summary = completedOrders.reduce((acc, order) => {
        acc.totalRevenue += order.total;
        if (order.paymentMethod === 'cash') {
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
    });

    const handleEndDay = () => {
        endDay();
        toast({
            title: "Day Ended",
            description: "Daily sales have been finalized and the order history has been cleared.",
        });
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

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
                                <CardDescription>Review of today's sales activity.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handlePrint} disabled={completedOrders.length === 0}>
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={completedOrders.length === 0}>
                                            <AlertCircle className="mr-2 h-4 w-4" /> End Day
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will finalize the daily sales and clear all completed order history. 
                                                This cannot be undone. Make sure you have reconciled your cash and card payments.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleEndDay}>Yes, End Day</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                    <p>No completed orders for today.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {completedOrders.map(order => 
                                        <OrderHistoryCompactCard key={order.id} order={order} />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div style={{ display: 'none' }}>
                    <DailySummaryPrintout ref={printRef} summary={summary} orders={completedOrders} currency={currency} />
                </div>
            </AppLayout.Content>
        </AppLayout>
    )
}
