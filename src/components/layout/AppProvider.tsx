
'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { OrderItem, Fee, MenuItem, OpenBill } from '@/types';

type Currency = 'USD' | 'IDR';

type AppContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  taxRate: number;
  setTaxRate: (taxRate: number) => void;
  formatCurrency: (amount: number) => string;

  orderItems: OrderItem[];
  fees: Fee[];
  customerName: string;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  openBills: OpenBill[];

  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
  setCustomerName: React.Dispatch<React.SetStateAction<string>>;
  setOrderStatus: React.Dispatch<React.SetStateAction<'pending' | 'paid' | 'open_bill'>>;
  
  addItemToOrder: (item: MenuItem) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  removeItemFromOrder: (menuItemId: string) => void;
  addFeeToOrder: (fee: Fee) => void;
  resetOrder: () => void;
  saveAsOpenBill: () => void;
  loadOrderFromBill: (bill: OpenBill) => void;
  removeOpenBill: (billId: string) => void;

  subtotal: number;
  totalFees: number;
  tax: number;
  total: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [taxRate, setTaxRate] = useState<number>(0);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');
  const [openBills, setOpenBills] = useState<OpenBill[]>([]);

  const addItemToOrder = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        )
      );
    }
  };
  
  const removeItemFromOrder = (menuItemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const addFeeToOrder = (fee: Fee) => {
    setFees((prevFees) => [...prevFees, fee]);
  };

  const resetOrder = () => {
    setOrderItems([]);
    setFees([]);
    setCustomerName('');
    setOrderStatus('pending');
  }

  const { subtotal, totalFees, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + totalFees + tax;
    return { subtotal, totalFees, tax, total };
  }, [orderItems, fees, taxRate]);

  const saveAsOpenBill = () => {
    const billId = `bill-${Date.now()}`;
    const newOpenBill: OpenBill = {
      id: billId,
      customerName: customerName || `Bill ${billId}`,
      items: orderItems,
      subtotal,
      tax,
      totalFees,
      fees,
      total,
      date: new Date().toISOString(),
    };
    setOpenBills(prev => [...prev, newOpenBill]);
    resetOrder();
  };

  const loadOrderFromBill = (bill: OpenBill) => {
    setOrderItems(bill.items);
    setFees(bill.fees);
    setCustomerName(bill.customerName);
    setOrderStatus('open_bill');
  };

  const removeOpenBill = (billId: string) => {
    setOpenBills(prev => prev.filter(b => b.id !== billId));
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(amount);
  };
  
  const value = useMemo(() => ({
    currency,
    setCurrency,
    taxRate,
    setTaxRate,
    formatCurrency,
    orderItems,
    fees,
    customerName,
    orderStatus,
    openBills,
    setOrderItems,
    setFees,
    setCustomerName,
    setOrderStatus,
    addItemToOrder,
    updateItemQuantity,
    removeItemFromOrder,
    addFeeToOrder,
    resetOrder,
    saveAsOpenBill,
    loadOrderFromBill,
    removeOpenBill,
    subtotal,
    totalFees,
    tax,
    total
  }), [currency, taxRate, orderItems, fees, customerName, orderStatus, openBills, subtotal, totalFees, tax, total]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
