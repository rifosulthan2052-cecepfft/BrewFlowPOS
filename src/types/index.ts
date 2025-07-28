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
