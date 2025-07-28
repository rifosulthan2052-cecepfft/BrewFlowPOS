'use client';

import { useState, useMemo } from 'react';
import type { MenuItem, OrderItem, Fee } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import PaymentPanel from '@/components/cashier/PaymentPanel';
import { AppLayout } from '@/components/layout/AppLayout';

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
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');

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
    setOrderStatus('pending');
  }

  const { subtotal, totalFees, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    // Assuming a 11% tax rate for IDR
    const tax = subtotal * 0.11;
    const total = subtotal + totalFees + tax;
    return { subtotal, totalFees, tax, total };
  }, [orderItems, fees]);

  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
        <main className="flex-1 overflow-y-auto">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 p-4 md:p-6">
            <div className="lg:col-span-5 xl:col-span-4 h-full">
              <MenuList menuItems={mockMenuItems} onAddItem={handleAddItem} />
            </div>
            <div className="lg:col-span-4 xl:col-span-5 h-full flex flex-col gap-6">
              <CurrentOrder
                items={orderItems}
                onUpdateQuantity={handleUpdateItemQuantity}
                onRemoveItem={handleRemoveItem}
                onAddFee={handleAddFee}
                fees={fees}
              />
            </div>
            <div className="lg:col-span-3 xl:col-span-3 h-full">
              <PaymentPanel
                subtotal={subtotal}
                feesAmount={totalFees}
                tax={tax}
                total={total}
                onPaymentSuccess={() => setOrderStatus('paid')}
                onSaveOpenBill={() => setOrderStatus('open_bill')}
                orderStatus={orderStatus}
                onNewOrder={resetOrder}
                orderItems={orderItems}
              />
            </div>
          </div>
        </main>
      </AppLayout.Content>
    </AppLayout>
  );
}
