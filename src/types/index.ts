

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  "data-ai-hint"?: string;
  created_at: string;
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
export type BillProps = Omit<Bill, 'id' | 'created_at'> & { id?: string };


export type ReceiptSettings = {
  storeName: string;
  logoUrl?: string;
  address: string;
  phoneNumber: string;
  footerMessage: string;
}
