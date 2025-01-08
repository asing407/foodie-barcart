import { MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";

interface CartItemProps {
  item: MenuItem & { quantity: number };
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
}

export const CartItem = ({ item, updateQuantity, removeFromCart }: CartItemProps) => (
  <div className="flex items-center gap-4 cart-item bg-muted rounded-lg p-4">
    <img
      src={item.image}
      alt={item.name}
      className="w-20 h-20 object-cover rounded"
    />
    <div className="flex-1">
      <h3 className="font-medium text-primary">{item.name}</h3>
      <p className="text-sm text-gray-600">${item.price}</p>
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white"
          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-primary">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => removeFromCart(item.id)}
      className="text-gray-500 hover:text-primary hover:bg-muted"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);