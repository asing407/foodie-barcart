import { format } from "date-fns";
import { OrderItem, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrderDetailsProps {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  status_updates: { status: string; created_at: string; notes: string | null }[];
  orderId: string;
}

export const OrderDetails = ({ order_items, status_updates, orderId }: OrderDetailsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReceipt = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { orderId }
      });

      if (error) throw error;

      toast({
        title: "Receipt Generated",
        description: "Your receipt is ready to download.",
      });

      // Automatically trigger download
      if (data.receiptPath) {
        await downloadReceipt(data.receiptPath);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReceipt = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download receipt. Please try again.",
      });
    }
  };

  return (
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
      <div className="pt-4">
        <Button
          onClick={generateReceipt}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>Generating Receipt...</>
          ) : (
            <>
              <FileText className="mr-2" />
              Generate & Download Receipt
            </>
          )}
        </Button>
      </div>
    </div>
  );
};