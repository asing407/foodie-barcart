import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESTAURANT_INFO = {
  name: "The Alchemy Bar & Restaurant",
  address: "123 Culinary Street",
  city: "Foodville",
  state: "GA",
  zip: "30301",
  phone: "(555) 123-4567",
  email: "info@alchemybar.com",
  website: "www.alchemybar.com",
  taxRate: 0.08,
  serviceCharge: 0.10
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price_at_time,
          menu_item:menu_items (
            name,
            description
          )
        ),
        status_updates (
          status,
          payment_status,
          created_at,
          notes
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const latestStatus = order.status_updates[order.status_updates.length - 1];
    const orderCreatedAt = new Date(order.created_at);
    
    // Find the "received" status update to calculate serving time
    const receivedStatus = order.status_updates.find(update => update.status === 'received');
    const servingTime = receivedStatus 
      ? Math.round((new Date(receivedStatus.created_at).getTime() - orderCreatedAt.getTime()) / 1000 / 60)
      : null;

    const subtotal = order.total_amount;
    const tax = subtotal * RESTAURANT_INFO.taxRate;
    const serviceCharge = subtotal * RESTAURANT_INFO.serviceCharge;
    const total = subtotal + tax + serviceCharge;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .restaurant-info {
              margin-bottom: 30px;
              text-align: center;
              color: #666;
            }
            .items { 
              margin: 20px 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 5px 0;
            }
            .item-details {
              flex: 1;
            }
            .item-price {
              text-align: right;
              min-width: 80px;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin: 5px 0;
            }
            .total-label {
              margin-right: 20px;
            }
            .grand-total {
              font-size: 1.2em;
              font-weight: bold;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #eee;
            }
            .payment-info {
              margin-top: 30px;
              text-align: center;
              padding: 20px;
              background-color: ${latestStatus.payment_status === 'success' ? '#f0fff4' : '#fff5f5'};
              border-radius: 8px;
            }
            .order-info {
              margin-top: 30px;
              text-align: center;
              padding: 20px;
              background-color: #f7f7f7;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
          </style>
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
            <p>Order #${order.id}</p>
            <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
            <p>Time: ${new Date(order.created_at).toLocaleTimeString()}</p>
          </div>

          <div class="items">
            ${order.order_items.map(item => `
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

          <div class="payment-info">
            <h3>Payment Status: ${latestStatus.payment_status.toUpperCase()}</h3>
            <p>Transaction Date: ${new Date(latestStatus.created_at).toLocaleString()}</p>
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
    `

    const receiptFileName = `receipt-${orderId}.html`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(receiptFileName, receiptHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload receipt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { error: receiptError } = await supabase
      .from('receipts')
      .insert({
        order_id: orderId,
        file_path: receiptFileName
      })

    if (receiptError) {
      console.error('Error saving receipt record:', receiptError);
      return new Response(
        JSON.stringify({ error: 'Failed to save receipt record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Receipt generated successfully',
        receiptPath: receiptFileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})