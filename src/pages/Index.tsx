import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MenuSection } from "@/components/MenuSection";
import { Cart } from "@/components/Cart";
import { menuItems } from "@/data/menu";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const foodItems = menuItems.filter(item => item.category === "food");
  const drinkItems = menuItems.filter(item => item.category === "drinks");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Cart />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-black/50 text-white">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative text-center space-y-4 p-4">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to Bistro & Bar</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Experience fine dining and crafted cocktails in an elegant atmosphere
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <MenuSection title="Food Menu" items={foodItems} />
        <MenuSection title="Drinks Menu" items={drinkItems} />
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