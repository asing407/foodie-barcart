import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MenuSection } from "@/components/MenuSection";
import { Cart } from "@/components/Cart";
import { OrderHistory } from "@/components/OrderHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types";
import { Loader2 } from "lucide-react";
import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { QRCodeSection } from "@/components/qr/QRCodeSection";

const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category');
  
  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    category: item.category as "food" | "drinks",
    dietary_type: item.dietary_type as "veg" | "non-veg" | undefined,
    drink_type: item.drink_type as "alcoholic" | "non-alcoholic" | undefined
  }));
};

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: menuItems, isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading menu items. Please try again later.</p>
      </div>
    );
  }

  const foodItems = menuItems?.filter(item => item.category === "food") ?? [];
  const drinkItems = menuItems?.filter(item => item.category === "drinks") ?? [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Cart />
      
      <HeroCarousel />
      <QRCodeSection />

      <main className="container mx-auto px-4 py-8">
        <MenuSection title="Food Menu" items={foodItems} type="food" />
        <MenuSection title="Drinks Menu" items={drinkItems} type="drinks" />
        <div className="mt-16">
          <OrderHistory />
        </div>
      </main>

      <footer className="bg-primary text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 The Alchemy Bar & Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
