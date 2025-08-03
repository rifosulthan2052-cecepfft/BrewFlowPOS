

'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Minus } from 'lucide-react';

type MenuItemCardProps = {
  item: MenuItem;
  quantity: number;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
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


export default function MenuItemCard({ item, quantity, onAddItem, onUpdateQuantity }: MenuItemCardProps) {
  const { currency } = useApp();
  const hint = getHintFromItemName(item.name);
  
  const handleWrapperClick = () => {
    if (quantity === 0) {
      onAddItem(item);
    }
  }
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
      onClick={handleWrapperClick}
      aria-label={`Add ${item.name} to order`}
    >
      <CardContent className="p-0 flex flex-col items-center text-center">
        <div className="relative w-full aspect-square bg-secondary flex items-center justify-center">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
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
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div className="absolute inset-x-2 bottom-2" onClick={stopPropagation}>
                  <div className="flex items-center justify-center gap-2 p-1 bg-background/80 rounded-full">
                     <Button 
                       variant="primary" 
                       size="icon" 
                       className="h-8 w-8 rounded-full" 
                       onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                     >
                        <Minus className="h-4 w-4" />
                     </Button>
                     <Input 
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-14 h-8 text-center bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                     />
                      <Button 
                       variant="primary" 
                       size="icon" 
                       className="h-8 w-8 rounded-full" 
                       onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                     >
                        <Plus className="h-4 w-4" />
                     </Button>
                  </div>
              </div>
              <Badge 
                variant="default" 
                className="absolute top-2 right-2 z-10 rounded-full h-6 w-6 flex items-center justify-center bg-accent text-accent-foreground shadow-lg"
                aria-label={`${quantity} in order`}
              >
                {quantity}
              </Badge>
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
