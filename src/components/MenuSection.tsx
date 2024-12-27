import { MenuItemCard } from "./MenuItemCard";
import { MenuItem } from "@/types";

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

export const MenuSection = ({ title, items }: MenuSectionProps) => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-serif font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};