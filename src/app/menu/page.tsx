'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MenuPage() {
    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu</CardTitle>
                            <CardDescription>Manage your menu items here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Menu editing functionality will be implemented here.</p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout.Content>
        </AppLayout>
    )
}
