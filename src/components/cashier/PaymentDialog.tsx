
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PaymentPanel from './PaymentPanel';

type PaymentDialogProps = {
  children: React.ReactNode;
  totalAmount: number;
  onPaymentSuccess: (paymentMethod: 'cash' | 'card') => void;
  disabled?: boolean;
};

export function PaymentDialog({ children, totalAmount, onPaymentSuccess, disabled = false }: PaymentDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Select a payment method to finalize the transaction.
          </DialogDescription>
        </DialogHeader>
        <PaymentPanel
          totalAmount={totalAmount}
          onPaymentSuccess={onPaymentSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
