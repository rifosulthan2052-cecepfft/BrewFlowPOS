'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderHistoryPage() {
    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>Review past transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Order history will be displayed here.</p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout.Content>
        </AppLayout>
    )
}
