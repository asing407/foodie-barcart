import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { OrderDetails } from "./orders/OrderDetails";

interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  status_updates: { 
    status: string; 
    created_at: string; 
    notes: string | null;
    payment_status: string;
  }[];
}

const fetchOrders = async (): Promise<OrderWithItems[]> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        menu_item: menu_items (*)
      ),
      status_updates (
        status,
        created_at,
        notes,
        payment_status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return orders.map(order => ({
    ...order,
    order_items: order.order_items.map(item => ({
      ...item,
      menu_item: {
        ...item.menu_item,
        category: item.menu_item.category as "food" | "drinks",
        dietary_type: item.menu_item.dietary_type as "veg" | "non-veg" | undefined,
        drink_type: item.menu_item.drink_type as "alcoholic" | "non-alcoholic" | undefined
      }
    }))
  }));
};

export const OrderHistory = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading orders. Please try again later.
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No orders found. Start ordering to see your order history!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      <Accordion type="single" collapsible className="w-full">
        {orders.map((order) => (
          <AccordionItem key={order.id} value={order.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between w-full px-4">
                <span>
                  Order #{order.id.slice(0, 8)} - {format(new Date(order.created_at), 'PPp')}
                </span>
                <span className="font-semibold">${order.total_amount}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <OrderDetails 
                order_items={order.order_items}
                status_updates={order.status_updates}
                orderId={order.id}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};