export type MenuItem = {
  id: string;
  name: string;
  price: number;
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

export type OpenBill = {
  id: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalFees: number;
  fees: Fee[];
  total: number;
  date: string;
};
