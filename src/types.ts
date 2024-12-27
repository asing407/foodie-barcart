export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "food" | "drinks";
  created_at?: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}