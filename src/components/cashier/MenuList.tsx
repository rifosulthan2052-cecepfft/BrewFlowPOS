
'use client';

import type { MenuItem, OrderItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import MenuItemCard from './MenuItemCard';

type MenuListProps = {
  menuItems: MenuItem[];
  orderItems: OrderItem[];
  onAddItem: (item: MenuItem) => void;
};

export default function MenuList({ menuItems, orderItems, onAddItem }: MenuListProps) {
  const getQuantity = (menuItemId: string) => {
    const item = orderItems.find(item => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  }

  return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              quantity={getQuantity(item.id)}
              onAddItem={onAddItem} />
          ))}
        </div>
  );
}
