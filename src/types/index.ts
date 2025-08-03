
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  "data-ai-hint": string;
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
  id: string; // MBR-YYYYMMDD-XXX
  name?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  transactionIds: string[];
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
  memberId?: string;
}

export type OpenBill = Bill & {
  // OpenBill specific fields if any in future
};

export type CompletedOrder = Bill & {
  paymentMethod: 'cash' | 'card';
};
