

'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { OrderItem, Fee, MenuItem, OpenBill, CompletedOrder, Member, ReceiptSettings, StoreStatus, Shop, ShopMember } from '@/types';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { inviteUser } from '@/lib/actions';

type Currency = 'USD' | 'IDR';

type PaymentDetails = {
  method: 'cash' | 'card';
  cash_paid?: number;
  change_due?: number;
}

type AppContextType = {
  isLoading: boolean;
  shop: Shop | null;
  shopMembers: ShopMember[];
  inviteMember: (email: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  isShopOwner: boolean;

  currency: Currency;
  taxRate: number;
  receiptSettings: ReceiptSettings;
  updateStoreSettings: (settings: {
    receiptSettings: ReceiptSettings;
    taxRate: number;
    currency: Currency;
  }) => Promise<void>;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'shop_id'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  removeMenuItem: (id: string) => Promise<void>;

  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'shop_id'>) => Promise<Member | null>;
  getMemberById: (id: string) => Member | undefined;
  getMemberByLookup: (lookup: string) => Member | undefined;

  orderItems: OrderItem[];
  fees: Fee[];
  customer_name: string;
  member_id?: string;
  orderStatus: 'pending' | 'paid' | 'open_bill';
  openBills: OpenBill[];
  editingBillId: string | null;

  completedOrders: CompletedOrder[];
  allCompletedOrders: CompletedOrder[];
  lastCompletedOrder: CompletedOrder | null;

  storeStatus: StoreStatus | null;

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
  removeOpenBill: (billId: string) => Promise<void>;
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

  uploadImage: (file: File, bucket: 'menu-images' | 'logos') => Promise<string | null>;
  removeImage: (imageUrl: string, bucket: 'menu-images' | 'logos') => Promise<void>;
  addOrderToHistory: (paymentDetails: PaymentDetails) => Promise<void>;
  endDay: () => Promise<void>;
  startNewDay: () => Promise<void>;

  subtotal: number;
  total_fees: number;
  tax: number;
  total: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(true);

  // New shop state
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopMembers, setShopMembers] = useState<ShopMember[]>([]);
  
  // Settings state with defaults
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [taxRate, setTaxRate] = useState<number>(0.11);
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
  const [allCompletedOrders, setAllCompletedOrders] = useState<CompletedOrder[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [customer_name, setCustomerName] = useState('');
  const [member_id, setMemberId] = useState<string | undefined>();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'open_bill'>('pending');
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CompletedOrder | null>(null);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [unsavedOrder, setUnsavedOrder] = useState({ items: [] as OrderItem[], customerName: '', fees: [] as Fee[], memberId: undefined as string | undefined });
  
  const isShopOwner = useMemo(() => shop?.owner_id === user?.id, [shop, user]);

  const fetchData = useCallback(async () => {
    if (authLoading || !user) {
      if (!authLoading) setIsLoading(false);
      return;
    };

    setIsLoading(true);

    try {
      const { data: memberEntries, error: memberError } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user.id)
        .limit(1);
        
      if (memberError) throw memberError;

      let currentShopId: string | null = null;
      if (memberEntries && memberEntries.length > 0) {
          currentShopId = memberEntries[0].shop_id
      } else {
        const { data: shopData, error: shopError } = await supabase.from('shops').insert({ owner_id: user.id }).select().single();
        if (shopError) throw shopError;
        
        const { error: newMemberError } = await supabase.from('shop_members').insert({ shop_id: shopData.id, user_id: user.id });
        if(newMemberError) throw newMemberError;
        currentShopId = shopData.id;
      }
      
      if (!currentShopId) {
          throw new Error("Could not establish shop context for the user.");
      }

      const { data: currentShopData, error: shopDetailsError } = await supabase.from('shops').select('*').eq('id', currentShopId).single();
      if(shopDetailsError) throw shopDetailsError;
      setShop(currentShopData);
        
        let currentStoreStatus: StoreStatus;
        const statusRes = await supabase.from('store_status').select('*').eq('shop_id', currentShopId).single();
        if (statusRes.error && statusRes.error.code !== 'PGRST116') throw statusRes.error;
        if (statusRes.data) {
            currentStoreStatus = statusRes.data;
            setStoreStatus(statusRes.data);
        } else {
            const { data, error } = await supabase.from('store_status').insert({ shop_id: currentShopId, status: 'OPEN' }).select().single();
            if (error) throw error;
            currentStoreStatus = data!;
            setStoreStatus(data!);
        }

        const { data: shopMembersData, error: shopMembersError } = await supabase.rpc('get_shop_members', { p_shop_id: currentShopId });
        if (shopMembersError) throw shopMembersError;
        setShopMembers(shopMembersData as ShopMember[] || []);

        const fetchPromises = [
            supabase.from('menu_items').select('*').eq('shop_id', currentShopId).order('name'),
            supabase.from('members').select('*').eq('shop_id', currentShopId),
            supabase.from('open_bills').select('*').eq('shop_id', currentShopId),
            supabase.from('store_settings').select('*').eq('shop_id', currentShopId).single(),
            supabase.from('completed_orders').select('*').eq('shop_id', currentShopId).order('date', { ascending: false }),
        ];
        
        const [menuItemsRes, membersRes, openBillsRes, settingsRes, allCompletedOrdersRes] = await Promise.all(fetchPromises);

        if (menuItemsRes.error) throw menuItemsRes.error;
        setMenuItems(menuItemsRes.data as MenuItem[] || []);

        if (membersRes.error) throw membersRes.error;
        setMembers(membersRes.data as Member[] || []);
        
        if (openBillsRes.error) throw openBillsRes.error;
        setOpenBills(openBillsRes.data as OpenBill[] || []);
        
        if (allCompletedOrdersRes.error) throw allCompletedOrdersRes.error;
        const allOrders = allCompletedOrdersRes.data as CompletedOrder[] || [];
        setAllCompletedOrders(allOrders);
        if(currentStoreStatus?.day_started_at) {
            const dailyOrders = allOrders.filter(order => new Date(order.created_at) >= new Date(currentStoreStatus.day_started_at));
            setCompletedOrders(dailyOrders);
        } else {
            setCompletedOrders([]);
        }

        if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;
        if (settingsRes.data) {
            setReceiptSettings({
                storeName: settingsRes.data.store_name,
                address: settingsRes.data.address,
                phoneNumber: settingsRes.data.phone_number,
                footerMessage: settingsRes.data.footer_message,
                logoUrl: settingsRes.data.logo_url || '',
            });
            setTaxRate(settingsRes.data.tax_rate);
            setCurrency(settingsRes.data.currency as Currency);
        } else {
             const defaultSettings = {
              shop_id: currentShopId,
              store_name: 'BrewFlow',
              address: '123 Coffee Lane, Brewville, CA 90210',
              phone_number: '(555) 123-4567',
              footer_message: 'Thank you for your visit!',
              tax_rate: 0.11,
              currency: 'IDR' as Currency,
              logo_url: ''
            };
            const { data, error } = await supabase.from('store_settings').insert(defaultSettings).select().single();
            if (error) throw error;
            if (data) {
                 setReceiptSettings({
                    storeName: data.store_name,
                    address: data.address,
                    phoneNumber: data.phone_number,
                    footerMessage: data.footer_message,
                    logoUrl: data.logo_url || '',
                });
                setTaxRate(data.tax_rate);
                setCurrency(data.currency as Currency);
            }
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error initializing app", description: error.message });
        console.error(error);
    } finally {
        setTimeout(() => setIsLoading(false), 500);
    }
  }, [toast, supabase, user, authLoading]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (!editingBillId) {
        setUnsavedOrder({ items: orderItems, customerName: customer_name, fees, memberId: member_id });
    }
  }, [orderItems, customer_name, fees, member_id, editingBillId]);

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at'| 'shop_id'>) => {
    if(!shop) return;
    const { data, error } = await supabase.from('menu_items').insert([{ ...item, shop_id: shop.id }]).select().single();
    if (error) {
        toast({ variant: 'destructive', title: 'Error adding item', description: error.message });
    } else if (data) {
        setMenuItems(prev => [...prev, data as MenuItem]);
        toast({ title: 'Menu item added' });
    }
  };
  
  const updateMenuItem = async (item: MenuItem) => {
    const oldItem = menuItems.find(i => i.id === item.id);
    const oldImageUrl = oldItem?.image_url;

    const { data, error } = await supabase.from('menu_items').update(item).eq('id', item.id).select().single();
     if (error) {
        toast({ variant: 'destructive', title: 'Error updating item', description: error.message });
    } else if (data) {
        setMenuItems(prev => prev.map(i => i.id === item.id ? data as MenuItem : i));
        toast({ title: 'Menu item updated' });

        if (oldImageUrl && oldImageUrl !== data.image_url) {
            await removeImage(oldImageUrl, 'menu-images');
        }
    }
  };
  
  const removeMenuItem = async (id: string) => {
    const itemToDelete = menuItems.find(i => i.id === id);
    const imageUrlToDelete = itemToDelete?.image_url;

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
        toast({ variant: 'destructive', title: 'Error removing item', description: error.message });
    } else {
        setMenuItems(prev => prev.filter(i => i.id !== id));
        toast({ title: 'Menu item removed' });
        if (imageUrlToDelete) {
            await removeImage(imageUrlToDelete, 'menu-images');
        }
    }
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'created_at' | 'shop_id'>): Promise<Member | null> => {
    if(!shop) return null;
    
    // Convert empty string email to null to avoid unique constraint violations
    const payload = {
      ...memberData,
      email: memberData.email === '' ? null : memberData.email,
      shop_id: shop.id
    };

    const { data, error } = await supabase.from('members').insert([payload]).select().single();
    
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

  const addItemToOrder = (menuItem: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === menuItem.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { 
          menuItemId: menuItem.id, 
          name: menuItem.name,
          price: menuItem.price, 
          quantity: 1 
      }];
    });
  };

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(menuItemId);
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity }
            : i
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

  const { subtotal, total_fees, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total_fees_calc = fees.reduce((acc, fee) => acc + fee.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + total_fees_calc + tax;
    return { subtotal, total_fees: total_fees_calc, tax, total };
  }, [orderItems, fees, taxRate]);

  const addOrderToHistory = async (paymentDetails: PaymentDetails) => {
    if (!shop) return;
    const newCompletedOrder: Omit<CompletedOrder, 'id' | 'created_at' | 'shop_id'> & { shop_id: string } = {
      shop_id: shop.id,
      customer_name: customer_name || 'Walk-in Customer',
      items: orderItems,
      subtotal,
      tax,
      total_fees,
      fees,
      total,
      date: new Date().toISOString(),
      payment_method: paymentDetails.method,
      cash_paid: paymentDetails.cash_paid,
      change_due: paymentDetails.change_due,
      member_id,
    };
    
    const { data, error } = await supabase.from('completed_orders').insert([newCompletedOrder]).select().single();

    if (error) {
        toast({ variant: 'destructive', title: 'Error completing order', description: error.message });
    } else if(data) {
        const newOrder = data as CompletedOrder;
        setAllCompletedOrders(prev => [newOrder, ...prev]);
        setCompletedOrders(prev => [newOrder, ...prev]);
        setLastCompletedOrder(newOrder);
        setOrderStatus('paid');
        if (editingBillId) {
            await removeOpenBill(editingBillId);
        }
    }
  }

  const saveAsOpenBill = async () => {
    if (!shop) return;
    const billPayload: Omit<OpenBill, 'id' | 'created_at'> = {
      shop_id: shop.id,
      customer_name: customer_name || `Bill ${Date.now()}`,
      items: orderItems,
      subtotal,
      tax,
      total_fees,
      fees,
      total,
      date: new Date().toISOString(),
      member_id,
    };

    if (editingBillId) {
        // Update existing bill
        const {data, error} = await supabase.from('open_bills').update(billPayload).eq('id', editingBillId).select().single();
        if (error) {
             toast({ variant: 'destructive', title: 'Error updating bill', description: error.message });
        } else if (data) {
            setOpenBills(prev => prev.map(b => b.id === editingBillId ? data as OpenBill : b));
            toast({ title: 'Bill updated' });
        }
    } else {
        // Create new bill
        const { data, error } = await supabase.from('open_bills').insert([billPayload]).select().single();
        if (error) {
             toast({ variant: 'destructive', title: 'Error saving bill', description: error.message });
        } else if (data) {
            setOpenBills(prev => [...prev, data as OpenBill]);
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
  
  const endDay = async () => {
    if(!shop) return;
    const { data, error } = await supabase.from('store_status')
        .update({ status: 'CLOSED' })
        .eq('shop_id', shop.id)
        .select()
        .single();
    if(error) {
        toast({ variant: 'destructive', title: 'Error ending day', description: error.message });
    } else {
        setStoreStatus(data);
    }
  }

  const startNewDay = async () => {
    if(!shop) return;
    const { data, error } = await supabase.from('store_status')
        .update({ status: 'OPEN', day_started_at: new Date().toISOString() })
        .eq('shop_id', shop.id)
        .select()
        .single();
    if(error) {
        toast({ variant: 'destructive', title: 'Error starting new day', description: error.message });
    } else if (data) {
        setStoreStatus(data);
        setCompletedOrders([]); // Clear local state immediately
    }
  }

  const activeOrderExists = useMemo(() => {
    return (unsavedOrder.items.length > 0 || unsavedOrder.customerName !== '' || unsavedOrder.fees.length > 0);
  }, [unsavedOrder]);

  const uploadImage = async (file: File, bucket: 'menu-images' | 'logos'): Promise<string | null> => {
    try {
      if (!shop) throw new Error("Shop context not available.");
      const fileExt = file.name.split('.').pop();
      const fileName = `${shop.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);

      if (error) {
        throw error;
      }
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

      if (!data.publicUrl) {
          throw new Error("No public URL returned from Supabase.");
      }
      
      return data.publicUrl;

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Image Upload Failed', description: error.message });
        return null;
    }
  }

  const removeImage = async (imageUrl: string, bucket: 'menu-images' | 'logos'): Promise<void> => {
      if (!imageUrl) return;
      try {
        const url = new URL(imageUrl);
        const path = url.pathname.split(`/${bucket}/`)[1];
        if (!path) {
            console.error("Could not determine file path from URL:", imageUrl);
            return;
        }
        
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) {
            // It's often okay to fail silently here, as it might be a new upload replacing a non-existent one
            console.warn("Could not delete old image:", error.message);
        }
      } catch(error: any) {
          console.error("Error parsing image URL for deletion:", error.message);
      }
  }

  const updateStoreSettings = async (settings: {
    receiptSettings: ReceiptSettings;
    taxRate: number;
    currency: Currency;
  }) => {
    if (!shop) {
        toast({ variant: 'destructive', title: 'Shop context not available' });
        return;
    }
      
    const oldLogoUrl = receiptSettings.logoUrl;
    
    // Update state immediately for responsiveness
    setReceiptSettings(settings.receiptSettings);
    setTaxRate(settings.taxRate);
    setCurrency(settings.currency);
    
    // Persist to Supabase
    const { error } = await supabase.from('store_settings').update({
        store_name: settings.receiptSettings.storeName,
        logo_url: settings.receiptSettings.logoUrl,
        address: settings.receiptSettings.address,
        phone_number: settings.receiptSettings.phoneNumber,
        footer_message: settings.receiptSettings.footerMessage,
        tax_rate: settings.taxRate,
        currency: settings.currency,
    }).eq('shop_id', shop.id);

    if (error) {
        toast({ variant: 'destructive', title: "Error saving settings", description: error.message });
        // Optionally revert state on error
    } else {
        toast({ title: "Settings saved" });
         if (oldLogoUrl && oldLogoUrl !== settings.receiptSettings.logoUrl) {
            await removeImage(oldLogoUrl, 'logos');
        }
    }
  };

  const inviteMember = async (email: string) => {
    if (!shop) return;
    const { error } = await inviteUser({ email, shop_id: shop.id });
    if (error) {
        toast({ variant: 'destructive', title: 'Error inviting member', description: error });
    } else {
        toast({ title: 'Invitation sent', description: `An invitation has been sent to ${email}.` });
        fetchData(); // Refresh shop members list
    }
  };

  const removeMember = async (userId: string) => {
    if (!shop) return;
    const { error } = await supabase.from('shop_members').delete().eq('shop_id', shop.id).eq('user_id', userId);
    if (error) {
        toast({ variant: 'destructive', title: 'Error removing member', description: error.message });
    } else {
        setShopMembers(prev => prev.filter(m => m.user_id !== userId));
        toast({ title: 'Member removed' });
    }
  };
  
  const value = useMemo(() => ({
    isLoading,
    shop,
    shopMembers,
    inviteMember,
    removeMember,
    isShopOwner,
    currency,
    taxRate,
    receiptSettings,
    updateStoreSettings,
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
    customer_name,
    member_id,
    orderStatus,
    openBills,
    editingBillId,
    completedOrders,
    allCompletedOrders,
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
    total_fees,
    tax,
    total,
    uploadImage,
    removeImage,
  }), [isLoading, shop, shopMembers, isShopOwner, currency, taxRate, receiptSettings, menuItems, members, orderItems, fees, customer_name, member_id, orderStatus, openBills, editingBillId, completedOrders, allCompletedOrders, lastCompletedOrder, storeStatus, subtotal, total_fees, tax, total, activeOrderExists, unsavedOrder, user, authLoading, fetchData, updateStoreSettings, addMenuItem, updateMenuItem, removeMenuItem, addMember, getMemberById, getMemberByLookup, addItemToOrder, updateItemQuantity, removeItemFromOrder, addFeeToOrder, resetOrder, saveAsOpenBill, loadOrderFromBill, removeOpenBill, setEditingBillId, setUnsavedOrder, addOrderToHistory, endDay, startNewDay, uploadImage, removeImage, inviteMember, removeMember]);

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
