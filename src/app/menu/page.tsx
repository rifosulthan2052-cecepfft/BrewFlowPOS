
'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MenuItem } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { useApp } from "@/components/layout/AppProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function MenuPage() {
    const { menuItems, addMenuItem, updateMenuItem, removeMenuItem, currency } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const form = useForm<MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            name: '',
            price: 0,
            category: '',
            imageUrl: '',
        },
    });

    const handleOpenDialog = (item: MenuItem | null = null) => {
        setEditingItem(item);
        if (item) {
            form.reset(item);
        } else {
            form.reset({ name: '', price: 0, category: '', imageUrl: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        form.reset();
    };

    const onSubmit = (values: MenuItemFormValues) => {
        if (editingItem) {
            updateMenuItem({ ...editingItem, ...values });
        } else {
            addMenuItem({
                id: `menu-${Date.now()}`,
                "data-ai-hint": values.name.toLowerCase(),
                ...values,
            });
        }
        handleCloseDialog();
    };
    
    const handleDelete = (id: string) => {
        removeMenuItem(id);
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
                                <CardTitle>Menu</CardTitle>
                                <CardDescription>Manage your menu items here.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-6">Name</TableHead>
                                            <TableHead className="px-6">Category</TableHead>
                                            <TableHead className="text-right px-6">Price</TableHead>
                                            <TableHead className="w-[100px] text-right px-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {menuItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium px-6">{item.name}</TableCell>
                                                <TableCell className="px-6">
                                                    {item.category ? <Badge variant="secondary">{item.category}</Badge> : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono px-6">{formatCurrency(item.price, currency)}</TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the "{item.name}" menu item. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                            <DialogDescription>
                                {editingItem ? 'Update the details of your menu item.' : 'Add a new item to your menu.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Espresso" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                 <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'IDR' ? 'Rp' : '$'}</span>
                                                    <CurrencyInput value={field.value} onValueChange={field.onChange} className="pl-8 text-right" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Coffee, Pastry" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com/image.png" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </AppLayout.Content>
        </AppLayout>
    )
}
