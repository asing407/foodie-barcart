import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "./cart/CartItem";
import { Loader2 } from "lucide-react";

export const Cart = () => {
  const { isOpen, toggleCart, items, updateQuantity, removeFromCart, total } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

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

      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      console.log('Sending checkout request with items:', formattedItems);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { cartItems: formattedItems }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Received checkout URL:', data.url);
      window.location.href = data.url;

    } catch (error: any) {
      console.error('Error during checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg bg-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-primary">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-8">
          <div className="space-y-4 pr-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
            {items.length === 0 && (
              <p className="text-center text-gray-500">Your cart is empty</p>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="flex justify-between text-lg font-medium text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Checkout"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};