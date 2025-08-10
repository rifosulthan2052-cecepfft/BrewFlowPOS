

'use client';

import { useState, useMemo } from 'react';
import type { MenuItem } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { ChevronUp, ShoppingCart, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


function OrderSummaryBar({ onOpen }: { onOpen: () => void }) {
    const { total, orderItems, currency } = useApp();
    const itemCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    if (itemCount === 0) {
        return null;
    }

    return (
        <div 
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full shadow-lg z-20 cursor-pointer animate-in fade-in slide-in-from-bottom-5"
            onClick={onOpen}
        >
            <div className="px-6 py-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                            {itemCount}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold">View Order ({formatCurrency(total, currency)})</p>
                    </div>
                </div>
                <ChevronUp className="h-5 w-5" />
            </div>
        </div>
    )

}

function MenuListSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="w-full aspect-square" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
            ))}
        </div>
    );
}

export default function CashierPage() {
    const {
        menuItems,
        orderItems,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        customer_name,
        setCustomerName,
        orderStatus,
        resetOrder,
        editingBillId,
        storeStatus,
        startNewDay,
        isLoading,
    } = useApp();
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const { toast } = useToast();

    const categories = useMemo(() => {
        const cats = new Set<string>();
        menuItems.forEach(item => {
            if (item.category) {
                cats.add(item.category);
            }
        });
        return ['All', ...Array.from(cats)];
    }, [menuItems]);
    
    const handleNewOrder = () => {
        resetOrder();
        setIsOrderOpen(false);
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // If dialog is closing and the order was just paid, trigger a new order.
            if (orderStatus === 'paid') {
                handleNewOrder();
            } else {
                setIsOrderOpen(false);
            }
        } else {
            setIsOrderOpen(true);
        }
    }
    
    const handleStartNewDay = () => {
        startNewDay();
        toast({
            title: "New Day Started",
            description: "Ready for new sales.",
        });
    }


  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
       <div className="relative p-4 md:p-6 pb-24">
            {storeStatus === 'CLOSED' && (
                <div className="absolute inset-0 bg-background/50 z-10" />
            )}
            <Tabs defaultValue="All" className="space-y-4">
              <TabsList>
                {isLoading ? (
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                ) : (
                    categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))
                )}
              </TabsList>
               {isLoading ? (
                    <MenuListSkeleton />
               ) : (
                    categories.map(category => (
                        <TabsContent key={category} value={category}>
                        <MenuList 
                                menuItems={category === 'All' ? menuItems : menuItems.filter(item => item.category === category)} 
                                orderItems={orderItems} 
                                onAddItem={addItemToOrder}
                                onUpdateQuantity={updateItemQuantity}
                            />
                        </TabsContent>
                    ))
               )}
            </Tabs>
        </div>
        <OrderSummaryBar onOpen={() => setIsOrderOpen(true)} />
        <Dialog open={isOrderOpen} onOpenChange={handleOpenChange}>
            <DialogContent className={cn("max-w-2xl p-0 gap-0 flex flex-col", orderStatus !== 'paid' && "h-[90vh]")}>
                <CurrentOrder
                    items={orderItems}
                    customer_name={customer_name}
                    orderStatus={orderStatus}
                    onUpdateQuantity={updateItemQuantity}
                    onRemoveItem={removeItemFromOrder}
                    onCustomerNameChange={setCustomerName}
                    onNewOrder={handleNewOrder}
                    onClearOrder={() => {
                        resetOrder();
                         if (!editingBillId) {
                            setIsOrderOpen(false);
                        }
                    }}
                    onClose={() => setIsOrderOpen(false)}
                />
            </DialogContent>
        </Dialog>
         <Dialog open={storeStatus === 'CLOSED' && !isLoading} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" hideCloseButton>
                <DialogHeader>
                    <DialogTitle>Store is Closed</DialogTitle>
                    <DialogDescription>
                        You need to start a new day before you can take new orders.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                     <Button onClick={handleStartNewDay} className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" /> Start New Day
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </AppLayout.Content>
    </AppLayout>
  );
}
