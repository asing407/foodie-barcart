export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface StatusUpdate {
  id: string;
  order_id: string;
  status: string;
  notes: string | null;
  created_at: string;
}