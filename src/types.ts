export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "food" | "drinks";
  created_at?: string;
  dietary_type?: "veg" | "non-veg";
  drink_type?: "alcoholic" | "non-alcoholic";
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

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

export interface Receipt {
  id: string;
  order_id: string;
  file_path: string;
  created_at: string;
}

export interface StatusUpdate {
  id: string;
  order_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  payment_status: "pending" | "success" | "failed";
}