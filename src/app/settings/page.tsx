
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { useApp } from "@/components/layout/AppProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const settingsFormSchema = z.object({
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  footerMessage: z.string().min(1, 'Footer message is required'),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    const { receiptSettings, setReceiptSettings } = useApp();
    const { toast } = useToast();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: receiptSettings,
    });

    const onSubmit = (values: SettingsFormValues) => {
        setReceiptSettings(values);
        toast({
            title: 'Settings Saved',
            description: 'Your receipt settings have been updated successfully.',
        })
    };

    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>Customize your application settings here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Receipt Customization</CardTitle>
                                            <CardDescription>Set the branding and information for your printed receipts.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="logoUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Logo URL (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Store Address</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="123 Main Street, Anytown, USA" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="(555) 123-4567" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="footerMessage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Receipt Footer Message</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Thank you for your business!" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                    
                                    <div className="flex justify-end">
                                        <Button type="submit">Save Settings</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout.Content>
        </AppLayout>
    );
}

