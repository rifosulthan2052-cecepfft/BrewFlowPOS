'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

type MenuItemCardProps = {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void;
};

function getHintFromItemName(name: string): string {
    const words = name.toLowerCase().split(' ');
    if (words.length > 1 && words.includes('coffee')) {
        return words.filter(w => w !== 'coffee').slice(0, 1).join(' ') + ' coffee';
    }
    if(words.length === 1) return name.toLowerCase();
    return words.slice(0, 2).join(' ');
}


export default function MenuItemCard({ item, onAddItem }: MenuItemCardProps) {
  const hint = getHintFromItemName(item.name);

  return (
    <Card
      className="cursor-pointer hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      onClick={() => onAddItem(item)}
      aria-label={`Add ${item.name} to order`}
    >
      <CardContent className="p-0 flex flex-col items-center text-center">
        <div className="relative w-full aspect-square">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              data-ai-hint={hint}
            />
          )}
        </div>
        <div className="p-2 w-full">
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
