
'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { OrderItem, Fee, MenuItem, OpenBill, CompletedOrder, Member } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type Currency = 'USD' | 'IDR';

type ReceiptSettings = {
    storeName: string;
    logoUrl?: string;
    address: string;
    phoneNumber: string;
    footerMessage: string;
}

type StoreStatus = 'OPEN' | 'CLOSED';

type PaymentDetails = {
  method: 'cash' | 'card';
  cash_paid?: number;
  change_due?: number;
}

type AppContextType = {
  isLoading: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  taxRate: number;
  setTaxRate: (taxRate: number) => void;
  formatCurrency: (amount: number) => string;

  receiptSettings: ReceiptSettings;
  setReceiptSettings: (settings: ReceiptSettings) => void;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;

  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'created_at'>) => Promise<Member | null>;
  getMemberById: (id: string) => Member | undefined;
  getMemberByLookup: (lookup: string) => Member | undefined;

  orderItems: OrderItem[];
  fees: Fee[];
  customerName: string;
  memberId?: string;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  openBills: OpenBill[];
  editingBillId: string | null;

  completedOrders: CompletedOrder[];
  lastCompletedOrder: CompletedOrder | null;

  storeStatus: StoreStatus;

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
  loadOrderFromBill: (bill: Partial<OpenBill>) => void;
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

  addOrderToHistory: (paymentDetails: PaymentDetails) => void;
  endDay: () => void;
  startNewDay: () => void;

  subtotal: number;
  totalFees: number;
  tax: number;
  total: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [taxRate, setTaxRate] = useState<number>(0.11); // Default 11%
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
      storeName: 'BrewFlow',
      address: '123 Coffee Lane, Brewville, CA 90210',
      phoneNumber: '(555) 123-4567',
      footerMessage: 'Thank you for your visit!',
      logoUrl: '',
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [openBills, setOpenBills] = useState<OpenBill[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [memberId, setMemberId] = useState<string | undefined>();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CompletedOrder | null>(null);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('OPEN');
  const [unsavedOrder, setUnsavedOrder] = useState({ items: [] as OrderItem[], customerName: '', fees: [] as Fee[], memberId: undefined as string | undefined });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [menuItemsRes, membersRes, openBillsRes, completedOrdersRes] = await Promise.all([
            supabase.from('menu_items').select('*').order('name'),
            supabase.from('members').select('*'),
            supabase.from('open_bills').select('*'),
            supabase.from('completed_orders').select('*').limit(100).order('date', { ascending: false }) // Fetch for the day
        ]);

        if (menuItemsRes.error) throw menuItemsRes.error;
        if (membersRes.error) throw membersRes.error;
        if (openBillsRes.error) throw openBillsRes.error;
        if (completedOrdersRes.error) throw completedOrdersRes.error;

        setMenuItems(menuItemsRes.data || []);
        setMembers(membersRes.data || []);
        setOpenBills(openBillsRes.data || []);
        setCompletedOrders(completedOrdersRes.data || []);

    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error fetching data", description: error.message });
    } finally {
        setTimeout(() => setIsLoading(false), 500); // Simulate loading
    }
  }, [toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (!editingBillId) {
        setUnsavedOrder({ items: orderItems, customerName: customerName, fees, memberId: memberId });
    }
  }, [orderItems, customerName, fees, memberId, editingBillId]);

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('menu_items').insert([item]).select().single();
    if (error) {
        toast({ variant: 'destructive', title: 'Error adding item', description: error.message });
    } else if (data) {
        setMenuItems(prev => [...prev, data]);
        toast({ title: 'Menu item added' });
    }
  };
  
  const updateMenuItem = async (item: MenuItem) => {
    const { data, error } = await supabase.from('menu_items').update(item).eq('id', item.id).select().single();
     if (error) {
        toast({ variant: 'destructive', title: 'Error updating item', description: error.message });
    } else if (data) {
        setMenuItems(prev => prev.map(i => i.id === item.id ? data : i));
        toast({ title: 'Menu item updated' });
    }
  };
  
  const removeMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
        toast({ variant: 'destructive', title: 'Error removing item', description: error.message });
    } else {
        setMenuItems(prev => prev.filter(i => i.id !== id));
        toast({ title: 'Menu item removed' });
    }
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'created_at'>): Promise<Member | null> => {
    const { data, error } = await supabase.from('members').insert([memberData]).select().single();
    if (error) {
        toast({ variant: 'destructive', title: 'Error adding member', description: error.message });
        return null;
    } else if (data) {
        setMembers(prev => [...prev, data]);
        toast({ title: 'Member added' });
        return data;
    }
    return null;
  };

  const getMemberById = (id: string) => {
    return members.find(m => m.id === id);
  }
  
  const getMemberByLookup = (lookup: string) => {
    return members.find(m => 
        m.id.toLowerCase() === lookup.toLowerCase() ||
        (m.email && m.email.toLowerCase() === lookup.toLowerCase()) ||
        (m.phone && m.phone === lookup)
    );
  };

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
      removeItemFromOrder(menuItemId);
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
    const total_fees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + total_fees + tax;
    return { subtotal, totalFees: total_fees, tax, total };
  }, [orderItems, fees, taxRate]);

  const addOrderToHistory = async (paymentDetails: PaymentDetails) => {
    const newCompletedOrder = {
      customer_name: customerName || 'Walk-in Customer',
      items: orderItems,
      subtotal,
      tax,
      total_fees: totalFees,
      fees,
      total,
      date: new Date().toISOString(),
      payment_method: paymentDetails.method,
      cash_paid: paymentDetails.cash_paid,
      change_due: paymentDetails.change_due,
      member_id: memberId,
    };
    
    const { data, error } = await supabase.from('completed_orders').insert([newCompletedOrder]).select().single();

    if (error) {
        toast({ variant: 'destructive', title: 'Error completing order', description: error.message });
    } else if(data) {
        setCompletedOrders(prev => [data, ...prev]);
        setLastCompletedOrder(data);
        setOrderStatus('paid');
        if (editingBillId) {
            await removeOpenBill(editingBillId);
        }
    }
  }

  const saveAsOpenBill = async () => {
    const billPayload = {
      customer_name: customerName || `Bill ${Date.now()}`,
      items: orderItems,
      subtotal,
      tax,
      total_fees: totalFees,
      fees,
      total,
      date: new Date().toISOString(),
      member_id: memberId,
    };

    if (editingBillId) {
        // Update existing bill
        const {data, error} = await supabase.from('open_bills').update(billPayload).eq('id', editingBillId).select().single();
        if (error) {
             toast({ variant: 'destructive', title: 'Error updating bill', description: error.message });
        } else if (data) {
            setOpenBills(prev => prev.map(b => b.id === editingBillId ? data : b));
            toast({ title: 'Bill updated' });
        }
    } else {
        // Create new bill
        const { data, error } = await supabase.from('open_bills').insert([billPayload]).select().single();
        if (error) {
             toast({ variant: 'destructive', title: 'Error saving bill', description: error.message });
        } else if (data) {
            setOpenBills(prev => [...prev, data]);
            toast({ title: 'Bill saved' });
        }
    }
  };

  const loadOrderFromBill = (bill: Partial<OpenBill>) => {
    setOrderItems(bill.items || []);
    setFees(bill.fees || []);
    setCustomerName(bill.customer_name || '');
    setMemberId(bill.member_id);
    setOrderStatus(bill.id ? 'open_bill' : 'pending');
    setEditingBillId(bill.id || null);
  };

  const removeOpenBill = async (billId: string) => {
    const { error } = await supabase.from('open_bills').delete().eq('id', billId);
    if (error) {
        toast({ variant: 'destructive', title: 'Error removing bill', description: error.message });
    } else {
        setOpenBills(prev => prev.filter(b => b.id !== billId));
        // No toast, often part of another action
    }
  };
  
  const endDay = () => {
    setStoreStatus('CLOSED');
  }

  const startNewDay = async () => {
    // In a real app, you might archive old orders, but here we'll just clear them from state.
    // The data remains in Supabase.
    setCompletedOrders([]);
    setStoreStatus('OPEN');
    // Optionally re-fetch today's data in case the app was open overnight
    await fetchData();
  }

  const activeOrderExists = useMemo(() => {
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
    isLoading,
    currency,
    setCurrency,
    taxRate,
    setTaxRate,
    formatCurrency,
    receiptSettings,
    setReceiptSettings,
    menuItems,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    members,
    addMember,
    getMemberById,
    getMemberByLookup,
    orderItems,
    fees,
    customerName: customerName,
    memberId: memberId,
    orderStatus,
    openBills,
    editingBillId,
    completedOrders,
    lastCompletedOrder,
    storeStatus,
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
    endDay,
    startNewDay,
    subtotal,
    totalFees,
    tax,
    total
  }), [isLoading, currency, taxRate, receiptSettings, menuItems, members, orderItems, fees, customerName, memberId, orderStatus, openBills, editingBillId, completedOrders, lastCompletedOrder, storeStatus, subtotal, totalFees, tax, total, activeOrderExists, unsavedOrder, addMember, getMemberById, getMemberByLookup, fetchData, toast]);

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
