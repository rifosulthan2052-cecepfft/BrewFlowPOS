

'use client';

import type { MenuItem, OrderItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import MenuItemCard from './MenuItemCard';
import { SearchX } from 'lucide-react';

type MenuListProps = {
  menuItems: MenuItem[];
  orderItems: OrderItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  searchTerm: string;
};

export default function MenuList({ menuItems, orderItems, onAddItem, onUpdateQuantity, searchTerm }: MenuListProps) {
  const getQuantity = (menuItemId: string) => {
    const item = orderItems.find(item => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  }

  if (menuItems.length === 0 && searchTerm) {
    return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
            <SearchX className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
            <p className="mt-2 text-sm">No menu items match your search for "{searchTerm}".</p>
        </div>
    )
  }

  return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              quantity={getQuantity(item.id)}
              onAddItem={onAddItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
  );
}
