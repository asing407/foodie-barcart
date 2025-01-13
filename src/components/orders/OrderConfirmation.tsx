import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { Timer, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrderConfirmationProps {
  orderId: string;
  itemCount: number;
  onOrderReceived: () => void;
}

export const OrderConfirmation = ({ orderId, itemCount, onOrderReceived }: OrderConfirmationProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(itemCount * 5 * 60); // 5 minutes per item in seconds
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [hasConfirmedReceipt, setHasConfirmedReceipt] = useState(false);
  const { toast } = useToast();

  const estimatedTime = new Date();
  estimatedTime.setMinutes(estimatedTime.getMinutes() + (itemCount * 5));

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsAlertOpen(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 60) { // 1 minute warning
      toast({
        title: "Order Update",
        description: "Your order will be ready in 1 minute!",
      });
    }
  }, [timeRemaining, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((itemCount * 5 * 60 - timeRemaining) / (itemCount * 5 * 60)) * 100;

  const handleConfirmReceipt = () => {
    setHasConfirmedReceipt(true);
    onOrderReceived();
    toast({
      title: "Order Received",
      description: "Thank you for confirming your order receipt!",
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Thank you for your order! 🍽️</h3>
        <p className="text-sm text-gray-600">
          Your order #{orderId} has been confirmed and is being prepared.
        </p>
        <p className="text-sm text-gray-600">
          Based on your {itemCount} items, estimated serving time is {itemCount * 5} minutes.
        </p>
        <p className="text-sm font-medium">
          Expected delivery by: {format(estimatedTime, 'h:mm a')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Time remaining: {formatTime(timeRemaining)}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-600">
            You'll receive a notification when your order is ready
          </span>
        </div>
      </div>

      <Button
        onClick={handleConfirmReceipt}
        disabled={hasConfirmedReceipt}
        className="w-full"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        {hasConfirmedReceipt ? "Order Receipt Confirmed" : "Confirm Order Received"}
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Timer Expired</AlertDialogTitle>
            <AlertDialogDescription>
              The estimated delivery time for your order has passed. You are eligible for a refund of your credits.
              Our staff will process this automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};