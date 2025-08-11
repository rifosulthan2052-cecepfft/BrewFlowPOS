

'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';

type MenuItemCardProps = {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
};

function getHintFromItemName(name: string): string {
    const words = name.toLowerCase().split(' ');
    if (words.length > 1 && words.includes('coffee')) {
        return words.filter(w => w !== 'coffee').slice(0, 1).join(' ') + ' coffee';
    }
    if(words.length === 1) return name.toLowerCase();
    return words.slice(0, 2).join(' ');
}

function getInitials(name: string): string {
  return name.substring(0, 2).toUpperCase();
}


export default function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const { currency } = useApp();
  const hint = item.name ? getHintFromItemName(item.name) : '';

  return (
    <Card
      className="cursor-pointer hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
      onClick={() => onSelect(item)}
      aria-label={`Add ${item.name} to order`}
    >
      <CardContent className="p-0 flex flex-col items-center text-center">
        <div className="relative w-full aspect-square bg-secondary flex items-center justify-center">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              data-ai-hint={hint}
            />
          ) : (
             <span className="text-4xl font-bold text-secondary-foreground">{getInitials(item.name)}</span>
          )}
        </div>
        <div className="p-2 w-full">
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{formatCurrency(item.price, currency)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

    