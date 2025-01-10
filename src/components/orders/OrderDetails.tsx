import { format } from "date-fns";
import { OrderItem, MenuItem } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface OrderDetailsProps {
  order_items: (OrderItem & { menu_item: MenuItem })[];
  status_updates: { 
    status: string; 
    created_at: string; 
    notes: string | null;
    payment_status: "pending" | "success" | "failed";
  }[];
  orderId: string;
}

export const OrderDetails = ({ order_items, status_updates, orderId }: OrderDetailsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const latestStatus = status_updates[status_updates.length - 1];

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {latestStatus?.payment_status === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Your order will be served at your table soon.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h4 className="font-semibold">Status Updates</h4>
        <div className="space-y-2">
          {status_updates.map((update, index) => (
            <div key={index} className="text-sm flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="font-medium">{update.status}</span>
              <Badge 
                className={getPaymentStatusColor(update.payment_status)}
              >
                Payment: {update.payment_status}
              </Badge>
              <span className="text-gray-500">
                {format(new Date(update.created_at), 'PPp')}
              </span>
              {update.notes && (
                <span className="text-gray-600 ml-2">
                  Note: {update.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Order Items</h4>
        <div className="space-y-2">
          {order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">
                  {item.quantity}x {item.menu_item.name}
                </span>
                <p className="text-gray-600 text-xs">{item.menu_item.description}</p>
              </div>
              <span className="font-medium">
                ${(item.price_at_time * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={generateReceipt}
          disabled={isGenerating || latestStatus?.payment_status !== 'success'}
          className="w-full"
        >
          {isGenerating ? (
            "Generating Receipt..."
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {latestStatus?.payment_status === 'success' 
                ? "Generate & Download Receipt" 
                : "Receipt available after payment"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};