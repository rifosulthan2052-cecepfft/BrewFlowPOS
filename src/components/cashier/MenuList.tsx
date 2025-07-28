'use client';

import type { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MenuItemCard from './MenuItemCard';

type MenuListProps = {
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem) => void;
};

export default function MenuList({ menuItems, onAddItem }: MenuListProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardContent className="p-4 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddItem={onAddItem} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
