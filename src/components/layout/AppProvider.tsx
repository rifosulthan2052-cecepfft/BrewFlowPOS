
'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { OrderItem, Fee, MenuItem, OpenBill, CompletedOrder, Bill, Member } from '@/types';

type Currency = 'USD' | 'IDR';

const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 35000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "espresso coffee", category: 'Coffee' },
  { id: '2', name: 'Latte', price: 45000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "latte coffee", category: 'Coffee' },
  { id: '3', name: 'Cappuccino', price: 42000, imageUrl: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYXBwdWNpbm98ZW58MHx8fHwxNzUzNzQwNDYwfDA&ixlib=rb-4.1.0&q=80&w=1080', "data-ai-hint": "cappuccino coffee", category: 'Coffee' },
  { id: '4', name: 'Americano', price: 38000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "americano coffee", category: 'Coffee' },
  { id: '5', name: 'Mocha', price: 50000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "mocha coffee", category: 'Coffee' },
  { id: '6', name: 'Macchiato', price: 40000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "macchiato coffee", category: 'Coffee' },
  { id: '7', name: 'Drip Coffee', price: 32000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "drip coffee", category: 'Coffee' },
  { id: '8', name: 'Croissant', price: 25000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "croissant pastry", category: 'Pastry' },
  { id: '9', name: 'Muffin', price: 22000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "muffin pastry", category: 'Pastry' },
  { id: '10', name: 'Scone', price: 28000, imageUrl: 'https://placehold.co/150x150.png', "data-ai-hint": "scone pastry", category: 'Pastry' },
];

type AppContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  taxRate: number;
  setTaxRate: (taxRate: number) => void;
  formatCurrency: (amount: number) => string;

  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;

  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'transactionIds'>) => Member;
  getMemberById: (id: string) => Member | undefined;

  orderItems: OrderItem[];
  fees: Fee[];
  customerName: string;
  memberId?: string;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  openBills: OpenBill[];
  editingBillId: string | null;

  completedOrders: CompletedOrder[];
  lastCompletedOrder: CompletedOrder | null;

  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
  setCustomerName: React.Dispatch<React.SetStateAction<string>>;
  setMemberId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setOrderStatus: React.Dispatch<React.SetStateAction<'pending' | 'paid' | 'open_bill'>>;
  
  addItemToOrder: (item: MenuItem) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  removeItemFromOrder: (menuItemId: string) => void;
  addFeeToOrder: (fee: Fee) => void;
  resetOrder: () => void;
  saveAsOpenBill: () => void;
  loadOrderFromBill: (bill: OpenBill) => void;
  removeOpenBill: (billId: string) => void;
  setEditingBillId: (billId: string | null) => void;
  activeOrderExists: boolean;
  
  unsavedOrder: {
    items: OrderItem[];
    customerName: string;
    fees: Fee[];
    memberId?: string;
  },
  setUnsavedOrder: React.Dispatch<React.SetStateAction<{
    items: OrderItem[];
    customerName: string;
    fees: Fee[];
    memberId?: string;
  }>>

  addOrderToHistory: (paymentMethod: 'cash' | 'card') => void;

  subtotal: number;
  totalFees: number;
  tax: number;
  total: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [taxRate, setTaxRate] = useState<number>(0);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [members, setMembers] = useState<Member[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [memberId, setMemberId] = useState<string | undefined>();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');
  const [openBills, setOpenBills] = useState<OpenBill[]>([]);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CompletedOrder | null>(null);

  // Separate state for a potentially unsaved order
  const [unsavedOrder, setUnsavedOrder] = useState({ items: [] as OrderItem[], customerName: '', fees: [] as Fee[], memberId: undefined as string | undefined });

  useEffect(() => {
    // If there's no bill being edited, we update the unsaved order state
    if (!editingBillId) {
        setUnsavedOrder({ items: orderItems, customerName, fees, memberId });
    }
  }, [orderItems, customerName, fees, memberId, editingBillId]);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  }
  
  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
  }
  
  const removeMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== id));
  }

  const addMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'transactionIds'>): Member => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const newMember: Member = {
        ...memberData,
        id: `MBR-${datePart}-${randomPart}`,
        createdAt: now.toISOString(),
        transactionIds: []
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const getMemberById = (id: string) => {
    return members.find(m => m.id === id);
  }

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
    setMemberId(undefined);
    setOrderStatus('pending');
    setEditingBillId(null);
    setLastCompletedOrder(null);
  }

  const { subtotal, totalFees, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + totalFees + tax;
    return { subtotal, totalFees, tax, total };
  }, [orderItems, fees, taxRate]);

  const addOrderToHistory = (paymentMethod: 'cash' | 'card') => {
    const orderId = `order-${Date.now()}`;
    const newCompletedOrder: CompletedOrder = {
      id: orderId,
      customerName: customerName || 'Walk-in Customer',
      items: orderItems,
      subtotal,
      tax,
      totalFees,
      fees,
      total,
      date: new Date().toISOString(),
      paymentMethod,
      memberId,
    };
    setCompletedOrders(prev => [newCompletedOrder, ...prev]);
    setLastCompletedOrder(newCompletedOrder);
    setOrderStatus('paid');

    if (memberId) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, transactionIds: [...m.transactionIds, orderId] } : m));
    }
  }

  const saveAsOpenBill = () => {
    const billId = editingBillId || `bill-${Date.now()}`;
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
      memberId,
    };
    
    setOpenBills(prev => {
        const existingBillIndex = prev.findIndex(b => b.id === billId);
        if (existingBillIndex > -1) {
            const newBills = [...prev];
            newBills[existingBillIndex] = newOpenBill;
            return newBills;
        }
        return [...prev, newOpenBill]
    });

    if (memberId) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, transactionIds: [...m.transactionIds, billId] } : m));
    }
    resetOrder();
  };

  const loadOrderFromBill = (bill: OpenBill) => {
    setOrderItems(bill.items);
    setFees(bill.fees);
    setCustomerName(bill.customerName);
    setMemberId(bill.memberId);
    setOrderStatus('open_bill');
    setEditingBillId(bill.id);
  };

  const removeOpenBill = (billId: string) => {
    setOpenBills(prev => prev.filter(b => b.id !== billId));
  };

  const activeOrderExists = useMemo(() => {
    // An active order exists if there are items, a customer name, or fees,
    // AND it's not associated with a bill being edited.
    return (unsavedOrder.items.length > 0 || unsavedOrder.customerName !== '' || unsavedOrder.fees.length > 0);
  }, [unsavedOrder]);


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
    menuItems,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    members,
    addMember,
    getMemberById,
    orderItems,
    fees,
    customerName,
    memberId,
    orderStatus,
    openBills,
    editingBillId,
    completedOrders,
    lastCompletedOrder,
    setOrderItems,
    setFees,
    setCustomerName,
    setMemberId,
    setOrderStatus,
    addItemToOrder,
    updateItemQuantity,
    removeItemFromOrder,
    addFeeToOrder,
    resetOrder,
    saveAsOpenBill,
    loadOrderFromBill,
    removeOpenBill,
    setEditingBillId,
    activeOrderExists,
    unsavedOrder,
    setUnsavedOrder,
    addOrderToHistory,
    subtotal,
    totalFees,
    tax,
    total
  }), [currency, taxRate, menuItems, members, orderItems, fees, customerName, memberId, orderStatus, openBills, editingBillId, completedOrders, lastCompletedOrder, subtotal, totalFees, tax, total, activeOrderExists, unsavedOrder]);

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
