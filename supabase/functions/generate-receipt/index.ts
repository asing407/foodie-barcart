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
  website: "www.alchemybar.com"
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

    // Fetch order details with payment status
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
          created_at
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details', details: orderError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const latestStatus = order.status_updates[order.status_updates.length - 1];
    const paymentStatus = latestStatus?.payment_status || 'pending';
    const cardLastFour = paymentStatus === 'success' ? '4242' : ''; // In a real app, fetch this from your payment provider

    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px;
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
            }
            .total { 
              margin-top: 20px;
              font-weight: bold;
              text-align: right;
              font-size: 1.2em;
            }
            .payment-info {
              margin-top: 30px;
              text-align: center;
              padding: 20px;
              background-color: ${paymentStatus === 'success' ? '#f0fff4' : '#fff5f5'};
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
          </div>

          <div class="items">
            ${order.order_items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.menu_item.name}</span>
                <span>$${(item.price_at_time * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="total">
            Total: $${order.total_amount.toFixed(2)}
          </div>

          <div class="payment-info">
            <h3>Payment Status: ${paymentStatus.toUpperCase()}</h3>
            ${paymentStatus === 'success' ? `
              <p>Payment completed successfully</p>
              <p>Card ending in: ${cardLastFour}</p>
            ` : `
              <p>Payment pending</p>
            `}
          </div>

          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Please visit us again soon.</p>
          </div>
        </body>
      </html>
    `

    // Upload receipt to storage
    const receiptFileName = `receipt-${orderId}.html`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(receiptFileName, receiptHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload receipt', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Save receipt record
    const { error: receiptError } = await supabase
      .from('receipts')
      .insert({
        order_id: orderId,
        file_path: receiptFileName
      })

    if (receiptError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save receipt record', details: receiptError }),
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
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})