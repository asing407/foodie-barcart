import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Cart = () => {
  const { isOpen, toggleCart, items, updateQuantity, removeFromCart, total } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to checkout",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { cartItems: items },
      });
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg bg-white">
        <SheetHeader>
          <SheetTitle className="text-primary">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 cart-item bg-muted rounded-lg p-4">
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
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-500">Your cart is empty</p>
          )}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-medium text-primary">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};