import { RESTAURANT_INFO } from './config';

export const calculateTotals = (subtotal: number) => {
  const tax = subtotal * RESTAURANT_INFO.taxRate;
  const serviceCharge = subtotal * RESTAURANT_INFO.serviceCharge;
  const total = subtotal + tax + serviceCharge;
  
  return { tax, serviceCharge, total };
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateServingTime = (orderCreatedAt: Date, receivedStatusDate: Date | null) => {
  if (!receivedStatusDate) return null;
  return Math.round((receivedStatusDate.getTime() - orderCreatedAt.getTime()) / 1000 / 60);
};