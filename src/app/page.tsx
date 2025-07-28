
'use client';

import { useMemo } from 'react';
import type { MenuItem } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/components/layout/AppProvider';

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
  const {
    orderItems,
    addItemToOrder,
    updateItemQuantity,
    removeItemFromOrder,
    customerName,
    setCustomerName,
    orderStatus,
    resetOrder,
    total,
  } = useApp();

  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] h-full">
          <div className="h-full overflow-y-auto p-4 md:p-6">
            <MenuList menuItems={mockMenuItems} onAddItem={addItemToOrder} />
          </div>
          <div className="h-full bg-secondary/20 border-l">
            <CurrentOrder
              items={orderItems}
              customerName={customerName}
              orderStatus={orderStatus}
              total={total}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItemFromOrder}
              onCustomerNameChange={setCustomerName}
              onNewOrder={resetOrder}
            />
          </div>
        </div>
      </AppLayout.Content>
    </AppLayout>
  );
}
