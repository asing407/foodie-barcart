import { receiptStyles } from './styles';
import { RESTAURANT_INFO } from './config';
import { calculateTotals, formatDate, calculateServingTime } from './utils';

interface OrderItem {
  quantity: number;
  price_at_time: number;
  menu_item: {
    name: string;
    description: string;
  };
}

interface StatusUpdate {
  status: string;
  payment_status: string;
  created_at: string;
  notes: string | null;
}

interface ReceiptData {
  orderId: string;
  orderCreatedAt: Date;
  orderItems: OrderItem[];
  statusUpdates: StatusUpdate[];
  subtotal: number;
}

export const generateReceiptHtml = (data: ReceiptData) => {
  const { orderId, orderCreatedAt, orderItems, statusUpdates, subtotal } = data;
  const latestStatus = statusUpdates[statusUpdates.length - 1];
  const receivedStatus = statusUpdates.find(update => update.status === 'received');
  const servingTime = calculateServingTime(
    orderCreatedAt,
    receivedStatus ? new Date(receivedStatus.created_at) : null
  );
  const { tax, serviceCharge, total } = calculateTotals(subtotal);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${receiptStyles}</style>
      </head>
      <body>
        <div class="header">
          <h1>${RESTAURANT_INFO.name}</h1>
          <div class="restaurant-info">
            <p>${RESTAURANT_INFO.address}</p>
            <p>${RESTAURANT_INFO.city}, ${RESTAURANT_INFO.state} ${RESTAURANT_INFO.zip}</p>
            <p>Phone: ${RESTAURANT_INFO.phone}</p>
            <p>Email: ${RESTAURANT_INFO.email}</p>
            <p>${RESTAURANT_INFO.website}</p>
          </div>
        </div>

        <div>
          <h2>Receipt</h2>
          <p>Order #${orderId}</p>
          <p>Date: ${formatDate(orderCreatedAt)}</p>
        </div>

        <div class="items">
          ${orderItems.map(item => `
            <div class="item">
              <div class="item-details">
                <strong>${item.quantity}x ${item.menu_item.name}</strong>
                <div style="color: #666; font-size: 0.9em;">${item.menu_item.description}</div>
              </div>
              <div class="item-price">$${(item.price_at_time * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax (${(RESTAURANT_INFO.taxRate * 100).toFixed(0)}%):</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Service Charge (${(RESTAURANT_INFO.serviceCharge * 100).toFixed(0)}%):</span>
            <span>$${serviceCharge.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span class="total-label">Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="order-info">
          <h3>Order Details</h3>
          ${servingTime !== null 
            ? `<p>Order was served in ${servingTime} minutes</p>`
            : '<p>Order serving time not available</p>'
          }
          <p>Order Status: ${latestStatus.status}</p>
          ${latestStatus.notes ? `<p>Feedback: ${latestStatus.notes}</p>` : ''}
        </div>

        <div class="payment-info" style="background-color: ${
          latestStatus.payment_status === 'success' ? '#f0fff4' : '#fff5f5'
        }">
          <h3>Payment Status: ${latestStatus.payment_status.toUpperCase()}</h3>
          <p>Transaction Date: ${formatDate(new Date(latestStatus.created_at))}</p>
          ${latestStatus.payment_status === 'success' 
            ? '<p>Payment completed successfully</p>' 
            : '<p>Payment pending</p>'}
        </div>

        <div class="footer">
          <p>Thank you for dining with us!</p>
          <p>Please visit us again soon.</p>
        </div>
      </body>
    </html>
  `;
};