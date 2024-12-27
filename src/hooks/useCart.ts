import { create } from "zustand";
import { MenuItem } from "@/types";

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  totalItems: number;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  total: 0,
  totalItems: 0,
  addToCart: (item: MenuItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      const newItems = existingItem
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { ...item, quantity: 1 }];
      
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        items: newItems,
        total: newTotal,
        totalItems: newTotalItems
      };
    }),
  removeFromCart: (id: string) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        items: newItems,
        total: newTotal,
        totalItems: newTotalItems
      };
    }),
  updateQuantity: (id: string, quantity: number) =>
    set((state) => {
      const newItems = quantity === 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
      
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        items: newItems,
        total: newTotal,
        totalItems: newTotalItems
      };
    }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));