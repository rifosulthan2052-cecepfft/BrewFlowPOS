export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  "data-ai-hint"?: string;
  created_at: string;
  shop_id: string;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Fee = {
  name: string;
  amount: number;
  notes: string;
};

export type Member = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  shop_id: string;
};

export type Bill = {
  id: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total_fees: number;
  fees: Fee[];
  total: number;
  date: string;
  member_id?: string | null;
  created_at: string;
  shop_id: string;
}

export type OpenBill = Bill & {
  // OpenBill specific fields if any in future
};

export type CompletedOrder = Bill & {
  payment_method: 'cash' | 'card';
  cash_paid?: number | null;
  change_due?: number | null;
};

// For component props that might not have all fields from Supabase yet
export type BillProps = Omit<Bill, 'id' | 'created_at' | 'shop_id'> & { id?: string };


export type ReceiptSettings = {
  storeName: string;
  logoUrl?: string;
  address: string;
  phoneNumber: string;
  footerMessage: string;
}

export type StoreStatus = {
  id: number;
  shop_id: string;
  status: 'OPEN' | 'CLOSED';
  day_started_at: string;
};

export type Shop = {
  id: string;
  owner_id: string;
  created_at: string;
};

export type ShopMember = {
  shop_id: string;
  user_id: string;
  created_at: string;
  users?: {
    email?: string;
    raw_user_meta_data?: {
        full_name?: string;
        avatar_url?: string;
    }
  } | null
};
