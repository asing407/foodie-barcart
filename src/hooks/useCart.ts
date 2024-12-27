import { create } from "zustand";
import { MenuItem } from "@/types";

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  total: number;
  totalItems: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addToCart: (item: MenuItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeFromCart: (id: string) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  updateQuantity: (id: string, quantity: number) =>
    set((state) => ({
      items: quantity === 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  total: 0,
  totalItems: 0,
}));

// Calculate total and totalItems whenever items change
useCart.subscribe((state) => {
  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  useCart.setState({ total, totalItems });
});