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

interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  status_updates: { status: string; created_at: string; notes: string | null }[];
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
        notes
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return orders;
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
        No orders found. Start shopping to see your order history!
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
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Status Updates</h4>
                  <div className="space-y-1">
                    {order.status_updates.map((update, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{update.status}</span> - 
                        {format(new Date(update.created_at), 'PPp')}
                        {update.notes && <p className="text-gray-600 ml-4">{update.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.menu_item.name}
                        </span>
                        <span>${item.price_at_time * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};