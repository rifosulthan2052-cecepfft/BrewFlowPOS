'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useApp } from "@/components/layout/AppProvider";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OpenBillsPage() {
    const { openBills, currency } = useApp();

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
                                                            <span className="font-mono">{formatCurrency(item.price * item.quantity, currency)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Separator className="my-2" />
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Subtotal</span>
                                                        <span className="font-mono">{formatCurrency(bill.subtotal, currency)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total</span>
                                                        <span className="font-bold font-mono">{formatCurrency(bill.total, currency)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Settle Bill</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout.Content>
        </AppLayout>
    )
}
