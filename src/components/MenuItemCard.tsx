import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { MenuItem } from "@/types";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="menu-item-card bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif font-medium text-xl">{item.name}</h3>
          <span className="font-serif text-lg text-primary">${item.price}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </div>
  );
};