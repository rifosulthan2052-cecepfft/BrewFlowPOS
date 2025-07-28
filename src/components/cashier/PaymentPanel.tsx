
'use client';

import { Button } from '@/components/ui/button';
import { ChangeCalculator } from './ChangeCalculator';
import { CreditCard } from 'lucide-react';

type PaymentPanelProps = {
  totalAmount: number;
  onPaymentSuccess: () => void;
  disabled?: boolean;
};

export default function PaymentPanel({
  totalAmount,
  onPaymentSuccess,
  disabled,
}: PaymentPanelProps) {

  return (
    <div className='w-full space-y-4 pt-4 animate-in fade-in'>
        <ChangeCalculator 
            totalAmount={totalAmount} 
            onPaymentSuccess={onPaymentSuccess} 
            disabled={disabled} 
        />
        <Button 
            size="lg" 
            variant="outline" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground" 
            onClick={onPaymentSuccess} 
            disabled={disabled}
        >
           <CreditCard className="mr-2 h-4 w-4" /> Pay with Card
        </Button>
    </div>
  );
}
