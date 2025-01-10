import { useState } from "react";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItem } from "@/types";
import { Button } from "./ui/button";

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  type: "food" | "drinks";
}

export const MenuSection = ({ title, items, type }: MenuSectionProps) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (type === "food") return item.dietary_type === filter;
    return item.drink_type === filter;
  });

  return (
    <section className="py-12">
      <h2 className="text-3xl font-serif font-bold mb-8 text-center">{title}</h2>
      
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {type === "food" ? (
          <>
            <Button
              variant={filter === "veg" ? "default" : "outline"}
              onClick={() => setFilter("veg")}
            >
              Vegetarian
            </Button>
            <Button
              variant={filter === "non-veg" ? "default" : "outline"}
              onClick={() => setFilter("non-veg")}
            >
              Non-Vegetarian
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={filter === "non-alcoholic" ? "default" : "outline"}
              onClick={() => setFilter("non-alcoholic")}
            >
              Non-Alcoholic
            </Button>
            <Button
              variant={filter === "alcoholic" ? "default" : "outline"}
              onClick={() => setFilter("alcoholic")}
            >
              Alcoholic
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};