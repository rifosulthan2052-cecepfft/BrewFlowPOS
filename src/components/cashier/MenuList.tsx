

'use client';

import type { MenuItem } from '@/types';
import MenuItemCard from './MenuItemCard';
import { SearchX } from 'lucide-react';

type MenuListProps = {
  menuItems: MenuItem[];
  onSelectMenuItem: (item: MenuItem) => void;
  searchTerm: string;
};

export default function MenuList({ menuItems, onSelectMenuItem, searchTerm }: MenuListProps) {

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
              onSelect={onSelectMenuItem}
            />
          ))}
        </div>
  );
}

    