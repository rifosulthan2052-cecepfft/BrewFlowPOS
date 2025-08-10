
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Printer, QrCode } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CoffeeIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';


const memberFormSchema = z.object({
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

function MemberListSkeleton() {
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


export default function MembershipPage() {
    const { members, addMember, isLoading } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const cardPrintRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => cardPrintRef.current,
    });

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: { name: '', email: '', phone: '' },
    });

    const onSubmit = async (values: MemberFormValues) => {
        const newMember = await addMember(values);
        if (newMember) {
            setSelectedMember(newMember);
        }
        setIsDialogOpen(false);
        form.reset();
    };

    const handleViewCard = (member: Member) => {
        setSelectedMember(member);
    }
    
    const handleCloseCardView = () => {
        setSelectedMember(null);
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
                                <CardTitle>Membership</CardTitle>
                                <CardDescription>Manage your customer members.</CardDescription>
                            </div>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <MemberListSkeleton />
                            ) : members.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>No members yet.</p>
                                    <p className="text-sm">Click "Add Member" to get started.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {members.map(member => (
                                        <Card key={member.id}>
                                            <CardHeader>
                                                <CardTitle>{member.name || 'Valued Member'}</CardTitle>
                                                <CardDescription>{member.id}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                                <p className="text-sm text-muted-foreground">{member.phone}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" className="w-full" onClick={() => handleViewCard(member)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    View Card
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
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
                                    <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Member</Button>
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

            </AppLayout.Content>
        </AppLayout>
    );
}
