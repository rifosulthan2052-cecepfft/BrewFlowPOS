

'use client';

import Image from 'next/image';
import type { MenuItem, OrderItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';


type MenuItemCardProps = {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  orderItem?: OrderItem;
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


export default function MenuItemCard({ item, onSelect, onUpdateQuantity, orderItem }: MenuItemCardProps) {
  const { currency } = useApp();
  const hint = item.name ? getHintFromItemName(item.name) : '';
  const quantity = orderItem?.quantity || 0;

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateQuantity(item.id, quantity + 1);
  };
  
  const handleMinusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateQuantity(item.id, quantity - 1);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 overflow-hidden relative group"
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
           {quantity > 0 && (
              <>
                 <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold animate-bounce-in">
                    {quantity}
                </div>
                <div className="absolute bottom-2 left-2 right-2 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleMinusClick}>
                        <Minus />
                    </Button>
                    <span className="font-bold text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePlusClick}>
                        <Plus />
                    </Button>
                </div>
              </>
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
