

'use client';

import { useState, useEffect } from 'react';
import type { MenuItem } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { ChevronUp, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 35000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "espresso coffee" },
  { id: '2', name: 'Latte', price: 45000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "latte coffee" },
  { id: '3', name: 'Cappuccino', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYXBwdWNpbm98ZW58MHx8fHwxNzUzNzQwNDYwfDA&ixlib=rb-4.1.0&q=80&w=1080', "data-ai-hint": "cappuccino coffee" },
  { id: '4', name: 'Americano', price: 38000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "americano coffee" },
  { id: '5', name: 'Mocha', price: 50000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "mocha coffee" },
  { id: '6', name: 'Macchiato', price: 40000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "macchiato coffee" },
  { id: '7', name: 'Drip Coffee', price: 32000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "drip coffee" },
  { id: '8', name: 'Croissant', price: 25000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "croissant pastry" },
  { id: '9', name: 'Muffin', price: 22000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "muffin pastry" },
  { id: '10', name: 'Scone', price: 28000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "scone pastry" },
];

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
        orderItems,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        customerName,
        setCustomerName,
        orderStatus,
        resetOrder,
        editingBillId
    } = useApp();
    const [isOrderOpen, setIsOrderOpen] = useState(false);

  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
       <div className="p-4 md:p-6 pb-24">
            <MenuList menuItems={mockMenuItems} orderItems={orderItems} onAddItem={addItemToOrder} />
        </div>
        <OrderSummaryBar onOpen={() => setIsOrderOpen(true)} />
        <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
            <DialogContent className="max-w-2xl p-0 gap-0 h-[90vh] flex flex-col">
                <DialogHeader className='p-6 pb-2 flex-shrink-0'>
                    <DialogTitle className='text-2xl font-semibold leading-none tracking-tight'>
                        { editingBillId ? 'Editing Bill' : 'Current Order' }
                    </DialogTitle>
                </DialogHeader>
                <CurrentOrder
                    items={orderItems}
                    customerName={customerName}
                    orderStatus={orderStatus}
                    onUpdateQuantity={updateItemQuantity}
                    onRemoveItem={removeItemFromOrder}
                    onCustomerNameChange={setCustomerName}
                    onNewOrder={() => {
                        resetOrder();
                        setIsOrderOpen(false);
                    }}
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
      </AppLayout.Content>
    </AppLayout>
  );
}
