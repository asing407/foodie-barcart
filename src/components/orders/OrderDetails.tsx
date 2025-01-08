import { format } from "date-fns";
import { OrderItem, MenuItem } from "@/types";

interface OrderDetailsProps {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  status_updates: { status: string; created_at: string; notes: string | null }[];
}

export const OrderDetails = ({ order_items, status_updates }: OrderDetailsProps) => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <h4 className="font-semibold">Status Updates</h4>
      <div className="space-y-1">
        {status_updates.map((update, index) => (
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
        {order_items.map((item) => (
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
);