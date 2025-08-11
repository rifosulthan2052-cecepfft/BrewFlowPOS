

'use client';

import type { MenuItem, Variant } from '@/types';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

type VariantSelectorDialogProps = {
  menuItem: MenuItem | null;
  onSelectVariant: (variant: Variant) => void;
  onClose: () => void;
};

export function VariantSelectorDialog({ menuItem, onSelectVariant, onClose }: VariantSelectorDialogProps) {
  const { currency } = useApp();

  if (!menuItem) {
    return null;
  }

  return (
    <Dialog open={!!menuItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a variant for {menuItem.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-2">
            {menuItem.variants.map((variant) => (
              <li key={variant.name}>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => onSelectVariant(variant)}
                >
                  <span className="text-base font-semibold">{variant.name}</span>
                  <span className="text-base font-mono">{formatCurrency(variant.price, currency)}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
