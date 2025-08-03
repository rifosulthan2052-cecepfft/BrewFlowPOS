

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

export default function CashierPage() {
    const {
        menuItems,
        orderItems,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        customerName,
        setCustomerName,
        orderStatus,
        resetOrder,
        editingBillId,
        storeStatus,
        startNewDay,
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
       <div className="p-4 md:p-6 pb-24">
            <Tabs defaultValue="All" className="space-y-4">
              <TabsList>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                       <MenuList 
                            menuItems={category === 'All' ? menuItems : menuItems.filter(item => item.category === category)} 
                            orderItems={orderItems} 
                            onAddItem={addItemToOrder}
                            onUpdateQuantity={updateItemQuantity}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
        <OrderSummaryBar onOpen={() => setIsOrderOpen(true)} />
        <Dialog open={isOrderOpen} onOpenChange={handleOpenChange}>
            <DialogContent className={cn("max-w-2xl p-0 gap-0 flex flex-col", orderStatus !== 'paid' && "h-[90vh]")}>
                <CurrentOrder
                    items={orderItems}
                    customerName={customerName}
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
         <Dialog open={storeStatus === 'CLOSED'} >
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
