
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
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalFees: number;
  fees: Fee[];
  total: number;
  date: string;
  member_id?: string;
  created_at: string;
}

export type OpenBill = Bill & {
  // OpenBill specific fields if any in future
};

export type CompletedOrder = Bill & {
  paymentMethod: 'cash' | 'card';
  cash_paid?: number;
  change_due?: number;
};

// For component props that might not have all fields from Supabase yet
export type BillProps = Omit<Bill, 'id' | 'created_at'> & { id?: string };
