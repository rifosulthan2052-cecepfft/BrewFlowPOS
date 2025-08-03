
'use client'

import { useState } from 'react';
import type { CompletedOrder } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Wallet, List, Grid, AlertCircle } from 'lucide-react';
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

function SummaryCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}

function OrderHistoryCompactCard({ order }: { order: CompletedOrder }) {
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
                </div>
            </CardContent>
        </Card>
    )
}


export default function DailySummaryPage() {
    const { completedOrders, currency, endDay } = useApp();
    const { toast } = useToast();

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
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                                <SummaryCard title="Total Revenue" value={formatCurrency(summary.totalRevenue, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />}/>
                                <SummaryCard title="Cash Sales" value={formatCurrency(summary.cashTotal, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />}/>
                                <SummaryCard title="Card Sales" value={formatCurrency(summary.cardTotal, currency)} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}/>
                                <SummaryCard title="Transactions" value={summary.totalTransactions} icon={<List className="h-4 w-4 text-muted-foreground" />}/>
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
            </AppLayout.Content>
        </AppLayout>
    )
}
