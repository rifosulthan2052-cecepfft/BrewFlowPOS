

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReceiptToPrint } from '@/components/cashier/Receipt';
import type { OrderItem, Fee } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState, useEffect } from 'react';

const settingsFormSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  footerMessage: z.string().min(1, 'Footer message is required'),
  taxRate: z.coerce.number().min(0, "Tax rate must be non-negative.").max(100, "Tax rate cannot exceed 100."),
  currency: z.enum(['USD', 'IDR']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const mockOrderItems: OrderItem[] = [
    { menuItemId: '1', name: 'Espresso', price: 2.50, quantity: 1 },
    { menuItemId: '2', name: 'Croissant', price: 3.00, quantity: 2 },
];
const mockFees: Fee[] = [{ name: 'Tip', amount: 1, notes: '' }];
const mockSubtotal = mockOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
const mockTotalFees = mockFees.reduce((acc, fee) => acc + fee.amount, 0);


function ReceiptPreview({ formData }: { formData: SettingsFormValues }) {
    const mockTax = mockSubtotal * (formData.taxRate / 100);
    const mockTotal = mockSubtotal + mockTotalFees + mockTax;

    return (
        <div className="border rounded-md p-2 bg-muted/20">
             <ReceiptToPrint
                orderItems={mockOrderItems}
                subtotal={mockSubtotal}
                tax={mockTax}
                fees={mockFees}
                total={mockTotal}
                customer_name="Jane Doe"
                receiptSettings={{
                    storeName: formData.storeName,
                    logoUrl: formData.logoUrl,
                    address: formData.address,
                    phoneNumber: formData.phoneNumber,
                    footerMessage: formData.footerMessage,
                }}
                currency={formData.currency}
                taxRate={formData.taxRate / 100}
            />
        </div>
    );
}

export default function SettingsPage() {
    const { receiptSettings, setReceiptSettings, taxRate, setTaxRate, currency, setCurrency, uploadImage } = useApp();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            ...receiptSettings,
            taxRate: taxRate * 100, // Display as percentage
            currency: currency,
        },
    });

    useEffect(() => {
        form.reset({
            ...receiptSettings,
            taxRate: taxRate * 100,
            currency: currency,
        });
    }, [receiptSettings, taxRate, currency, form]);
    
    const watchedValues = form.watch();

    const onSubmit = (values: SettingsFormValues) => {
        setIsSubmitting(true);
        const { taxRate, currency, ...newReceiptSettings } = values;
        setReceiptSettings(newReceiptSettings);
        setTaxRate(taxRate / 100); // Store as decimal
        setCurrency(currency);
        toast({
            title: 'Settings Saved',
            description: 'Your settings have been updated successfully.',
        })
        setIsSubmitting(false);
    };

    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Store Settings</CardTitle>
                                    <CardDescription>Manage global store settings like currency and tax rate.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                    >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                        <RadioGroupItem value="IDR" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                        IDR (Rp) - Indonesian Rupiah
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                        <RadioGroupItem value="USD" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                        USD ($) - US Dollar
                                                        </FormLabel>
                                                    </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="taxRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tax Rate</FormLabel>
                                                <div className="relative">
                                                    <Input type="number" placeholder="10" {...field} className="pr-8" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                                </div>
                                                <FormDescription>
                                                    The sales tax rate to apply to all orders.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Receipt Customization</CardTitle>
                                        <CardDescription>Set the branding and information for your printed receipts.</CardDescription>
                                    </div>
                                     <Dialog>
                                        <DialogTrigger asChild>
                                             <Button variant="outline">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Receipt Preview</DialogTitle>
                                                <DialogDescription>This is how your receipt will look based on the current settings.</DialogDescription>
                                            </DialogHeader>
                                            <ReceiptPreview formData={watchedValues} />
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="logoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Store Logo</FormLabel>
                                                <FormControl>
                                                     <ImageUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onUpload={(file) => uploadImage(file, 'logos')}
                                                        className="w-40 h-40"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="storeName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Store Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., The Daily Grind" {...field} />
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
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </AppLayout.Content>
        </AppLayout>
    );
}
