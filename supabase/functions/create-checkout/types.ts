export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at?: string;
}

export interface OrderItem {
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
}