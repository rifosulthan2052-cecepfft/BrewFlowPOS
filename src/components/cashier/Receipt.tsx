
'use client';

import type { OrderItem, Fee } from '@/types';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { CoffeeIcon } from '../icons';
import { Printer } from 'lucide-react';
import React from 'react';
import { useApp } from '../layout/AppProvider';
import { formatCurrency } from '@/lib/utils';
import { DialogFooter } from '../ui/dialog';
import Image from 'next/image';

type ReceiptProps = {
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  fees: Fee[];
  total: number;
  memberId?: string;
};

const ReceiptToPrint = React.forwardRef<HTMLDivElement, Omit<ReceiptProps, 'showPrintButton'>>((props, ref) => {
    const { orderItems, subtotal, tax, fees, total, memberId } = props;
    const { currency, receiptSettings } = useApp();
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);

    return (
        <div ref={ref} id="receipt-to-print" className="p-4 text-sm bg-background text-foreground font-mono">
            <div className="text-center mb-4">
                 {receiptSettings.logoUrl ? (
                    <Image src={receiptSettings.logoUrl} alt="logo" width={80} height={80} className="mx-auto mb-2" />
                ) : (
                    <div className="flex justify-center items-center gap-2">
                        <CoffeeIcon className="h-6 w-6" />
                        <h2 className="text-xl font-bold">Brew Flow</h2>
                    </div>
                )}
                <p>{receiptSettings.address}</p>
                <p>Tel: {receiptSettings.phoneNumber}</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
            <Separator className="my-2" />
            <h3 className="text-center font-bold mb-2">RECEIPT</h3>
            {memberId && (
                <div className="text-center mb-2">
                    <p>Member ID: {memberId}</p>
                </div>
            )}
            <div className="space-y-1">
                {orderItems.map(item => (
                    <div key={item.menuItemId} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatCurrency(item.price * item.quantity, currency)}</span>
                    </div>
                ))}
            </div>
            <Separator className="my-2" />
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                 {fees.length > 0 && (
                    <div className="flex justify-between">
                        <span>Fees</span>
                        <span>{formatCurrency(totalFees, currency)}</span>
                    </div>
                 )}
                 <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax, currency)}</span>
                </div>
            </div>
            <Separator className="my-2" />
             <div className="flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span>{formatCurrency(total, currency)}</span>
            </div>
            <div className="text-center mt-4">
                <p>{receiptSettings.footerMessage}</p>
            </div>
        </div>
    );
});
ReceiptToPrint.displayName = 'ReceiptToPrint';


export default function Receipt({ orderItems, subtotal, tax, fees, total, memberId }: ReceiptProps) {
    const receiptRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (!printWindow) return;
            printWindow.document.write('<html><head><title>Print Receipt</title>');
             // A very basic styling for printing
            printWindow.document.write(`
                <style>
                    body { font-family: monospace; font-size: 14px; }
                    .receipt-container { width: 300px; margin: auto; }
                    .flex { display: flex; }
                    .justify-between { justify-content: space-between; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[70vh]">
             <div className="flex-1 min-h-0 border rounded-md">
                <ScrollArea className="h-full">
                    <ReceiptToPrint ref={receiptRef} {...{orderItems, subtotal, tax, fees, total, memberId}} />
                </ScrollArea>
             </div>
              <DialogFooter className="pt-4">
                <Button onClick={handlePrint} className="w-full">
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              </DialogFooter>
        </div>
    );
}
