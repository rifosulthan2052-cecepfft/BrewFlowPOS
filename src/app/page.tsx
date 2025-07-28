

'use client';

import { useState, useMemo } from 'react';
import type { MenuItem, OrderItem, Fee } from '@/types';
import Header from '@/components/layout/Header';
import MenuList from '@/components/cashier/MenuList';
import CurrentOrder from '@/components/cashier/CurrentOrder';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/components/layout/AppProvider';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
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
  const { taxRate, currency } = useApp();

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

  const handlePaymentSuccess = () => {
    setOrderStatus('paid');
  }

  const handleSaveOpenBill = () => {
    setOrderStatus('open_bill');
    // In a real app, this would save the order to a database
    // For now, we just reset it
    setTimeout(() => {
      resetOrder();
    }, 1000)
  }

  const isOrderEmpty = orderItems.length === 0;

  return (
    <AppLayout>
      <AppLayout.Header>
        <Header />
      </AppLayout.Header>
      <AppLayout.Content>
        <div className="h-full relative">
            <div className="h-full overflow-y-auto p-4 md:p-6">
                <MenuList menuItems={mockMenuItems} onAddItem={handleAddItem} />
            </div>

            {!isOrderSheetOpen && !isOrderEmpty && (
              <Sheet open={isOrderSheetOpen} onOpenChange={setIsOrderSheetOpen}>
                <SheetTrigger asChild>
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-10 lg:left-64">
                    <Button className="w-full h-14 text-lg">
                        <ShoppingCart className="mr-4" />
                        <span>View Order ({orderItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                        <span className="ml-auto font-bold">{formatCurrency(total, currency)}</span>
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[540px] flex flex-col p-0">
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
                </SheetContent>
              </Sheet>
            )}
             {isOrderEmpty && orderStatus === 'pending' && (
                 <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-10 lg:left-64">
                    <div className="flex items-center justify-center h-14 text-lg bg-muted text-muted-foreground rounded-lg">
                        <ShoppingCart className="mr-4" />
                        <span>No items in order. Add items to start.</span>
                    </div>
                </div>
            )}
            
             <Sheet open={isOrderSheetOpen} onOpenChange={setIsOrderSheetOpen}>
                <SheetTrigger asChild>
                    { !isOrderEmpty &&
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-10 lg:left-[--sidebar-width] peer-data-[collapsible=icon]:lg:left-[--sidebar-width-icon]">
                            <Button className="w-full h-14 text-lg">
                                <ShoppingCart className="mr-4" />
                                <span>View Order ({orderItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                                <span className="ml-auto font-bold">{formatCurrency(total, currency)}</span>
                            </Button>
                        </div>
                    }
                </SheetTrigger>
                <SheetContent className="w-full max-w-none sm:max-w-md flex flex-col p-0">
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
                </SheetContent>
            </Sheet>
        </div>
      </AppLayout.Content>
    </AppLayout>
  );
}
