

'use client'

import { useState, useMemo } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PlusCircle, Edit, Trash2, MoreVertical, Utensils, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().optional(),
  image_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

function EmptyState() {
    return (
        <div className="text-center py-16 text-muted-foreground">
            <Utensils className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Menu Items</h3>
            <p className="mt-2 text-sm">Get started by adding your first menu item.</p>
        </div>
    )
}

function MenuListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex-row gap-4 items-center">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
             ))}
        </div>
    )
}

export default function MenuPage() {
    const { menuItems, addMenuItem, updateMenuItem, removeMenuItem, currency, isLoading, uploadImage } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

    const existingCategories = useMemo(() => {
        const categories = new Set(menuItems.map(item => item.category).filter(Boolean));
        return Array.from(categories) as string[];
    }, [menuItems]);

    const form = useForm<MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            name: '',
            price: 0,
            category: '',
            image_url: '',
        },
    });

    const handleOpenDialog = (item: MenuItem | null = null) => {
        setEditingItem(item);
        if (item) {
            form.reset({
              ...item,
              image_url: item.image_url || '',
            });
        } else {
            form.reset({ name: '', price: 0, category: '', image_url: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        form.reset();
    };

    const onSubmit = async (values: MenuItemFormValues) => {
        setIsFormSubmitting(true);
        if (editingItem) {
            await updateMenuItem({ ...editingItem, ...values });
        } else {
            await addMenuItem({
                "data-ai-hint": values.name.toLowerCase(),
                ...values,
            });
        }
        setIsFormSubmitting(false);
        handleCloseDialog();
    };
    
    const handleDelete = () => {
        if (itemToDelete) {
            removeMenuItem(itemToDelete.id);
            setIsAlertOpen(false);
            setItemToDelete(null);
        }
    }
    
    const openDeleteConfirm = (item: MenuItem) => {
        setItemToDelete(item);
        setIsAlertOpen(true);
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
                        <CardContent>
                            {isLoading ? (
                                <MenuListSkeleton />
                            ) : menuItems.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <>
                                    {/* Mobile View */}
                                    <div className="md:hidden">
                                        <div className="space-y-4">
                                            {menuItems.map((item, index) => (
                                                <div key={item.id}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium">{item.name}</div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openDeleteConfirm(item)} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.category && <Badge variant="secondary" className="mr-2">{item.category}</Badge>}
                                                        <span className="font-mono">{formatCurrency(item.price, currency)}</span>
                                                    </div>
                                                    {index < menuItems.length - 1 && <Separator className="mt-4" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Desktop View */}
                                    <div className="hidden md:block">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="px-6">Name</TableHead>
                                                        <TableHead className="px-6">Category</TableHead>
                                                        <TableHead className="text-right px-6">Price</TableHead>
                                                        <TableHead className="w-[50px] text-right px-6">Actions</TableHead>
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
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => openDeleteConfirm(item)} className="text-destructive">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </>
                            )}
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
                                    name="image_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onUpload={(file) => uploadImage(file, 'menu-images')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                             <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {existingCategories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                    <Button type="submit" disabled={isFormSubmitting}>
                                        {isFormSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
                
                 <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the "{itemToDelete?.name}" menu item. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout.Content>
        </AppLayout>
    )
}
