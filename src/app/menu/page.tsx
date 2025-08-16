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
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/image-upload';
import { Combobox } from '@/components/ui/combobox';


const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number'),
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
    
    const [allCategories, setAllCategories] = useState<{ value: string; label: string }[]>([]);

    useMemo(() => {
        const uniqueCategories = new Set(menuItems.map(item => item.category).filter(Boolean) as string[]);
        setAllCategories(Array.from(uniqueCategories).map(cat => ({ value: cat, label: cat })));
    }, [menuItems]);

    const handleCategoryChange = (value: string) => {
        form.setValue('category', value, { shouldValidate: true });
        
        const isNew = !allCategories.some(cat => cat.value.toLowerCase() === value.toLowerCase());
        
        if (isNew && value) {
            const newCategory = { value, label: value };
            setAllCategories(prev => {
                // Avoid adding duplicates if user types fast
                if (prev.some(p => p.value.toLowerCase() === newCategory.value.toLowerCase())) {
                    return prev;
                }
                return [...prev, newCategory];
            });
        }
    };

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
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {menuItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell>
                                                        {item.category ? <Badge variant="secondary">{item.category}</Badge> : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(item.price, currency)}</TableCell>
                                                    <TableCell className="text-right">
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
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
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
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                               <Combobox
                                                    options={allCategories}
                                                    value={field.value ?? ''}
                                                    onChange={handleCategoryChange}
                                                    placeholder="Select or create a category..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
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

    

    
