'use client';

import { useState, useMemo } from 'react';
import type { MenuItem, OrderItem, Fee } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '@/components/layout/AppProvider';
import { formatCurrency } from '@/lib/utils';


const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 35000, imageUrl: 'https://placehold.co/150x150' },
  { id: '2', name: 'Latte', price: 45000, imageUrl: 'https://placehold.co/150x150' },
  { id: '3', name: 'Cappuccino', price: 42000, imageUrl: 'https://placehold.co/150x150' },
  { id: '4', name: 'Americano', price: 38000, imageUrl: 'https://placehold.co/150x150' },
  { id: '5', name: 'Mocha', price: 50000, imageUrl: 'https://placehold.co/150x150' },
  { id: '6', name: 'Macchiato', price: 40000, imageUrl: 'https://placehold.co/150x150' },
  { id: '7', name: 'Drip Coffee', price: 32000, imageUrl: 'https://placehold.co/150x150' },
  { id: '8', name: 'Croissant', price: 25000, imageUrl: 'https://placehold.co/150x150' },
  { id: '9', name: 'Muffin', price: 22000, imageUrl: 'https://placehold.co/150x150' },
  { id: '10', name: 'Scone', price: 28000, imageUrl: 'https://placehold.co/150x150' },
];

export default function CashierPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const { currency, taxRate } = useApp();

  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        )
      );
    }
  };
  
  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const handleAddFee = (fee: Fee) => {
    setFees((prevFees) => [...prevFees, fee]);
  };

  const resetOrder = () => {
    setOrderItems([]);
    setFees([]);
    setCustomerName('');
    setOrderStatus('pending');
    setIsOrderSheetOpen(false);
  }

  const { subtotal, totalFees, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + totalFees + tax;
    return { subtotal, totalFees, tax, total };
  }, [orderItems, fees, taxRate]);

  const totalItems = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [orderItems]);

  const handlePaymentSuccess = () => {
    setOrderStatus('paid');
    // We don't close the sheet so the user can see the receipt
  }

  const handleSaveOpenBill = () => {
    setOrderStatus('open_bill');
    setIsOrderSheetOpen(false);
  }

  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <MenuList menuItems={mockMenuItems} onAddItem={handleAddItem} />
        </div>
        {totalItems > 0 && (
          <Dialog open={isOrderSheetOpen} onOpenChange={setIsOrderSheetOpen}>
            <DialogTrigger asChild>
              <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:bottom-4 z-20">
                <Button className="w-full md:w-auto h-16 md:h-auto md:rounded-full shadow-lg text-lg flex items-center justify-between gap-4 px-6 py-4">
                    <div className='flex items-center gap-2'>
                      <ShoppingCart />
                      <span>
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span>{formatCurrency(total, currency)}</span>
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full h-[90vh] flex flex-col p-0">
                <DialogTitle className="sr-only">Current Order</DialogTitle>
                <DialogDescription className="sr-only">Review, manage, and process the current order.</DialogDescription>
                <CurrentOrder
                    items={orderItems}
                    fees={fees}
                    customerName={customerName}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                    totalFees={totalFees}
                    orderStatus={orderStatus}
                    onUpdateQuantity={handleUpdateItemQuantity}
                    onRemoveItem={handleRemoveItem}
                    onAddFee={handleAddFee}
                    onCustomerNameChange={setCustomerName}
                    onPaymentSuccess={handlePaymentSuccess}
                    onSaveOpenBill={handleSaveOpenBill}
                    onNewOrder={resetOrder}
                  />
            </DialogContent>
          </Dialog>
        )}
      </AppLayout.Content>
    </AppLayout>
  );
}
