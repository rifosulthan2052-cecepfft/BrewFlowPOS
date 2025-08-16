'use client';

import { useState, useMemo, useRef, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { useApp } from '@/components/layout/AppProvider';
import type { Member } from '@/types';
import { AppLayout } from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Printer, QrCode, MoreVertical, Edit, Trash2, List, Grid } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CoffeeIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const memberFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string().optional(),
}).refine(data => !!data.email || !!data.phone, {
  message: "Either Email or Phone Number must be provided.",
  path: ["email"],
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const MemberCard = forwardRef<HTMLDivElement, { member: Member }>(({ member }, ref) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useMemo(() => {
        QRCode.toDataURL(member.id, { width: 150, margin: 2 }, (err, url) => {
            if (err) console.error(err);
            setQrCodeUrl(url);
        });
    }, [member.id]);

    return (
        <div ref={ref} className="bg-card text-card-foreground rounded-lg border shadow-lg p-6 font-sans w-[350px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CoffeeIcon className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold text-primary">BrewFlow</span>
                </div>
                <span className="text-sm font-semibold text-primary">Member</span>
            </div>
            <div className="text-center my-6">
                <h3 className="text-2xl font-bold">{member.name || 'Valued Member'}</h3>
                <p className="text-muted-foreground">{member.email}</p>
                 <p className="text-muted-foreground">{member.phone}</p>
            </div>
            <div className="flex items-center gap-4">
                {qrCodeUrl && <img src={qrCodeUrl} alt="Member QR Code" className="rounded-md" />}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Member ID</p>
                    <p className="font-mono font-semibold break-all">{member.id}</p>
                    <p className="text-xs text-muted-foreground pt-2">Joined</p>
                    <p className="font-semibold">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
});
MemberCard.displayName = 'MemberCard';

function MemberListSkeleton({ viewMode }: { viewMode: 'card' | 'list' }) {
    if (viewMode === 'card') {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                 ))}
            </div>
        )
    }
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-10" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


export default function MembershipPage() {
    const { members, addMember, updateMember, removeCustomerMember, isLoading } = useApp();
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const cardPrintRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => cardPrintRef.current,
    });

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: { name: '', email: '', phone: '' },
    });
    
    const isValueInUse = (field: 'email' | 'phone', value: string | undefined | null, memberId?: string) => {
        if (!value) return false;
        return members.some(member => member.id !== memberId && member[field] === value);
    }

    const onSubmit = async (values: MemberFormValues) => {
        let hasError = false;
        const memberId = editingMember?.id;

        if (values.email && isValueInUse('email', values.email, memberId)) {
            form.setError('email', { type: 'manual', message: 'This email is already in use.' });
            hasError = true;
        }
        if (values.phone && isValueInUse('phone', values.phone, memberId)) {
            form.setError('phone', { type: 'manual', message: 'This phone number is already in use.' });
            hasError = true;
        }

        if (hasError) return;

        if (editingMember) {
            await updateMember({ ...editingMember, ...values });
        } else {
            const newMember = await addMember(values);
            if (newMember) {
                setSelectedMember(newMember); // Open card view for new member
            }
        }
        
        setIsFormOpen(false);
        setEditingMember(null);
        form.reset();
    };

    const handleViewCard = (member: Member) => {
        setSelectedMember(member);
    }
    
    const handleCloseCardView = () => {
        setSelectedMember(null);
    }
    
    const handleOpenForm = (member: Member | null = null) => {
        setEditingMember(member);
        if (member) {
            form.reset({
                id: member.id,
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
            });
        } else {
            form.reset({ name: '', email: '', phone: '' });
        }
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (memberToDelete) {
            removeCustomerMember(memberToDelete.id);
            setMemberToDelete(null);
        }
    }

    return (
        <AppLayout>
            <AppLayout.Header>
                <Header />
            </AppLayout.Header>
            <AppLayout.Content>
                <div className="p-4 md:p-6">
                    <Card>
                         <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>Membership</CardTitle>
                                <CardDescription>Manage your customer members.</CardDescription>
                                <div className="flex items-center gap-2 mt-4">
                                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}>
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenForm()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <MemberListSkeleton viewMode={viewMode} />
                            ) : members.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>No members yet.</p>
                                    <p className="text-sm">Click "Add Member" to get started.</p>
                                </div>
                            ) : viewMode === 'card' ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {members.map(member => (
                                        <Card key={member.id}>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <div className="flex-1">
                                                    <CardTitle>{member.name || 'Valued Member'}</CardTitle>
                                                    <CardDescription>{member.id}</CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewCard(member)}>
                                                            <QrCode className="mr-2 h-4 w-4" />
                                                            View Card
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenForm(member)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setMemberToDelete(member)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                                <p className="text-sm text-muted-foreground">{member.phone}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <p className="text-xs text-muted-foreground">Joined: {new Date(member.created_at).toLocaleDateString()}</p>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                                <TableHead className="hidden md:table-cell">Phone</TableHead>
                                                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-xs text-muted-foreground md:hidden">{member.email}</div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell truncate">{member.email}</TableCell>
                                                    <TableCell className="hidden md:table-cell">{member.phone}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewCard(member)}>
                                                                    <QrCode className="mr-2 h-4 w-4" />
                                                                    View Card
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleOpenForm(member)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setMemberToDelete(member)} className="text-destructive">
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

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., john@example.com" {...field} />
                                            </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., +1234567890" {...field} />
                                            </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">{editingMember ? 'Save Changes' : 'Create Member'}</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!selectedMember} onOpenChange={(open) => !open && handleCloseCardView()}>
                    <DialogContent>
                        <DialogHeader>
                             <DialogTitle>Membership Card</DialogTitle>
                        </DialogHeader>
                        {selectedMember && (
                           <div className="py-4 flex flex-col items-center gap-4">
                                <MemberCard member={selectedMember} ref={cardPrintRef} />
                               <Button onClick={handlePrint} className="w-full max-w-sm">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Card
                               </Button>
                           </div>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the member "{memberToDelete?.name}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </AppLayout.Content>
        </AppLayout>
    );
}
