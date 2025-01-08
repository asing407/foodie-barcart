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
import { Loader2, QrCode } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const restaurantImages = [
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    alt: "Elegant dining area with warm lighting",
  },
  {
    url: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    alt: "Modern restaurant interior",
  },
  {
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
    alt: "Luxurious bar setup",
  },
  {
    url: "https://images.unsplash.com/photo-1559329007-40df8a9345d8",
    alt: "Private dining experience",
  },
];

const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category');
  
  if (error) throw error;
  
  return data.map(item => {
    if (item.category !== "food" && item.category !== "drinks") {
      throw new Error(`Invalid category: ${item.category}`);
    }
    return {
      ...item,
      category: item.category as "food" | "drinks"
    };
  });
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
      
      {/* Hero Section with Carousel */}
      <div className="relative h-[80vh]">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {restaurantImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative h-full">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50">
                    <div className="flex flex-col items-center justify-center h-full text-white space-y-4 p-4">
                      <h1 className="text-4xl md:text-6xl font-bold text-center">
                        Welcome to Bistro & Bar
                      </h1>
                      <p className="text-xl md:text-2xl max-w-2xl mx-auto text-center">
                        Experience fine dining and crafted cocktails in an elegant atmosphere
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* QR Code Section */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Quick Access Menu</h2>
              <p className="text-lg text-gray-600 max-w-md">
                Scan the QR code with your phone to instantly access our menu and place orders from your table.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <QrCode className="w-32 h-32" />
              <p className="mt-4 text-sm text-gray-500">Scan to view menu</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <MenuSection title="Food Menu" items={foodItems} />
        <MenuSection title="Drinks Menu" items={drinkItems} />
        <div className="mt-16">
          <OrderHistory />
        </div>
      </main>

      <footer className="bg-primary text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 Bistro & Bar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;